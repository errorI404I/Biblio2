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