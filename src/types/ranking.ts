export type SeasonStatus = "ACTIVE" | "CLOSED";

export type NodeSeason = {
  id: string;

  nodeId: string;

  name: string;

  status: SeasonStatus;

  startedAt: string;
  endedAt: string | null;

  createdAt: string;
  updatedAt: string;
};
export type NodeRankingEntry = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalSeconds: number;
};