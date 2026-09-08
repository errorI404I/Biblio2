import { z } from "zod";

export const createNodeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "El nombre no puede superar los 80 caracteres"),

    description: z
      .string()
      .trim()
      .max(300, "La descripción no puede superar los 300 caracteres"),

    validationMethod: z.enum(["GPS", "WIFI"]),

    latitude: z.string(),
    longitude: z.string(),
    radiusMeters: z.string(),

    wifiPublicIp: z.string().trim(),

    timezone: z.string().trim().min(1, "La zona horaria es obligatoria"),

    gracePeriodMinutes: z
      .number()
      .min(1, "La tolerancia debe ser de al menos 1 minuto")
      .max(120, "La tolerancia no puede superar las 2 horas"),

    isRankingVisible: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.validationMethod === "GPS") {
      const latitude = Number(values.latitude);
      const longitude = Number(values.longitude);
      const radius = Number(values.radiusMeters);

      if (
        values.latitude.trim() === "" ||
        Number.isNaN(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["latitude"],
          message: "Ingresá una latitud válida entre -90 y 90",
        });
      }

      if (
        values.longitude.trim() === "" ||
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["longitude"],
          message: "Ingresá una longitud válida entre -180 y 180",
        });
      }

      if (
        values.radiusMeters.trim() === "" ||
        Number.isNaN(radius) ||
        radius <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["radiusMeters"],
          message: "Ingresá un radio mayor que 0",
        });
      }
    }

    if (
      values.validationMethod === "WIFI" &&
      values.wifiPublicIp.trim() === ""
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["wifiPublicIp"],
        message: "La IP pública es obligatoria para un nodo Wi-Fi",
      });
    }
  });

export type CreateNodeFormValues = z.infer<
  typeof createNodeSchema
>;