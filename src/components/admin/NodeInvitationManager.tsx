"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import type { NodeInvitation } from "@/types/invitation";

type NodeInvitationManagerProps = {
  nodeId: string;
  invitation: NodeInvitation | null;
};

type ExpirationOption =
  | "NEVER"
  | "24_HOURS"
  | "7_DAYS";

export function NodeInvitationManager({
  nodeId,
  invitation,
}: NodeInvitationManagerProps) {
  const router = useRouter();

  const [expiration, setExpiration] =
    useState<ExpirationOption>("NEVER");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const getExpirationDate = () => {
    if (expiration === "NEVER") {
      return null;
    }

    const expirationDate = new Date();

    if (expiration === "24_HOURS") {
      expirationDate.setHours(
        expirationDate.getHours() + 24
      );
    }

    if (expiration === "7_DAYS") {
      expirationDate.setDate(
        expirationDate.getDate() + 7
      );
    }

    return expirationDate.toISOString();
  };

  const handleGenerate = async () => {
    setErrorMessage("");
    setCopied(false);
    setIsSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "create_node_invitation",
      {
        p_node_id: nodeId,
        p_expires_at: getExpirationDate(),
      }
    );

    setIsSubmitting(false);

    if (error) {
      console.error(
        "Error creating invitation:",
        error
      );

      setErrorMessage(
        "No se pudo generar la invitación."
      );

      return;
    }

    router.refresh();
  };

  const handleRevoke = async () => {
    setErrorMessage("");
    setCopied(false);
    setIsSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "revoke_node_invitation",
      {
        p_node_id: nodeId,
      }
    );

    setIsSubmitting(false);

    if (error) {
      console.error(
        "Error revoking invitation:",
        error
      );

      setErrorMessage(
        "No se pudo revocar la invitación."
      );

      return;
    }

    router.refresh();
  };

  const handleCopy = async () => {
    if (!invitation) {
      return;
    }

    const invitationUrl =
      `${window.location.origin}/join/${invitation.code}`;

    try {
      await navigator.clipboard.writeText(
        invitationUrl
      );

      setCopied(true);
    } catch (error) {
      console.error(
        "Error copying invitation:",
        error
      );

      setErrorMessage(
        "No se pudo copiar el enlace."
      );
    }
  };

  const invitationUrl = invitation
    ? `/join/${invitation.code}`
    : null;

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Invitación
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Compartí un enlace para que otras personas
          puedan unirse al nodo como miembros.
        </p>
      </div>

      {!invitation ? (
        <div className="mt-5">
          <div>
            <label
              htmlFor="invitationExpiration"
              className="mb-2 block text-sm font-medium text-slate-900"
            >
              Expiración
            </label>

            <select
              id="invitationExpiration"
              value={expiration}
              onChange={(event) =>
                setExpiration(
                  event.target.value as ExpirationOption
                )
              }
              className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            >
              <option value="NEVER">
                Nunca
              </option>

              <option value="24_HOURS">
                24 horas
              </option>

              <option value="7_DAYS">
                7 días
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSubmitting}
            className="mt-4 rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isSubmitting
              ? "Generando..."
              : "Generar enlace"}
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Enlace activo
            </p>

            <code className="mt-2 block overflow-x-auto rounded-md bg-slate-100 p-3 text-sm text-slate-800">
              {invitationUrl}
            </code>
          </div>

          {invitation.expiresAt ? (
            <p className="text-sm text-slate-600">
              Expira:{" "}
              {new Date(
                invitation.expiresAt
              ).toLocaleString("es-AR")}
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Sin vencimiento.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              {copied
                ? "Copiado"
                : "Copiar enlace"}
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isSubmitting}
              className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Regenerar
            </button>

            <button
              type="button"
              onClick={handleRevoke}
              disabled={isSubmitting}
              className="rounded-md border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Revocar
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="mt-4 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}
    </section>
  );
}