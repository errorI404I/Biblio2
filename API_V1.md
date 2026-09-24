# API v1

Todas las rutas requieren `Authorization: Bearer biblio2_sk_...` y responden
con `{ "data": ... }` o `{ "error": "..." }`. Cada credencial queda limitada
al nodo que figura en la URL y al scope correspondiente.

| Ruta | Métodos | Scopes |
| --- | --- | --- |
| `/api/v1/nodes/:nodeId` | GET | `node:read` |
| `/api/v1/nodes/:nodeId/schedule` | GET | `schedule:read` |
| `/api/v1/nodes/:nodeId/schedule` | POST, PATCH, DELETE | `schedule:write` |
| `/api/v1/nodes/:nodeId/schedule-exceptions` | GET | `schedule_exceptions:read` |
| `/api/v1/nodes/:nodeId/schedule-exceptions` | PUT, DELETE | `schedule_exceptions:write` |
| `/api/v1/nodes/:nodeId/theme` | GET | `theme:read` |
| `/api/v1/nodes/:nodeId/theme` | PUT | `theme:write` |
| `/api/v1/nodes/:nodeId/members` | GET | `members:read` |
| `/api/v1/nodes/:nodeId/invitations` | GET | `invitations:read` |
| `/api/v1/nodes/:nodeId/invitations` | POST | `invitations:write` |
| `/api/v1/nodes/:nodeId/ranking` | GET | `ranking:read` |
| `/api/v1/nodes/:nodeId/presence` | GET | `presence:read` |

## Escrituras

- Schedule POST: `{ "dayOfWeek": "MONDAY", "startTime": "08:00", "endTime": "17:00" }`
- Schedule PATCH: el mismo cuerpo más `id`.
- Schedule DELETE: `?id=<intervalId>`.
- Exception PUT: `{ "date": "2026-12-25", "isClosed": true, "reason": "Feriado" }`.
- Exception DELETE: `?date=2026-12-25`.
- Theme PUT admite únicamente `version`, `preset`, `primaryColor`,
  `secondaryColor`, `logoUrl`, `bannerUrl` y `cardStyle`.
- Invitation POST: `{ "action": "create", "expiresAt": null }` o
  `{ "action": "revoke" }`.
- Presence GET acepta `limit` (máximo 100) y `before` como cursor ISO.

Antes de usar `theme:*` o `schedule_exceptions:*`, aplicar la migración de
`supabase/migrations/202609240001_public_api_scopes.sql`.
