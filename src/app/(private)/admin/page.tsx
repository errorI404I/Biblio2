import Link from "next/link";

import { AdminNodeCard } from "@/components/admin/AdminNodeCard";
import { getCurrentUserAdminNodes } from "@/lib/api/nodes";

export default async function AdminPage() {
  const nodes = await getCurrentUserAdminNodes();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Administración
          </h2>

          <p className="mt-1 text-slate-600">
            Gestioná los nodos donde tenés permisos de administrador.
          </p>
        </div>

        <Link
          href="/admin/nodes/create"
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
        >
          Crear nodo
        </Link>
      </div>

      {nodes.length === 0 ? (
        <div className="rounded-lg border border-slate-300 bg-white p-6">
          <p className="text-slate-700">
            Todavía no administrás ningún nodo.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {nodes.map((node) => (
            <AdminNodeCard
              key={node.id}
              node={node}
            />
          ))}
        </div>
      )}
    </div>
  );
}