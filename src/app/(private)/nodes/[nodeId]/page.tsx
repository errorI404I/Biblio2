import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserNodeStreak } from "@/lib/api/streaks";

import { getNodeScheduleStatus } from "@/lib/api/schedules";
import { requireNodeMember } from "@/lib/auth/permissions";
import { StartPresenceButton } from "@/components/presence/StartPresenceButton";
import { WifiHeartbeat } from "@/components/presence/WifiHeartbeat";
import { getCurrentOpenPresenceSession } from "@/lib/api/presence";
import { getUserNodeById } from "@/lib/api/nodes";
import { getNodeRanking } from "@/lib/api/ranking";
import { formatDuration } from "@/lib/utils/time";

type NodeDetailPageProps = {
  params: Promise<{
    nodeId: string;
  }>;
};

export default async function NodeDetailPage({
  params,
}: NodeDetailPageProps) {
  const { nodeId } = await params;

  await requireNodeMember(nodeId);

  const node = await getUserNodeById(nodeId);

  if (!node) {
    notFound();
  }

  const currentSession =
    await getCurrentOpenPresenceSession();

  const scheduleStatus =
    await getNodeScheduleStatus(nodeId);

  const ranking = node.isRankingVisible
    ? await getNodeRanking(nodeId)
    : [];

  const streak =
  await getUserNodeStreak(nodeId);

  

  return (
    <div className="max-w-3xl">
      {currentSession &&
        currentSession.nodeId === node.id &&
        node.validationMethod === "WIFI" && (
          <WifiHeartbeat
            sessionId={currentSession.id}
          />
        )}

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">
          {node.name}
        </h2>

        {node.description && (
          <p className="mt-2 text-slate-600">
            {node.description}
          </p>
        )}
      </div>
      <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
  <h3 className="font-semibold text-slate-900">
    Racha actual
  </h3>

  <p className="mt-2 text-2xl font-bold text-slate-900">
    {streak}
  </p>

  <p className="mt-1 text-sm text-slate-600">
    {streak === 1
      ? "día obligatorio cumplido"
      : "días obligatorios cumplidos"}
  </p>
</section>
      <section className="mb-6 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">
          Presencia
        </h3>

        {!currentSession ? (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Iniciá una sesión de presencia en este nodo.
            </p>

            <div className="mt-4">
              <StartPresenceButton
                nodeId={node.id}
              />
            </div>
          </>
        ) : currentSession.nodeId === node.id ? (
          <div className="mt-3">
            <p className="font-medium text-green-700">
              Tenés una sesión abierta en este nodo.
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Estado: {currentSession.status}
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <p className="font-medium text-amber-700">
              Ya tenés una sesión abierta en otro nodo.
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Nodo actual: {currentSession.nodeName}
            </p>

            <Link
              href={`/nodes/${currentSession.nodeId}`}
              className="mt-3 inline-block text-sm font-medium text-slate-900 underline"
            >
              Ir a la sesión actual
            </Link>
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Estado
          </h3>

          <p className="mt-2 text-slate-700">
            {node.isActive
              ? "Activo"
              : "Desactivado"}
          </p>
        </section>

        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Tu rol
          </h3>

          <p className="mt-2 text-slate-700">
            {node.role}
          </p>
        </section>

        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Estado horario
          </h3>

          {!scheduleStatus ? (
            <p className="mt-2 text-slate-600">
              No se pudo consultar el horario.
            </p>
          ) : scheduleStatus.isOpen ? (
            <div className="mt-2">
              <p className="font-medium text-green-700">
                Abierto
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Intervalo actual:{" "}
                {scheduleStatus.currentIntervalStart?.slice(0, 5)}
                {" — "}
                {scheduleStatus.currentIntervalEnd?.slice(0, 5)}
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <p className="font-medium text-red-700">
                Cerrado
              </p>

              {scheduleStatus.nextOpenAt ? (
                <p className="mt-1 text-sm text-slate-600">
                  Próxima apertura:{" "}
                  {new Date(
                    scheduleStatus.nextOpenAt
                  ).toLocaleString("es-AR", {
                    timeZone: node.timezone,
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-600">
                  No hay próximos horarios configurados.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Método de validación
          </h3>

          <p className="mt-2 text-slate-700">
            {node.validationMethod}
          </p>
        </section>

        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Tolerancia de ausencia
          </h3>

          <p className="mt-2 text-slate-700">
            {Math.floor(
              node.gracePeriodSeconds / 60
            )}{" "}
            minutos
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">
          Ranking
        </h3>

        {!node.isRankingVisible ? (
          <p className="mt-2 text-sm text-slate-600">
            El ranking está oculto por el administrador.
          </p>
        ) : ranking.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            Todavía no hay datos de ranking.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {ranking.map((entry, index) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between rounded-md border border-slate-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 font-semibold text-slate-700">
                    {index + 1}.
                  </span>

                  <div>
                    <p className="font-medium text-slate-900">
                      {entry.displayName}
                    </p>

                    <p className="text-sm text-slate-500">
                      {formatDuration(
                        entry.totalSeconds
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}