import { createClient } from "@/lib/supabase/server";

import type {
  NodeInvitation,
  PublicNodeInvitation,
} from "@/types/invitation";

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
      "Error loading active invitation:",
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

export async function getInvitationByCode(
  code: string
): Promise<PublicNodeInvitation | null> {
  const supabase = await createClient();

  console.log("INVITATION CODE:", code);

  const { data, error } = await supabase.rpc(
    "get_invitation_by_code",
    {
      p_code: code,
    }
  );

  console.log("INVITATION DATA:", data);
  console.log("INVITATION ERROR:", error);

  if (error) {
    console.error(
      "Error loading public invitation:",
      error
    );

    return null;
  }

  const invitation = data?.[0];

  if (!invitation) {
    return null;
  }

  return {
    nodeId: invitation.node_id,
    nodeName: invitation.node_name,
    nodeDescription:
      invitation.node_description,
    expiresAt: invitation.expires_at,
  };
}