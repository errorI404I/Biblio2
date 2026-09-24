import { authenticateNodeApiKey } from "@/lib/api/publicApiAuth";
import { apiData, apiError } from "@/lib/api/publicApiResponse";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ nodeId: string }> };

export async function GET(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authenticateNodeApiKey({ request, nodeId, requiredScope: "presence:read" });
  if (!auth.ok) return apiError(auth.error, auth.status);
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit") ?? 50);
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
  let query = createAdminClient().from("presence_sessions").select("id, user_id, season_id, status, started_at, ended_at, grace_period_started_at, end_reason, created_at, updated_at").eq("node_id", nodeId).order("started_at", { ascending: false }).limit(limit);
  const before = url.searchParams.get("before");
  if (before) query = query.lt("started_at", before);
  const { data, error } = await query;
  if (error) return apiError("Could not read presence sessions", 500);
  return apiData((data ?? []).map((item) => ({ id: item.id, userId: item.user_id, seasonId: item.season_id, status: item.status, startedAt: item.started_at, endedAt: item.ended_at, gracePeriodStartedAt: item.grace_period_started_at, endReason: item.end_reason, createdAt: item.created_at, updatedAt: item.updated_at })));
}
