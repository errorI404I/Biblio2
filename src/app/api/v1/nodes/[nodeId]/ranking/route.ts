import { authenticateNodeApiKey } from "@/lib/api/publicApiAuth";
import { apiData, apiError } from "@/lib/api/publicApiResponse";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ nodeId: string }> };

export async function GET(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authenticateNodeApiKey({ request, nodeId, requiredScope: "ranking:read" });
  if (!auth.ok) return apiError(auth.error, auth.status);
  const { data, error } = await createAdminClient().rpc("get_node_ranking_with_streak", { p_node_id: nodeId });
  if (error) return apiError("Could not read ranking", 500);
  return apiData((data ?? []).map((entry: Record<string, unknown>, index: number) => ({ position: index + 1, userId: entry.user_id, displayName: entry.display_name, avatarUrl: entry.avatar_url ?? null, totalSeconds: Number(entry.total_seconds ?? 0), streak: Number(entry.streak ?? 0) })));
}
