export type InvitationStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "REVOKED";

export type NodeInvitation = {
  id: string;

  nodeId: string;

  code: string;

  createdByUserId: string;

  status: InvitationStatus;

  expiresAt: string | null;

  createdAt: string;
};
export type PublicNodeInvitation = {
  nodeId: string;
  nodeName: string;
  nodeDescription: string | null;
  expiresAt: string | null;
};