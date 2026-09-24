import { randomBytes } from "crypto";
import { authenticateNodeApiKey } from "@/lib/api/publicApiAuth";
import { apiData, apiError, readJsonObject } from "@/lib/api/publicApiResponse";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ nodeId: string }> };

export async function GET(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authenticateNodeApiKey({ request, nodeId, requiredScope: "invitations:read" });
  if (!auth.ok) return apiError(auth.error, auth.status);
  const { data, error } = await createAdminClient().from("node_invitations").select("id, code, created_by_user_id, status, expires_at, created_at").eq("node_id", nodeId).order("created_at", { ascending: false });
  if (error) return apiError("Could not read invitations", 500);
  return apiData((data ?? []).map((item) => ({ id: item.id, code: item.code, createdByUserId: item.created_by_user_id, status: item.status, expiresAt: item.expires_at, createdAt: item.created_at })));
}

export async function POST(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authenticateNodeApiKey({ request, nodeId, requiredScope: "invitations:write" });
  if (!auth.ok) return apiError(auth.error, auth.status);
  const body = await readJsonObject(request);
  const action = body?.action;
  const supabase = createAdminClient();
  if (action === "revoke") {
    const { error } = await supabase.from("node_invitations").update({ status: "REVOKED" }).eq("node_id", nodeId).eq("status", "ACTIVE");
    if (error) return apiError("Could not revoke invitations", 500);
    return apiData({ revoked: true });
  }
  if (action !== "create") return apiError("Action must be create or revoke", 400);
  const expiresAt = body?.expiresAt;
  if (expiresAt !== undefined && expiresAt !== null && (typeof expiresAt !== "string" || Number.isNaN(Date.parse(expiresAt)))) return apiError("Invalid expiration date", 400);
  const { data: adminMembership } = await supabase.from("node_memberships").select("user_id").eq("node_id", nodeId).eq("role", "ADMIN").order("created_at").limit(1).maybeSingle();
  if (!adminMembership) return apiError("Node administrator not found", 409);
  await supabase.from("node_invitations").update({ status: "REVOKED" }).eq("node_id", nodeId).eq("status", "ACTIVE");
  const { data, error } = await supabase.from("node_invitations").insert({ node_id: nodeId, code: randomBytes(18).toString("base64url"), created_by_user_id: adminMembership.user_id, status: "ACTIVE", expires_at: expiresAt ?? null }).select("id, code, created_by_user_id, status, expires_at, created_at").single();
  if (error) return apiError("Could not create invitation", 500);
  return apiData(data, 201);
}
