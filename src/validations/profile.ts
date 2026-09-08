import { z } from "zod";

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres"),

  bio: z
    .string()
    .trim()
    .max(200, "La bio no puede superar los 200 caracteres"),

  avatarUrl: z
    .string()
    .trim()
    .url("La URL del avatar no es válida")
    .or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;