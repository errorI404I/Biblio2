import { notFound } from "next/navigation";
import { ExportRankingButton } from "@/components/admin/ExportRankingButton";
import { DeleteNodeButton } from "@/components/admin/DeleteNodeButton";

import { getAdminNodeById } from "@/lib/api/nodes";
import { getNodeScheduleIntervals } from "@/lib/api/schedules";
import { getActiveNodeInvitation } from "@/lib/api/invitations";

import { NodeScheduleManager } from "@/components/admin/NodeScheduleManager";
import { EditNodeForm } from "@/components/admin/EditNodeForm";
import { NodeInvitationManager } from "@/components/admin/NodeInvitationManager";
import { requireNodeAdmin } from "@/lib/auth/permissions";
import { getActiveNodeSeason } from "@/lib/api/seasons";
import { CloseSeasonForm } from "@/components/admin/CloseSeasonForm";
import {getClosedNodeSeasons} from "@/lib/api/seasons";

type AdminNodePageProps = {
  params: Promise<{
    nodeId: string;
  }>;
};

export default async function AdminNodePage({
  params,
}: AdminNodePageProps) {
  const { nodeId } = await params;
  await requireNodeAdmin(nodeId);
  const node = await getAdminNodeById(nodeId);
  const activeSeason = await getActiveNodeSeason(nodeId);
  const closedSeasons = await getClosedNodeSeasons(nodeId);

  if (!node) {
    notFound();
  }

  const intervals =
    await getNodeScheduleIntervals(nodeId);

  const invitation =
    await getActiveNodeInvitation(nodeId);

  return (
    
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">
          {node.name}
        </h2>
        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">
          Temporada
        </h3>

        {!activeSeason ? (
          <p className="mt-2 text-sm text-red-700">
            Este nodo no tiene una temporada activa.
          </p>
        ) : (
          <>
            <div className="mt-3">
              <p className="text-sm text-slate-600">
                Temporada actual
              </p>

              <p className="font-medium text-slate-900">
                {activeSeason.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Iniciada:{" "}
                {new Date(
                  activeSeason.startedAt
                ).toLocaleString("es-AR", {
                  timeZone: node.timezone,
                })}
              </p>
            </div>

            <CloseSeasonForm
              nodeId={node.id}
              currentSeasonName={
                activeSeason.name
              }
            />
          </>
        )}
      </section>

        <p className="mt-1 text-slate-600">
          Panel de administración del nodo
        </p>
      </div>

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
            Método de validación
          </h3>

          <p className="mt-2 text-slate-700">
            {node.validationMethod}
          </p>
        </section>

        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Zona horaria
          </h3>

          <p className="mt-2 text-slate-700">
            {node.timezone}
          </p>
        </section>

        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Tolerancia
          </h3>

          <p className="mt-2 text-slate-700">
            {Math.floor(
              node.gracePeriodSeconds / 60
            )}{" "}
            minutos
          </p>
        </section>
        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Histórico de temporadas
          </h3>

          {closedSeasons.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              Todavía no hay temporadas cerradas.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {closedSeasons.map((season) => (
                <div
                  key={season.id}
                  className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {season.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(
                        season.startedAt
                      ).toLocaleDateString("es-AR")}
                      {" — "}
                      {new Date(
                        season.endedAt
                      ).toLocaleDateString("es-AR")}
                    </p>
                  </div>

                  <a
                    href={`/api/admin/nodes/${node.id}/seasons/${season.id}/ranking-export`}
                    className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Descargar Excel
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Ranking
          </h3>

          <p className="mt-2 text-slate-700">
            {node.isRankingVisible
              ? "Visible"
              : "Oculto"}
          </p>
        </section>
      </div>


      {node.description && (
        <section className="mt-4 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Descripción
          </h3>

          <p className="mt-2 text-slate-700">
            {node.description}
          </p>
        </section>
      )}

      {node.validationMethod === "WIFI" && (
        <section className="mt-4 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Configuración Wi-Fi
          </h3>

          <p className="mt-2 text-slate-700">
            IP pública configurada:
          </p>

          <code className="mt-2 inline-block rounded bg-slate-100 px-2 py-1 text-sm text-slate-900">
            {node.wifiPublicIp}
          </code>
        </section>
      )}

      {node.validationMethod === "GPS" && (
        <section className="mt-4 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Configuración GPS
          </h3>

          <div className="mt-2 space-y-1 text-slate-700">
            <p>
              Latitud: {node.latitude}
            </p>

            <p>
              Longitud: {node.longitude}
            </p>

            <p>
              Radio configurado:{" "}
              {node.radiusMeters} m
            </p>
          </div>
        </section>
      )}
      <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
  <h3 className="font-semibold text-slate-900">
    Exportar ranking
  </h3>

  <p className="mt-2 text-sm text-slate-600">
    Descargá el ranking actual de la temporada activa en formato Excel.
  </p>

  <div className="mt-4">
    <ExportRankingButton
      nodeId={node.id}
    />
  </div>
</section>
      <section className="mt-8">
        <h3 className="mb-4 text-xl font-semibold text-slate-900">
          Editar configuración
        </h3>

        <EditNodeForm node={node} />
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-900">
            Horarios
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Definí los intervalos en los que se permite registrar presencia.
          </p>
        </div>

        <NodeScheduleManager
          nodeId={node.id}
          intervals={intervals}
        />
      </section>

      <section className="mt-8">
        <NodeInvitationManager
          nodeId={node.id}
          invitation={invitation}
        />
      </section>
        <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="text-xl font-semibold text-red-900">
          Zona peligrosa
        </h3>

        <p className="mt-2 text-sm text-red-800">
          Eliminar el nodo impedirá nuevas presencias y dejará
          de aparecer como nodo activo. El historial existente
          se conservará.
        </p>

        <div className="mt-4">
          <DeleteNodeButton
            nodeId={node.id}
            nodeName={node.name}
          />
        </div>
      </section>
    </div>
  );
}