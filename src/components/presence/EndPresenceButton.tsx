"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type EndPresenceButtonProps = {
  sessionId: string;
};

export function EndPresenceButton({
  sessionId,
}: EndPresenceButtonProps) {
  const router = useRouter();

  const [isEnding, setIsEnding] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleEnd = async () => {
    const confirmed = window.confirm(
      "¿Querés terminar tu sesión de presencia ahora?"
    );

    if (!confirmed) {
      return;
    }

    setIsEnding(true);
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "end_presence_session",
      {
        p_session_id: sessionId,
      }
    );

    setIsEnding(false);

    if (error) {
      console.error(
        "Error ending presence:",
        error
      );

      setErrorMessage(error.message);
      return;
    }

    router.refresh();
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleEnd}
        disabled={isEnding}
        className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
      >
        {isEnding
          ? "Terminando..."
          : "Terminar sesión"}
      </button>

      {errorMessage && (
        <p className="mt-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}