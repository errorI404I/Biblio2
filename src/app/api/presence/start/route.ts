import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type StartPresenceBody = {
  nodeId: string;
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

  const body = (await request.json()) as StartPresenceBody;

  if (!body.nodeId) {
    return NextResponse.json(
      { error: "NODE_ID_REQUIRED" },
      { status: 400 }
    );
  }

  const { data: node, error: nodeError } =
    await supabase
      .from("nodes")
      .select(`
        id,
        validation_method,
        wifi_public_ip,
        is_active
      `)
      .eq("id", body.nodeId)
      .maybeSingle();

  if (nodeError || !node) {
    return NextResponse.json(
      { error: "NODE_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (!node.is_active) {
    return NextResponse.json(
      { error: "NODE_INACTIVE" },
      { status: 400 }
    );
  }

  if (node.validation_method !== "WIFI") {
    return NextResponse.json(
      { error: "GPS_NOT_AVAILABLE_ON_WEB" },
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

  console.log(
    "START OBSERVED IP:",
    observedIp
  );

  console.log(
    "START EXPECTED IP:",
    expectedIp
  );

  if (
    !expectedIp ||
    observedIp !== expectedIp
  ) {
    return NextResponse.json(
      {
        error: "WIFI_VALIDATION_FAILED",
        observedIp,
      },
      { status: 403 }
    );
  }

  const admin =
    createAdminClient();

  const {
    data: sessionId,
    error: startError,
  } = await admin.rpc(
    "start_presence_session_internal",
    {
      p_user_id: user.id,
      p_node_id: body.nodeId,
    }
  );

  if (startError) {
    console.error(
      "Error starting presence:",
      startError
    );

    return NextResponse.json(
      {
        error: "PRESENCE_START_FAILED",
        message: startError.message,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    sessionId,
    status: "ACTIVE",
  });
}