import { createClient } from "@/lib/supabase/server";
import type { NodeRole } from "@/types/membership";
import { notFound } from "next/navigation";

export type NodePermission = {
  nodeId: string;
  role: NodeRole;
};

export async function getNodePermission(
  nodeId: string
): Promise<NodePermission | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("node_memberships")
    .select(`
      node_id,
      role
    `)
    .eq("node_id", nodeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading node permission:",
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return {
    nodeId: data.node_id,
    role: data.role,
  };
}
export async function isNodeMember(
  nodeId: string
): Promise<boolean> {
  const permission =
    await getNodePermission(nodeId);

  return permission !== null;
}
export async function isNodeAdmin(
  nodeId: string
): Promise<boolean> {
  const permission =
    await getNodePermission(nodeId);

  return permission?.role === "ADMIN";
}
export async function requireNodeMember(
  nodeId: string
): Promise<NodePermission> {
  const permission =
    await getNodePermission(nodeId);

  if (!permission) {
    notFound();
  }

  return permission;
}

export async function requireNodeAdmin(
  nodeId: string
): Promise<NodePermission> {
  const permission =
    await getNodePermission(nodeId);

  if (
    !permission ||
    permission.role !== "ADMIN"
  ) {
    notFound();
  }

  return permission;
}