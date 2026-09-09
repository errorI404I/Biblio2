import Link from "next/link";

import { AdminNodeCard } from "@/components/admin/AdminNodeCard";
import { RestoreNodeButton } from "@/components/admin/RestoreNodeButton";

import { getCurrentUserAdminNodes } from "@/lib/api/nodes";

export default async function AdminPage() {
  const nodes =
    await getCurrentUserAdminNodes();

  const activeNodes = nodes.filter(
    (node) => node.deletedAt === null
  );

  const deletedNodes = nodes.filter(
    (node) => node.deletedAt !== null
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Administración
          </h2>

          <p className="mt-1 text-slate-600">
            Gestioná los nodos donde
            tenés permisos de
            administrador.
          </p>
        </div>

        <Link
          href="/admin/nodes/create"
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
        >
          Crear nodo
        </Link>
      </div>

      {/* ============================
          NODOS ACTIVOS
          ============================ */}

      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Nodos activos
          </h3>
        </div>

        {activeNodes.length === 0 ? (
          <div className="rounded-lg border border-slate-300 bg-white p-6">
            <p className="text-slate-700">
              Todavía no administrás
              ningún nodo activo.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeNodes.map(
              (node) => (
                <AdminNodeCard
                  key={node.id}
                  node={node}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* ============================
          NODOS ELIMINADOS
          ============================ */}

      {deletedNodes.length > 0 && (
        <section className="mt-10">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-900">
              Eliminados recientemente
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Estos nodos ya no son
              visibles para sus miembros.
              Podés restaurarlos durante
              30 días antes de que se
              eliminen definitivamente.
            </p>
          </div>

          <div className="space-y-3">
            {deletedNodes.map(
              (node) => {
                const deletedAt =
                  new Date(
                    node.deletedAt!
                  );

                const purgeAt =
                  new Date(
                    deletedAt.getTime() +
                      30 *
                        24 *
                        60 *
                        60 *
                        1000
                  );

                const now = new Date();

                const millisecondsLeft =
                  purgeAt.getTime() -
                  now.getTime();

                const daysLeft =
                  Math.max(
                    0,
                    Math.ceil(
                      millisecondsLeft /
                        (
                          24 *
                          60 *
                          60 *
                          1000
                        )
                    )
                  );

                return (
                  <article
                    key={node.id}
                    className="flex flex-col gap-4 rounded-lg border border-red-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {node.name}
                        </h4>

                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                          Eliminado
                        </span>
                      </div>

                      {node.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          {
                            node.description
                          }
                        </p>
                      )}

                      <p className="mt-3 text-sm text-slate-500">
                        Eliminado:{" "}
                        {deletedAt.toLocaleString(
                          "es-AR"
                        )}
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        Eliminación
                        definitiva:{" "}
                        {purgeAt.toLocaleDateString(
                          "es-AR"
                        )}
                      </p>

                      <p className="mt-1 text-sm font-medium text-red-700">
                        {daysLeft > 0
                          ? `${daysLeft} ${
                              daysLeft ===
                              1
                                ? "día"
                                : "días"
                            } para restaurarlo`
                          : "Pendiente de eliminación definitiva"}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <RestoreNodeButton
                        nodeId={node.id}
                      />
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>
      )}
    </div>
  );
}