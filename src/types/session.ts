export type PresenceSessionStatus =
  | "ACTIVE"
  | "GRACE_PERIOD"
  | "CLOSED";

export type PresenceSessionEndReason =
  | "MANUAL"
  | "GRACE_PERIOD_EXPIRED"
  | "SCHEDULE_ENDED"
  | "CONNECTION_LOST"
  | "NODE_DELETED"
  | "NODE_CONFIGURATION_CHANGED";

export type PresenceSession = {
  id: string;

  userId: string;
  nodeId: string;
  seasonId: string;

  status: PresenceSessionStatus;

  startedAt: string;
  endedAt: string | null;

  gracePeriodStartedAt: string | null;

  endReason: PresenceSessionEndReason | null;

  createdAt: string;
  updatedAt: string;
};