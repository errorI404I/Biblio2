import { createClient } from "@/lib/supabase/server";

export type NodeApiKey = {
  id: string;
  nodeId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export async function getNodeApiKeys(
  nodeId: string
): Promise<NodeApiKey[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("node_api_keys")
    .select(`
      id,
      node_id,
      name,
      key_prefix,
      scopes,
      created_at,
      last_used_at,
      revoked_at
    `)
    .eq("node_id", nodeId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `No se pudieron cargar las API keys: ${error.message}`
    );
  }

  return (data ?? []).map((key) => ({
    id: key.id,
    nodeId: key.node_id,
    name: key.name,
    keyPrefix: key.key_prefix,
    scopes: key.scopes ?? [],
    createdAt: key.created_at,
    lastUsedAt: key.last_used_at,
    revokedAt: key.revoked_at,
  }));
}