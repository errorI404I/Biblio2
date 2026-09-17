import "server-only";

import { createHash } from "crypto";

import { createAdminClient } from "@/lib/supabase/admin";

type AuthenticateNodeApiKeyParams = {
  request: Request;
  nodeId: string;
  requiredScope: string;
};

export type AuthenticatedApiKey = {
  id: string;
  nodeId: string;
  name: string;
  scopes: string[];
};

export type ApiKeyAuthResult =
  | {
      ok: true;
      apiKey: AuthenticatedApiKey;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
    };

export async function authenticateNodeApiKey({
  request,
  nodeId,
  requiredScope,
}: AuthenticateNodeApiKeyParams): Promise<ApiKeyAuthResult> {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return {
      ok: false,
      status: 401,
      error: "Missing API key",
    };
  }

  const rawKey = authorization
    .slice("Bearer ".length)
    .trim();

  if (!rawKey.startsWith("biblio2_sk_")) {
    return {
      ok: false,
      status: 401,
      error: "Invalid API key",
    };
  }

  const keyHash = createHash("sha256")
    .update(rawKey)
    .digest("hex");

  const supabase = createAdminClient();

  const { data: apiKey, error } = await supabase
    .from("node_api_keys")
    .select(`
      id,
      node_id,
      name,
      scopes,
      revoked_at
    `)
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error) {
    console.error(
      "Error validating API key:",
      error
    );

    return {
      ok: false,
      status: 401,
      error: "Invalid API key",
    };
  }

  if (!apiKey || apiKey.revoked_at) {
    return {
      ok: false,
      status: 401,
      error: "Invalid or revoked API key",
    };
  }

  if (apiKey.node_id !== nodeId) {
    return {
      ok: false,
      status: 403,
      error:
        "This API key cannot access this node",
    };
  }

  const scopes: string[] =
    apiKey.scopes ?? [];

  if (!scopes.includes(requiredScope)) {
    return {
      ok: false,
      status: 403,
      error: `Missing required scope: ${requiredScope}`,
    };
  }

  await supabase
    .from("node_api_keys")
    .update({
      last_used_at: new Date().toISOString(),
    })
    .eq("id", apiKey.id);

  return {
    ok: true,
    apiKey: {
      id: apiKey.id,
      nodeId: apiKey.node_id,
      name: apiKey.name,
      scopes,
    },
  };
}