import { notFound } from "next/navigation";
import { getNodeScheduleStatus } from "@/lib/api/schedules";

import { getUserNodeById } from "@/lib/api/nodes";

type NodeDetailPageProps = {
  params: Promise<{
    nodeId: string;
  }>;
};

export default async function NodeDetailPage({
  params,
}: NodeDetailPageProps) {
  const { nodeId } = await params;

  const node = await getUserNodeById(nodeId);

  if (!node) {
    notFound();
  }
  const scheduleStatus =
  await getNodeScheduleStatus(nodeId);

  return (
    <div className="max-w-3xl">
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

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Estado
          </h3>

          <p className="mt-2 text-slate-700">
            {node.isActive ? "Activo" : "Desactivado"}
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
        <section className="mt-4 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
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
            {Math.floor(node.gracePeriodSeconds / 60)} minutos
          </p>
        </section>
      </div>
    </div>
  );
}