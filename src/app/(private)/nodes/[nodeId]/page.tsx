import { notFound } from "next/navigation";
import { NodeRanking } from "@/components/ranking/NodeRanking";
import { getUserNodeById } from "@/lib/api/nodes";
import { getNodeRanking } from "@/lib/api/ranking";
import { getNodeScheduleStatus } from "@/lib/api/schedules";
import { getActiveNodeSeason } from "@/lib/api/seasons";
import { getUserNodeStreak } from "@/lib/api/streaks";
import { requireNodeMember } from "@/lib/auth/permissions";

type NodeDetailPageProps = { params: Promise<{ nodeId: string }> };

export default async function NodeDetailPage({ params }: NodeDetailPageProps) {
  const { nodeId } = await params;
  await requireNodeMember(nodeId);
  const node = await getUserNodeById(nodeId);
  if (!node) notFound();
  const [scheduleStatus, ranking, streak, activeSeason] = await Promise.all([
    getNodeScheduleStatus(nodeId), node.isRankingVisible ? getNodeRanking(nodeId) : Promise.resolve([]), getUserNodeStreak(nodeId), getActiveNodeSeason(nodeId),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div><div className="flex flex-wrap items-center gap-3"><h2 className="text-3xl font-bold text-slate-900">{node.name}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ${node.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>{node.isActive ? "Activo" : "Desactivado"}</span></div>{node.description && <p className="mt-3 max-w-2xl text-slate-600">{node.description}</p>}</div>
      <section className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-900">El registro de presencia se realiza exclusivamente desde la app móvil mediante GPS.</section>
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Tu racha" value={`${streak} ${streak === 1 ? "día" : "días"}`} detail="Días obligatorios cumplidos" />
        <InfoCard title="Temporada actual" value={activeSeason?.name ?? "Sin temporada activa"} detail={activeSeason ? `Iniciada el ${new Date(activeSeason.startedAt).toLocaleDateString("es-AR")}` : "El administrador todavía no inició una temporada"} />
        <InfoCard title="Tu rol" value={node.role === "ADMIN" ? "Administrador" : "Miembro"} detail="Los permisos efectivos dependen de tu rol y de las políticas de seguridad" />
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-sm font-medium text-slate-500">Horario</h3>{!scheduleStatus ? <p className="mt-2 font-semibold text-slate-900">No disponible</p> : scheduleStatus.isOpen ? <><p className="mt-2 text-xl font-bold text-emerald-700">Abierto</p><p className="mt-1 text-sm text-slate-600">Intervalo actual: {scheduleStatus.currentIntervalStart?.slice(0, 5)} — {scheduleStatus.currentIntervalEnd?.slice(0, 5)}</p></> : <><p className="mt-2 text-xl font-bold text-red-700">Cerrado</p><p className="mt-1 text-sm text-slate-600">{scheduleStatus.nextOpenAt ? `Próxima apertura: ${new Date(scheduleStatus.nextOpenAt).toLocaleString("es-AR", { timeZone: node.timezone, dateStyle: "short", timeStyle: "short" })}` : "No hay próximos horarios configurados"}</p></>}</section>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-900">Información básica</h3><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Zona horaria</dt><dd className="mt-1 font-medium text-slate-900">{node.timezone}</dd></div><div><dt className="text-slate-500">Ubicación</dt><dd className="mt-1 font-medium text-slate-900">Configurada mediante GPS</dd></div></dl></section>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-900">Ranking</h3>{!node.isRankingVisible ? <p className="mt-2 text-sm text-slate-600">El ranking está oculto por el administrador.</p> : <NodeRanking nodeId={node.id} initialRanking={ranking} />}</section>
    </div>
  );
}

function InfoCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-sm font-medium text-slate-500">{title}</h3><p className="mt-2 text-xl font-bold text-slate-900">{value}</p><p className="mt-1 text-sm text-slate-600">{detail}</p></section>;
}
