import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    nodeId: string;
    seasonId: string;
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
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  return `${hours} h ${minutes} min`;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const {
    nodeId,
    seasonId,
  } = await context.params;

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

  const { data: membership } =
    await supabase
      .from("node_memberships")
      .select("role")
      .eq("node_id", nodeId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (
    !membership ||
    membership.role !== "ADMIN"
  ) {
    return NextResponse.json(
      { error: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const { data: node } =
    await supabase
      .from("nodes")
      .select("name")
      .eq("id", nodeId)
      .maybeSingle();

  if (!node) {
    return NextResponse.json(
      { error: "NODE_NOT_FOUND" },
      { status: 404 }
    );
  }

  const { data: season } =
    await supabase
      .from("node_seasons")
      .select(`
        id,
        name,
        status,
        started_at,
        ended_at
      `)
      .eq("id", seasonId)
      .eq("node_id", nodeId)
      .maybeSingle();

  if (
    !season ||
    season.status !== "CLOSED"
  ) {
    return NextResponse.json(
      { error: "CLOSED_SEASON_NOT_FOUND" },
      { status: 404 }
    );
  }

  const {
    data: rankingData,
    error: rankingError,
  } = await supabase.rpc(
    "get_season_ranking",
    {
      p_node_id: nodeId,
      p_season_id: seasonId,
    }
  );

  if (rankingError) {
    console.error(
      "Error loading historical ranking:",
      rankingError
    );

    return NextResponse.json(
      { error: "RANKING_LOAD_FAILED" },
      { status: 500 }
    );
  }

  const ranking =
    (rankingData ?? []) as RankingRow[];

  const workbook =
    new ExcelJS.Workbook();

  const worksheet =
    workbook.addWorksheet("Ranking histórico");

  worksheet.addRow([
    "Nodo",
    node.name,
  ]);

  worksheet.addRow([
    "Temporada",
    season.name,
  ]);

  worksheet.addRow([
    "Inicio",
    new Date(
      season.started_at
    ).toLocaleString("es-AR"),
  ]);

  worksheet.addRow([
    "Cierre",
    season.ended_at
      ? new Date(
          season.ended_at
        ).toLocaleString("es-AR")
      : "",
  ]);

  worksheet.addRow([]);

  worksheet.addRow([
    "Posición",
    "Nombre",
    "Tiempo total",
    "Racha",
  ]);

  ranking.forEach((entry, index) => {
    worksheet.addRow([
      index + 1,
      entry.display_name,
      formatDuration(
        Number(entry.total_seconds)
      ),
      entry.streak,
    ]);
  });

  worksheet.columns = [
    { width: 12 },
    { width: 30 },
    { width: 20 },
    { width: 12 },
  ];

  worksheet.getRow(6).font = {
    bold: true,
  };

  const buffer =
    await workbook.xlsx.writeBuffer();

  const safeSeasonName =
    season.name
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 40);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

      "Content-Disposition":
        `attachment; filename="ranking_${safeSeasonName}.xlsx"`,
    },
  });
}