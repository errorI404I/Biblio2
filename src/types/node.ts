export type ValidationMethod = "GPS" | "WIFI";
export type Node = {
  id: string;
  name: string;
  description: string | null;

  validationMethod: ValidationMethod;

  latitude: number | null;
  longitude: number | null;
  radiusMeters: number | null;

  wifiPublicIp: string | null;

  gracePeriodSeconds: number;

  timezone: string;

  isRankingVisible: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};
import type { NodeRole } from "@/types/membership";

export type UserNode = Node & {
  role: NodeRole;
};