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
export type ScheduleIntervalInput = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};
export type NodeScheduleStatus = {
  isOpen: boolean;
  currentIntervalStart: string | null;
  currentIntervalEnd: string | null;
  nextOpenAt: string | null;
};