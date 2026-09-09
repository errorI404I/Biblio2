"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type RestoreNodeButtonProps = {
  nodeId: string;
};

export function RestoreNodeButton({
  nodeId,
}: RestoreNodeButtonProps) {
  const router = useRouter();

  const [isRestoring, setIsRestoring] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleRestore = async () => {
    setErrorMessage("");
    setIsRestoring(true);

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "restore_node",
      {
        p_node_id: nodeId,
      }
    );

    setIsRestoring(false);

    if (error) {
      console.error(
        "Error restoring node:",
        error.message
      );

      setErrorMessage(
        error.message ||
          "No se pudo restaurar el nodo."
      );

      return;
    }

    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleRestore}
        disabled={isRestoring}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isRestoring
          ? "Restaurando..."
          : "Restaurar"}
      </button>

      {errorMessage && (
        <p className="mt-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}