"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type CloseSeasonFormProps = {
  nodeId: string;
  currentSeasonName: string;
};

export function CloseSeasonForm({
  nodeId,
  currentSeasonName,
}: CloseSeasonFormProps) {
  const router = useRouter();

  const [newSeasonName, setNewSeasonName] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName =
      newSeasonName.trim();

    if (!trimmedName) {
      setErrorMessage(
        "Ingresá el nombre de la nueva temporada."
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Cerrar "${currentSeasonName}" y crear "${trimmedName}"?`
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "close_node_season",
      {
        p_node_id: nodeId,
        p_new_season_name: trimmedName,
      }
    );

    setIsSubmitting(false);

    if (error) {
      console.error(
        "Error closing season:",
        error
      );

      setErrorMessage(error.message);
      return;
    }

    setNewSeasonName("");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4"
    >
      <div>
        <label
          htmlFor="newSeasonName"
          className="block text-sm font-medium text-slate-700"
        >
          Nombre de la nueva temporada
        </label>

        <input
          id="newSeasonName"
          type="text"
          value={newSeasonName}
          onChange={(event) =>
            setNewSeasonName(
              event.target.value
            )
          }
          placeholder="Ej. Septiembre 2026"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 disabled:opacity-50"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
      >
        {isSubmitting
          ? "Cerrando..."
          : "Cerrar temporada"}
      </button>
    </form>
  );
}