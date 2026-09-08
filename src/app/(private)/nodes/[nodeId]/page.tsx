import { notFound } from "next/navigation";

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