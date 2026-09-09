"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type JoinNodeButtonProps = {
  code: string;
};

export function JoinNodeButton({
  code,
}: JoinNodeButtonProps) {
  const router = useRouter();

  const [isJoining, setIsJoining] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleJoin = async () => {
    setErrorMessage("");
    setIsJoining(true);

    const supabase = createClient();

    const { data: nodeId, error } =
      await supabase.rpc(
        "accept_node_invitation",
        {
          p_code: code,
        }
      );

    setIsJoining(false);

    if (error || !nodeId) {
      console.error(
        "Error joining node:",
        error
      );

      setErrorMessage(
        "No se pudo aceptar la invitación. Puede haber vencido o sido revocada."
      );

      return;
    }

    router.push(`/nodes/${nodeId}`);
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleJoin}
        disabled={isJoining}
        className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isJoining
          ? "Uniéndote..."
          : "Unirme al nodo"}
      </button>

      {errorMessage && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}