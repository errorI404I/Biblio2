import { NextResponse } from "next/server";

import { authenticateNodeApiKey } from "@/lib/api/publicApiAuth";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    nodeId: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  const { nodeId } = await context.params;

  const auth = await authenticateNodeApiKey({
    request,
    nodeId,
    requiredScope: "node:read",
  });

  if (!auth.ok) {
    return NextResponse.json(
      {
        error: auth.error,
      },
      {
        status: auth.status,
      }
    );
  }

  const supabase = createAdminClient();

  const { data: node, error } = await supabase
    .from("nodes")
    .select(`
      id,
      name,
      description,
      is_active,
      latitude,
      longitude,
      radius_meters,
      timezone,
      grace_period_seconds,
      is_ranking_visible,
      deleted_at
    `)
    .eq("id", nodeId)
    .maybeSingle();

  if (error) {
    console.error(
      "Error reading node from API:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not read node",
      },
      {
        status: 500,
      }
    );
  }

  if (!node || node.deleted_at) {
    return NextResponse.json(
      {
        error: "Node not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    data: {
      id: node.id,
      name: node.name,
      description: node.description,

      isActive: node.is_active,

      location: {
        latitude: node.latitude,
        longitude: node.longitude,
        radiusMeters: node.radius_meters,
      },

      timezone: node.timezone,

      gracePeriodSeconds:
        node.grace_period_seconds,

      isRankingVisible:
        node.is_ranking_visible,
    },
  });
}