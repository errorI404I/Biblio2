"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import type { NodeApiKey } from "@/lib/api/nodeApiKeys";
import {
  PUBLIC_API_SCOPES,
  type PublicApiScope,
} from "@/lib/api/publicApiScopes";

type Props = {
  nodeId: string;
  apiKeys: NodeApiKey[];
};

const SCOPE_LABELS: Record<PublicApiScope, string> = {
  "node:read": "Leer información del nodo",
  "schedule:read": "Leer horarios",
  "schedule:write": "Modificar horarios",
  "schedule_exceptions:read": "Leer excepciones de horario",
  "schedule_exceptions:write": "Modificar excepciones de horario",
  "theme:read": "Leer diseño",
  "theme:write": "Modificar diseño",
  "members:read": "Leer miembros",
  "invitations:read": "Leer invitaciones",
  "invitations:write": "Gestionar invitaciones",
  "ranking:read": "Leer ranking",
  "presence:read": "Leer presencias",
};

const AVAILABLE_SCOPES = PUBLIC_API_SCOPES.map(
  (value) => ({ value, label: SCOPE_LABELS[value] })
);

export function NodeApiKeysManager({
  nodeId,
  apiKeys,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] =
    useState<string[]>([]);

  const [generatedKey, setGeneratedKey] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  function toggleScope(scope: string) {
    setSelectedScopes((current) =>
      current.includes(scope)
        ? current.filter((item) => item !== scope)
        : [...current, scope]
    );
  }

  async function handleCreate() {
    setError(null);

    if (!name.trim()) {
      setError("Ingresá un nombre para la API key.");
      return;
    }

    if (selectedScopes.length === 0) {
      setError("Seleccioná al menos un permiso.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.rpc(
      "create_node_api_key",
      {
        p_node_id: nodeId,
        p_name: name.trim(),
        p_scopes: selectedScopes,
      }
    );

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    const result = data?.[0];

    if (!result?.api_key) {
      setError(
        "La API key se creó, pero no se recibió la clave."
      );
      return;
    }

    setGeneratedKey(result.api_key);
    setName("");
    setSelectedScopes([]);

    router.refresh();
  }

  async function handleRevoke(apiKeyId: string) {
    const confirmed = window.confirm(
      "¿Querés revocar esta API key? Los programas que la utilicen dejarán de funcionar."
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    const { error } = await supabase.rpc(
      "revoke_node_api_key",
      {
        p_api_key_id: apiKeyId,
      }
    );

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  async function copyGeneratedKey() {
    if (!generatedKey) {
      return;
    }

    await navigator.clipboard.writeText(
      generatedKey
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900">
        <h2 className="text-xl font-semibold text-slate-900">
          Crear API key
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Esta credencial permitirá que un programa
          externo acceda a este nodo según los
          permisos seleccionados.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-900">
              Nombre
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ej: Integración externa"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-900">
              Permisos
            </p>

            <div className="space-y-2">
              {AVAILABLE_SCOPES.map((scope) => (
                <label
                  key={scope.value}
                  className="flex items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(
                      scope.value
                    )}
                    onChange={() =>
                      toggleScope(scope.value)
                    }
                  />

                  <span className="text-sm text-slate-800">
                    {scope.label}
                  </span>

                  <code className="text-xs text-slate-500">
                    {scope.value}
                  </code>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading
              ? "Creando..."
              : "Crear API key"}
          </button>
        </div>
      </section>

      {generatedKey && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-950">
            Guardá esta API key ahora
          </h2>

          <p className="mt-2 text-sm text-amber-900">
            No podremos volver a mostrarla.
          </p>

          <div className="mt-4 flex gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-md bg-white p-3 text-sm text-slate-900">
              {generatedKey}
            </code>

            <button
              type="button"
              onClick={copyGeneratedKey}
              className="rounded-md border border-amber-400 px-3 py-2 text-sm text-amber-950"
            >
              Copiar
            </button>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          API keys existentes
        </h2>

        <div className="mt-4 space-y-3">
          {apiKeys.length === 0 && (
            <p className="text-sm text-slate-600">
              Este nodo todavía no tiene API keys.
            </p>
          )}

          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">
                    {apiKey.name}
                  </h3>

                  <code className="mt-1 block text-xs text-slate-500">
                    {apiKey.keyPrefix}...
                  </code>
                </div>

                {apiKey.revokedAt ? (
                  <span className="text-sm font-medium text-red-600">
                    Revocada
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleRevoke(apiKey.id)
                    }
                    className="text-sm font-medium text-red-600"
                  >
                    Revocar
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {apiKey.scopes.map((scope) => (
                  <code
                    key={scope}
                    className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700"
                  >
                    {scope}
                  </code>
                ))}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Creada{" "}
                {new Date(
                  apiKey.createdAt
                ).toLocaleString("es-AR")}
              </p>

              {apiKey.lastUsedAt && (
                <p className="mt-1 text-xs text-slate-500">
                  Último uso:{" "}
                  {new Date(
                    apiKey.lastUsedAt
                  ).toLocaleString("es-AR")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
