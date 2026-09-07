export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type NodeScheduleInterval = {
  id: string;

  nodeId: string;

  dayOfWeek: DayOfWeek;

  startTime: string;
  endTime: string;

  createdAt: string;
  updatedAt: string;
};