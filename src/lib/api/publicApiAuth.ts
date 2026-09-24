import "server-only";

import { createHash } from "crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicApiScope } from "@/lib/api/publicApiScopes";

type AuthenticateNodeApiKeyParams = {
  request: Request;
  nodeId: string;
  requiredScope: PublicApiScope;
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
      status: 401 | 403 | 429;
      error: string;
    };

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const requestBuckets = new Map<
  string,
  { count: number; resetsAt: number }
>();

function consumeRateLimit(key: string, now: number) {
  const current = requestBuckets.get(key);
  if (!current || current.resetsAt <= now) {
    requestBuckets.set(key, {
      count: 1,
      resetsAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

async function isRateLimited(
  request: Request,
  supabase: ReturnType<typeof createAdminClient>
) {
  const authorization =
    request.headers.get("authorization") ?? "anonymous";
  const forwardedFor =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const ip = forwardedFor ?? realIp ?? "unknown";
  const credentialHash = createHash("sha256")
    .update(authorization)
    .digest("hex");
  const now = Date.now();

  if (requestBuckets.size > 10_000) {
    for (const [key, bucket] of requestBuckets) {
      if (bucket.resetsAt <= now) requestBuckets.delete(key);
    }
  }

  const fingerprints = [
    createHash("sha256").update(`ip:${ip}`).digest("hex"),
    createHash("sha256").update(`key:${credentialHash}`).digest("hex"),
  ];

  for (const fingerprint of fingerprints) {
    const { data, error } = await supabase.rpc(
      "consume_public_api_rate_limit",
      {
        p_fingerprint: fingerprint,
        p_limit: RATE_LIMIT_MAX_REQUESTS,
        p_window_seconds: RATE_LIMIT_WINDOW_MS / 1000,
      }
    );

    if (!error && data === false) return true;
    if (error && consumeRateLimit(fingerprint, now)) return true;
  }

  return false;
}

export async function authenticateNodeApiKey({
  request,
  nodeId,
  requiredScope,
}: AuthenticateNodeApiKeyParams): Promise<ApiKeyAuthResult> {
  const supabase = createAdminClient();

  if (await isRateLimited(request, supabase)) {
    return {
      ok: false,
      status: 429,
      error: "Rate limit exceeded",
    };
  }
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

  const { data: node, error: nodeError } = await supabase
    .from("nodes")
    .select("id")
    .eq("id", nodeId)
    .is("deleted_at", null)
    .maybeSingle();

  if (nodeError || !node) {
    return {
      ok: false,
      status: 403,
      error: "Node is not available",
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

  const { error: usageError } = await supabase
    .from("node_api_keys")
    .update({
      last_used_at: new Date().toISOString(),
    })
    .eq("id", apiKey.id);

  if (usageError) {
    console.error(
      "Error updating API key usage:",
      usageError
    );
  }

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
