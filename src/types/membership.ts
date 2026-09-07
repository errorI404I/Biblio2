export type NodeRole = "ADMIN" | "MEMBER";

export type NodeMembership = {
  id: string;

  nodeId: string;
  userId: string;

  role: NodeRole;

  joinedAt: string;
  createdAt: string;
};