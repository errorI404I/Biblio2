import { NodeCard } from "@/components/nodes/NodeCard";
import { getCurrentUserNodes } from "@/lib/api/nodes";

export default async function NodesPage() {
  const nodes = await getCurrentUserNodes();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Mis nodos
        </h2>

        <p className="mt-1 text-slate-600">
          Estos son los nodos a los que pertenecés.
        </p>
      </div>

      {nodes.length === 0 ? (
        <div className="rounded-lg border border-slate-300 bg-white p-6">
          <p className="text-slate-700">
            Todavía no pertenecés a ningún nodo.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
            />
          ))}
        </div>
      )}
    </div>
  );
}