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

  timezone: string;

  isRankingVisible: boolean;

  createdAt: string;
  updatedAt: string;
};