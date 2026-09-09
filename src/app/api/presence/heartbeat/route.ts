import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type HeartbeatBody = {
  sessionId: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as HeartbeatBody;

  if (!body.sessionId) {
    return NextResponse.json(
      { error: "SESSION_ID_REQUIRED" },
      { status: 400 }
    );
  }

  const { data: session, error: sessionError } =
    await supabase
      .from("presence_sessions")
      .select(`
        id,
        user_id,
        node_id,
        status,
        ended_at,
        nodes (
          validation_method,
          wifi_public_ip
        )
      `)
      .eq("id", body.sessionId)
      .eq("user_id", user.id)
      .is("ended_at", null)
      .maybeSingle();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "OPEN_SESSION_NOT_FOUND" },
      { status: 404 }
    );
  }

  const node = Array.isArray(session.nodes)
    ? session.nodes[0]
    : session.nodes;

  if (!node) {
    return NextResponse.json(
      { error: "NODE_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (node.validation_method !== "WIFI") {
    return NextResponse.json(
      { error: "NOT_WIFI_NODE" },
      { status: 400 }
    );
  }

  const forwardedFor =
    request.headers.get("x-forwarded-for");

  const realIp =
    request.headers.get("x-real-ip");

  const observedIp =
    forwardedFor?.split(",")[0]?.trim() ??
    realIp?.trim() ??
    null;

  if (!observedIp) {
    return NextResponse.json(
      { error: "IP_NOT_AVAILABLE" },
      { status: 500 }
    );
  }

  const expectedIp =
    node.wifi_public_ip?.trim();

  const isValid =
    !!expectedIp &&
    observedIp === expectedIp;

  // Logs de diagnóstico de IP
  console.log("OBSERVED IP:", observedIp);
  console.log("EXPECTED IP:", expectedIp);
  console.log("VALID WIFI:", isValid);

  const {
    data: newStatus,
    error: heartbeatError,
  } = await supabase.rpc(
    "process_wifi_heartbeat",
    {
      p_session_id: session.id,
      p_is_valid: isValid,
    }
  );

  if (heartbeatError) {
    console.error(
      "Error processing heartbeat:",
      heartbeatError
    );

    return NextResponse.json(
      { error: "HEARTBEAT_PROCESSING_FAILED" },
      { status: 500 }
    );
  }

  console.log(
    "STATUS AFTER HEARTBEAT:",
    newStatus
  );

  const {
    data: finalStatus,
    error: expirationError,
  } = await supabase.rpc(
    "expire_presence_grace_period",
    {
      p_session_id: session.id,
    }
  );

  if (expirationError) {
    console.error(
      "Error checking grace expiration:",
      expirationError
    );

    return NextResponse.json(
      { error: "GRACE_EXPIRATION_FAILED" },
      { status: 500 }
    );
  }

  console.log(
    "FINAL STATUS:",
    finalStatus
  );

  return NextResponse.json({
    valid: isValid,
    status: finalStatus,
    observedIp,
  });
}