import { authenticateNodeApiKey } from "@/lib/api/publicApiAuth";
import { apiData, apiError, readJsonObject } from "@/lib/api/publicApiResponse";
import { createAdminClient } from "@/lib/supabase/admin";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
type Context = { params: Promise<{ nodeId: string }> };

export async function GET(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authenticateNodeApiKey({ request, nodeId, requiredScope: "schedule_exceptions:read" });
  if (!auth.ok) return apiError(auth.error, auth.status);
  const { data, error } = await createAdminClient().from("node_schedule_exceptions").select("id, exception_date, is_closed, start_time, end_time, reason, created_at, updated_at").eq("node_id", nodeId).order("exception_date");
  if (error) return apiError("Could not read schedule exceptions", 500);
  return apiData((data ?? []).map((item) => ({ id: item.id, date: item.exception_date, isClosed: item.is_closed, startTime: item.start_time, endTime: item.end_time, reason: item.reason, createdAt: item.created_at, updatedAt: item.updated_at })));
}

export async function PUT(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authenticateNodeApiKey({ request, nodeId, requiredScope: "schedule_exceptions:write" });
  if (!auth.ok) return apiError(auth.error, auth.status);
  const body = await readJsonObject(request);
  const date = body?.date;
  const isClosed = body?.isClosed;
  const start = body?.startTime;
  const end = body?.endTime;
  const reason = body?.reason;
  const validOpenTimes = isClosed === true || (typeof start === "string" && typeof end === "string" && TIME_PATTERN.test(start) && TIME_PATTERN.test(end) && start < end);
  if (typeof date !== "string" || !DATE_PATTERN.test(date) || typeof isClosed !== "boolean" || !validOpenTimes || (reason !== undefined && reason !== null && typeof reason !== "string")) return apiError("Invalid schedule exception", 400);
  const { data, error } = await createAdminClient().from("node_schedule_exceptions").upsert({ node_id: nodeId, exception_date: date, is_closed: isClosed, start_time: isClosed ? null : start, end_time: isClosed ? null : end, reason: typeof reason === "string" ? reason.slice(0, 300) : null, updated_at: new Date().toISOString() }, { onConflict: "node_id,exception_date" }).select("id, exception_date, is_closed, start_time, end_time, reason, created_at, updated_at").single();
  if (error) return apiError("Could not save schedule exception", 400);
  return apiData(data);
}

export async function DELETE(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authenticateNodeApiKey({ request, nodeId, requiredScope: "schedule_exceptions:write" });
  if (!auth.ok) return apiError(auth.error, auth.status);
  const date = new URL(request.url).searchParams.get("date");
  if (!date || !DATE_PATTERN.test(date)) return apiError("Invalid exception date", 400);
  const { data, error } = await createAdminClient().from("node_schedule_exceptions").delete().eq("node_id", nodeId).eq("exception_date", date).select("id").maybeSingle();
  if (error) return apiError("Could not delete schedule exception", 400);
  if (!data) return apiError("Schedule exception not found", 404);
  return apiData({ deleted: true });
}
