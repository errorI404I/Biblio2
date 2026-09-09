"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type DeleteNodeButtonProps = {
  nodeId: string;
  nodeName: string;
};

export function DeleteNodeButton({
  nodeId,
  nodeName,
}: DeleteNodeButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleDelete = async () => {
    setErrorMessage("");

    const confirmed = window.confirm(
      `¿Eliminar el nodo "${nodeName}"?\n\n` +
        "El nodo dejará de estar disponible, pero su historial se conservará."
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "delete_node",
      {
        p_node_id: nodeId,
      }
    );

    setIsDeleting(false);

if (error) {
  console.error("Error deleting node");
  console.error("message:", error.message);
  console.error("code:", error.code);
  console.error("details:", error.details);
  console.error("hint:", error.hint);

  setErrorMessage(
    error.message ||
      "No se pudo eliminar el nodo."
  );

  return;
}
    router.push("/admin");
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {isDeleting
          ? "Eliminando..."
          : "Eliminar nodo"}
      </button>

      {errorMessage && (
        <p className="mt-2 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}