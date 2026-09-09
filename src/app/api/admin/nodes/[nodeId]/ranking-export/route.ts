import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    nodeId: string;
  }>;
};

type RankingRow = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_seconds: number | string;
  streak: number;
};

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours} h ${minutes} min`;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { nodeId } = await context.params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  const { data: membership, error: membershipError } =
    await supabase
      .from("node_memberships")
      .select("role")
      .eq("node_id", nodeId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (
    membershipError ||
    !membership ||
    membership.role !== "ADMIN"
  ) {
    return NextResponse.json(
      { error: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const { data: node, error: nodeError } =
    await supabase
      .from("nodes")
      .select("name")
      .eq("id", nodeId)
      .maybeSingle();

  if (nodeError || !node) {
    return NextResponse.json(
      { error: "NODE_NOT_FOUND" },
      { status: 404 }
    );
  }

  const { data: season, error: seasonError } =
    await supabase
      .from("node_seasons")
      .select("id, name, started_at")
      .eq("node_id", nodeId)
      .eq("status", "ACTIVE")
      .maybeSingle();

  if (seasonError || !season) {
    return NextResponse.json(
      { error: "ACTIVE_SEASON_NOT_FOUND" },
      { status: 404 }
    );
  }

  const { data: rankingData, error: rankingError } =
    await supabase.rpc(
      "get_node_ranking_with_streak",
      {
        p_node_id: nodeId,
      }
    );

  if (rankingError) {
    console.error(
      "Error loading ranking export:",
      rankingError
    );

    return NextResponse.json(
      { error: "RANKING_LOAD_FAILED" },
      { status: 500 }
    );
  }

  const ranking =
    (rankingData ?? []) as RankingRow[];

  const workbook = new ExcelJS.Workbook();

  const worksheet =
    workbook.addWorksheet("Ranking");

  worksheet.addRow([
    "Nodo",
    node.name,
  ]);

  worksheet.addRow([
    "Temporada",
    season.name,
  ]);

  worksheet.addRow([
    "Fecha de exportación",
    new Date().toLocaleString("es-AR"),
  ]);

  worksheet.addRow([]);

  worksheet.addRow([
    "Posición",
    "Nombre",
    "Tiempo total",
    "Racha",
  ]);

  ranking.forEach((entry, index) => {
    const totalSeconds =
      Number(entry.total_seconds);

    worksheet.addRow([
      index + 1,
      entry.display_name,
      formatDuration(totalSeconds),
      entry.streak,
    ]);
  });

  worksheet.columns = [
    { width: 12 },
    { width: 30 },
    { width: 20 },
    { width: 12 },
  ];

  const headerRow =
    worksheet.getRow(5);

  headerRow.font = {
    bold: true,
  };

  const buffer =
    await workbook.xlsx.writeBuffer();

  const safeNodeName =
    node.name
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 40);

  const fileName =
    `ranking_${safeNodeName}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        `attachment; filename="${fileName}"`,
    },
  });
}