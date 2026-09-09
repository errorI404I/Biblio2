import { createClient } from "@/lib/supabase/server";
import type { PresenceSession } from "@/types/session";

export type CurrentOpenPresenceSession = PresenceSession & {
  nodeName: string;
};

export async function getCurrentOpenPresenceSession():
  Promise<CurrentOpenPresenceSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("presence_sessions")
    .select(`
      id,
      user_id,
      node_id,
      season_id,
      status,
      started_at,
      ended_at,
      grace_period_started_at,
      end_reason,
      created_at,
      updated_at,
      nodes (
        name
      )
    `)
    .eq("user_id", user.id)
    .is("ended_at", null)
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading current presence session:",
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  const node = Array.isArray(data.nodes)
    ? data.nodes[0]
    : data.nodes;

  return {
    id: data.id,
    userId: data.user_id,
    nodeId: data.node_id,
    seasonId: data.season_id,
    status: data.status,
    startedAt: data.started_at,
    endedAt: data.ended_at,
    gracePeriodStartedAt:
      data.grace_period_started_at,
    endReason: data.end_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    nodeName: node?.name ?? "Nodo",
  };
}