import Link from "next/link";

import type { UserNode } from "@/types/node";

type AdminNodeCardProps = {
  node: UserNode;
};

export function AdminNodeCard({
  node,
}: AdminNodeCardProps) {
  return (
    <article className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {node.name}
          </h3>

          {node.description && (
            <p className="mt-1 text-sm text-slate-600">
              {node.description}
            </p>
          )}
        </div>

        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          ADMIN
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-slate-700">
        <p>
          Estado:{" "}
          <span className="font-medium">
            {node.isActive ? "Activo" : "Desactivado"}
          </span>
        </p>

        <p>
          Validación:{" "}
          <span className="font-medium">
            {node.validationMethod}
          </span>
        </p>
      </div>

      <Link
        href={`/admin/nodes/${node.id}`}
        className="mt-5 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Administrar
      </Link>
    </article>
  );
}