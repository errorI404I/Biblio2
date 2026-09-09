import { createClient } from "@/lib/supabase/server";

export type ActiveSeason = {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string | null;
};

export async function getActiveNodeSeason(
  nodeId: string
): Promise<ActiveSeason | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("node_seasons")
    .select(`
      id,
      name,
      started_at,
      ended_at
    `)
    .eq("node_id", nodeId)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading active season:",
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    startedAt: data.started_at,
    endedAt: data.ended_at,
  };
}
export type ClosedSeason = {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string;
};

export async function getClosedNodeSeasons(
  nodeId: string
): Promise<ClosedSeason[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("node_seasons")
    .select(`
      id,
      name,
      started_at,
      ended_at
    `)
    .eq("node_id", nodeId)
    .eq("status", "CLOSED")
    .order("ended_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading closed seasons:",
      error
    );

    return [];
  }

  return (data ?? [])
    .filter((season) => season.ended_at !== null)
    .map((season) => ({
      id: season.id,
      name: season.name,
      startedAt: season.started_at,
      endedAt: season.ended_at!,
    }));
}