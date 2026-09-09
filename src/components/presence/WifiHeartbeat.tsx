"use client";

import { useEffect } from "react";

type WifiHeartbeatProps = {
  sessionId: string;
};

export function WifiHeartbeat({
  sessionId,
}: WifiHeartbeatProps) {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/presence/heartbeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
          }),
        });
      } catch (error) {
        console.error(
          "Heartbeat failed:",
          error
        );
      }
    };

    sendHeartbeat();

    const intervalId = window.setInterval(
      sendHeartbeat,
      60_000
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [sessionId]);

  return null;
}