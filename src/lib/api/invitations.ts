import { createClient } from "@/lib/supabase/server";
import type { NodeInvitation } from "@/types/invitation";

export async function getActiveNodeInvitation(
  nodeId: string
): Promise<NodeInvitation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_active_node_invitation",
    {
      p_node_id: nodeId,
    }
  );

  if (error) {
    console.error(
      "Error loading invitation:",
      error
    );

    return null;
  }

  const invitation = data?.[0];

  if (!invitation) {
    return null;
  }

  return {
    id: invitation.id,
    nodeId: invitation.node_id,
    code: invitation.code,
    createdByUserId:
      invitation.created_by_user_id,
    status: invitation.status,
    expiresAt: invitation.expires_at,
    createdAt: invitation.created_at,
  };
}