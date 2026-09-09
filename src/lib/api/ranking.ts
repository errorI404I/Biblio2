import { createClient } from "@/lib/supabase/server";
import type { NodeRankingEntry } from "@/types/ranking";

type NodeRankingRpcRow = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_seconds: number | string;
};

export async function getNodeRanking(
  nodeId: string
): Promise<NodeRankingEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_node_ranking",
    {
      p_node_id: nodeId,
    }
  );

  if (error) {
    console.error(
      "Error loading node ranking:",
      error
    );

    return [];
  }

  const rows = (data ?? []) as NodeRankingRpcRow[];

  return rows.map((entry) => ({
    userId: entry.user_id,
    displayName: entry.display_name,
    avatarUrl: entry.avatar_url,
    totalSeconds: Number(entry.total_seconds),
  }));
}