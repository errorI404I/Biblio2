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
export type UserNode = {
  id: string;
  name: string;
  description: string | null;

  validationMethod:
    | "WIFI"
    | "GPS";

  latitude: number | null;
  longitude: number | null;
  radiusMeters: number | null;

  wifiPublicIp: string | null;

  gracePeriodSeconds: number;

  timezone: string;

  isRankingVisible: boolean;
  isActive: boolean;

  deletedAt: string | null;

  createdAt: string;
  updatedAt: string;

  role: "ADMIN" | "MEMBER";
};
