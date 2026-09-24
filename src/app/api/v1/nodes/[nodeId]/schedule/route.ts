import { authenticateNodeApiKey } from "@/lib/api/publicApiAuth";
import { apiData, apiError, readJsonObject } from "@/lib/api/publicApiResponse";
import { createAdminClient } from "@/lib/supabase/admin";

const DAYS = new Set(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]);
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
type Context = { params: Promise<{ nodeId: string }> };

async function authorize(request: Request, nodeId: string, write = false) {
  return authenticateNodeApiKey({ request, nodeId, requiredScope: write ? "schedule:write" : "schedule:read" });
}

export async function GET(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authorize(request, nodeId);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const { data, error } = await createAdminClient().from("node_schedule_intervals").select("id, day_of_week, start_time, end_time, created_at, updated_at").eq("node_id", nodeId).order("day_of_week").order("start_time");
  if (error) return apiError("Could not read schedule", 500);
  return apiData((data ?? []).map((item) => ({ id: item.id, dayOfWeek: item.day_of_week, startTime: item.start_time, endTime: item.end_time, createdAt: item.created_at, updatedAt: item.updated_at })));
}

export async function POST(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authorize(request, nodeId, true);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const body = await readJsonObject(request);
  const day = body?.dayOfWeek;
  const start = body?.startTime;
  const end = body?.endTime;
  if (typeof day !== "string" || !DAYS.has(day) || typeof start !== "string" || typeof end !== "string" || !TIME_PATTERN.test(start) || !TIME_PATTERN.test(end) || start >= end) return apiError("Invalid schedule interval", 400);
  const { data, error } = await createAdminClient().from("node_schedule_intervals").insert({ node_id: nodeId, day_of_week: day, start_time: start, end_time: end }).select("id, day_of_week, start_time, end_time, created_at, updated_at").single();
  if (error) return apiError("Could not create schedule interval", 400);
  return apiData(data, 201);
}

export async function PATCH(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authorize(request, nodeId, true);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const body = await readJsonObject(request);
  const id = body?.id;
  const day = body?.dayOfWeek;
  const start = body?.startTime;
  const end = body?.endTime;
  if (typeof id !== "string" || typeof day !== "string" || !DAYS.has(day) || typeof start !== "string" || typeof end !== "string" || !TIME_PATTERN.test(start) || !TIME_PATTERN.test(end) || start >= end) return apiError("Invalid schedule interval", 400);
  const { data, error } = await createAdminClient().from("node_schedule_intervals").update({ day_of_week: day, start_time: start, end_time: end }).eq("id", id).eq("node_id", nodeId).select("id, day_of_week, start_time, end_time, created_at, updated_at").maybeSingle();
  if (error) return apiError("Could not update schedule interval", 400);
  if (!data) return apiError("Schedule interval not found", 404);
  return apiData(data);
}

export async function DELETE(request: Request, { params }: Context) {
  const { nodeId } = await params;
  const auth = await authorize(request, nodeId, true);
  if (!auth.ok) return apiError(auth.error, auth.status);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return apiError("Missing interval id", 400);
  const { data, error } = await createAdminClient().from("node_schedule_intervals").delete().eq("id", id).eq("node_id", nodeId).select("id").maybeSingle();
  if (error) return apiError("Could not delete schedule interval", 400);
  if (!data) return apiError("Schedule interval not found", 404);
  return apiData({ deleted: true });
}
