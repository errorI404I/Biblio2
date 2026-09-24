import { authenticateNodeApiKey } from "@/lib/api/publicApiAuth";
import { apiData, apiError } from "@/lib/api/publicApiResponse";
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
    return apiError(auth.error, auth.status);
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

    return apiError("Could not read node", 500);
  }

  if (!node || node.deleted_at) {
    return apiError("Node not found", 404);
  }

  return apiData({
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
  });
}
