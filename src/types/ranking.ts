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
  id: string;

  nodeId: string;
  seasonId: string;
  userId: string;

  totalSeconds: number;

  currentStreakDays: number;

  createdAt: string;
  updatedAt: string;
};