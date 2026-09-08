import { createClient } from "@/lib/supabase/server";
import type { NodeScheduleInterval } from "@/types/schedule";
import type {
  NodeScheduleStatus,
} from "@/types/schedule";

export async function getNodeScheduleIntervals(
  nodeId: string
): Promise<NodeScheduleInterval[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("node_schedule_intervals")
    .select(`
      id,
      node_id,
      day_of_week,
      start_time,
      end_time,
      created_at,
      updated_at
    `)
    .eq("node_id", nodeId)
    .order("day_of_week")
    .order("start_time");

  if (error) {
    console.error("Error loading schedules:", error);
    return [];
  }

  return data.map((interval) => ({
    id: interval.id,
    nodeId: interval.node_id,
    dayOfWeek: interval.day_of_week,
    startTime: interval.start_time,
    endTime: interval.end_time,
    createdAt: interval.created_at,
    updatedAt: interval.updated_at,
  }));
}
export async function getNodeScheduleStatus(
  nodeId: string
): Promise<NodeScheduleStatus | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_node_schedule_status",
    {
      p_node_id: nodeId,
    }
  );

  if (error) {
    console.error("Error loading node schedule status:", error);
    return null;
  }

  const status = data?.[0];

  if (!status) {
    return null;
  }

  return {
    isOpen: status.is_open,
    currentIntervalStart:
      status.current_interval_start,
    currentIntervalEnd:
      status.current_interval_end,
    nextOpenAt:
      status.next_open_at,
  };
}
