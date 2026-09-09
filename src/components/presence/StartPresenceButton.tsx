"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type StartPresenceButtonProps = {
  nodeId: string;
};

export function StartPresenceButton({
  nodeId,
}: StartPresenceButtonProps) {
  const [isStarting, setIsStarting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const handleStart = async () => {
    setMessage("");
    setIsStarting(true);

    const supabase = createClient();

    const { data, error } = await supabase.rpc(
      "start_presence_session",
      {
        p_node_id: nodeId,
      }
    );

    setIsStarting(false);

    if (error) {
      console.error(
        "Error starting presence:",
        error
      );

      setMessage(error.message);
      return;
    }

    setMessage(
      `Sesión iniciada: ${data}`
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleStart}
        disabled={isStarting}
        className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isStarting
          ? "Iniciando..."
          : "Conectarme"}
      </button>

      {message && (
        <p className="mt-3 text-sm text-slate-700">
          {message}
        </p>
      )}
    </div>
  );
}