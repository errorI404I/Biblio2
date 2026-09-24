import { authenticateNodeApiKey } from "@/lib/api/publicApiAuth";
import { apiData, apiError } from "@/lib/api/publicApiResponse";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ nodeId: string }> };

export async function GET(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authenticateNodeApiKey({ request, nodeId, requiredScope: "members:read" });
  if (!auth.ok) return apiError(auth.error, auth.status);
  const { data, error } = await createAdminClient().from("node_memberships").select("id, user_id, role, joined_at, created_at, profiles(display_name, avatar_url)").eq("node_id", nodeId).order("created_at");
  if (error) return apiError("Could not read members", 500);
  return apiData((data ?? []).map((item) => { const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles; return { id: item.id, userId: item.user_id, role: item.role, displayName: profile?.display_name ?? "Usuario", avatarUrl: profile?.avatar_url ?? null, joinedAt: item.joined_at, createdAt: item.created_at }; }));
}
