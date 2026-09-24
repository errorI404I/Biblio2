import { authenticateNodeApiKey } from "@/lib/api/publicApiAuth";
import { apiData, apiError, readJsonObject } from "@/lib/api/publicApiResponse";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ nodeId: string }> };
const COLOR = /^#[0-9a-fA-F]{6}$/;

function validateTheme(body: Record<string, unknown>) {
  const allowed = new Set(["version", "preset", "primaryColor", "secondaryColor", "logoUrl", "bannerUrl", "cardStyle"]);
  if (Object.keys(body).some((key) => !allowed.has(key))) return false;
  if (body.version !== undefined && (!Number.isInteger(body.version) || Number(body.version) < 1)) return false;
  for (const key of ["preset", "logoUrl", "bannerUrl", "cardStyle"] as const) if (body[key] !== undefined && body[key] !== null && typeof body[key] !== "string") return false;
  for (const key of ["primaryColor", "secondaryColor"] as const) if (body[key] !== undefined && (typeof body[key] !== "string" || !COLOR.test(body[key]))) return false;
  for (const key of ["logoUrl", "bannerUrl"] as const) if (typeof body[key] === "string" && !/^https:\/\//.test(body[key])) return false;
  return true;
}

export async function GET(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authenticateNodeApiKey({ request, nodeId, requiredScope: "theme:read" });
  if (!auth.ok) return apiError(auth.error, auth.status);
  const { data, error } = await createAdminClient().from("nodes").select("theme_config").eq("id", nodeId).is("deleted_at", null).maybeSingle();
  if (error) return apiError("Could not read theme", 500);
  if (!data) return apiError("Node not found", 404);
  return apiData(data.theme_config ?? {});
}

export async function PUT(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authenticateNodeApiKey({ request, nodeId, requiredScope: "theme:write" });
  if (!auth.ok) return apiError(auth.error, auth.status);
  const body = await readJsonObject(request);
  if (!body || !validateTheme(body)) return apiError("Invalid theme configuration", 400);
  const theme = { version: 1, ...body };
  const { data, error } = await createAdminClient().from("nodes").update({ theme_config: theme }).eq("id", nodeId).is("deleted_at", null).select("theme_config").maybeSingle();
  if (error) return apiError("Could not update theme", 500);
  if (!data) return apiError("Node not found", 404);
  return apiData(data.theme_config);
}
