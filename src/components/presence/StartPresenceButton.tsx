"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StartPresenceButtonProps = {
  nodeId: string;
};

type StartPresenceResponse = {
  sessionId?: string;
  status?: string;
  error?: string;
  message?: string;
  observedIp?: string;
};

export function StartPresenceButton({
  nodeId,
}: StartPresenceButtonProps) {
  const router = useRouter();

  const [isStarting, setIsStarting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const handleStart = async () => {
    setMessage("");
    setIsStarting(true);

    try {
      const response = await fetch(
        "/api/presence/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodeId,
          }),
        }
      );

      const rawText = await response.text();

console.log("START PRESENCE STATUS:", response.status);
console.log("START PRESENCE BODY:", rawText);

let result: StartPresenceResponse = {};

try {
  result = JSON.parse(rawText) as StartPresenceResponse;
} catch {
  setMessage(
    `El servidor respondió con un formato inesperado (${response.status}). Revisá la terminal de Next.js.`
  );
  return;
}

      if (!response.ok) {
        if (
          result.error ===
          "WIFI_VALIDATION_FAILED"
        ) {
          setMessage(
            `No estás conectado a la red Wi-Fi válida. IP observada: ${
              result.observedIp ?? "desconocida"
            }`
          );

          return;
        }

        if (
          result.error ===
          "GPS_NOT_AVAILABLE_ON_WEB"
        ) {
          setMessage(
            "Este nodo usa GPS y actualmente solo se puede iniciar presencia desde Android."
          );

          return;
        }

        setMessage(
          result.message ??
            result.error ??
            "No se pudo iniciar la presencia."
        );

        return;
      }

      setMessage("Presencia iniciada correctamente.");

      router.refresh();
    } catch (error) {
      console.error(
        "Error starting presence:",
        error
      );

      setMessage(
        "No se pudo conectar con el servidor."
      );
    } finally {
      setIsStarting(false);
    }
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
          ? "Validando..."
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