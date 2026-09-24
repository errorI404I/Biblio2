import Link from "next/link";

import { EnterAdminModeLink } from "@/components/admin/EnterAdminModeLink";
import { getCurrentUserAdminNodes, getCurrentUserNodes } from "@/lib/api/nodes";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: { user } }, nodes, adminNodes] = await Promise.all([
    supabase.auth.getUser(), getCurrentUserNodes(), getCurrentUserAdminNodes(),
  ]);
  const activeAdminNodes = adminNodes.filter((node) => node.deletedAt === null);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-emerald-700">Modo usuario</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Bienvenido</h2>
        <p className="mt-2 text-slate-600">Sesión iniciada como {user?.email}</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2">
        <DashboardCard label="Nodos a los que pertenecés" count={nodes.length} href="/nodes" linkLabel="Ver mis nodos →" tone="emerald" />
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Nodos administrados</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{activeAdminNodes.length}</p>
          <EnterAdminModeLink />
        </article>
      </section>
      <section className="rounded-xl border border-sky-200 bg-sky-50 p-6">
        <h3 className="font-semibold text-sky-950">La presencia se registra desde el móvil</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-sky-800">Esta Web es tu espacio de consulta y administración. Para registrar presencia en un nodo, usá la app Android, que valida tu ubicación mediante GPS.</p>
      </section>
      {nodes.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><h3 className="text-xl font-semibold text-slate-900">Accesos rápidos</h3><p className="mt-1 text-sm text-slate-600">Consultá la información más importante de tus nodos.</p></div>
            <Link href="/nodes" className="text-sm font-semibold text-slate-700 underline">Ver todos</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {nodes.slice(0, 3).map((node) => (
              <Link key={node.id} href={`/nodes/${node.id}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400">
                <span className="font-semibold text-slate-900">{node.name}</span><span className="mt-2 block text-sm text-slate-500">Horario, ranking y racha</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DashboardCard({ label, count, href, linkLabel, tone }: { label: string; count: number; href: string; linkLabel: string; tone: "emerald" | "amber" }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-4xl font-bold text-slate-900">{count}</p><Link href={href} className={`mt-5 inline-block font-semibold ${tone === "emerald" ? "text-emerald-700" : "text-amber-700"}`}>{linkLabel}</Link></article>;
}
