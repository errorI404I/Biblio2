export const PUBLIC_API_SCOPES = [
  "node:read",
  "schedule:read",
  "schedule:write",
  "schedule_exceptions:read",
  "schedule_exceptions:write",
  "theme:read",
  "theme:write",
  "members:read",
  "invitations:read",
  "invitations:write",
  "ranking:read",
  "presence:read",
] as const;

export type PublicApiScope =
  (typeof PUBLIC_API_SCOPES)[number];

export function isPublicApiScope(
  value: string
): value is PublicApiScope {
  return PUBLIC_API_SCOPES.includes(
    value as PublicApiScope
  );
}
