import { createClient } from "@/lib/supabase/server";

export async function getUserNodeStreak(
  nodeId: string
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_user_node_streak",
    {
      p_node_id: nodeId,
    }
  );

  if (error) {
    console.error(
      "Error loading user streak:",
      error
    );

    return 0;
  }

  return Number(data ?? 0);
}