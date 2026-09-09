import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import {
  getCurrentOpenPresenceSession,
} from "@/lib/api/presence";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentSession =
    await getCurrentOpenPresenceSession();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="mt-1 text-slate-600">
          Sesión iniciada como {user?.email}
        </p>
      </div>

      <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Presencia actual
        </h3>

        {!currentSession ? (
          <p className="mt-3 text-slate-600">
            No tenés ninguna sesión de presencia activa.
          </p>
        ) : (
          <div className="mt-4">
            <p className="text-slate-700">
              Nodo:{" "}
              <span className="font-medium">
                {currentSession.nodeName}
              </span>
            </p>

            <p className="mt-1 text-slate-700">
              Estado:{" "}
              <span className="font-medium">
                {currentSession.status}
              </span>
            </p>

            <p className="mt-1 text-slate-700">
              Inicio:{" "}
              {new Date(
                currentSession.startedAt
              ).toLocaleString("es-AR")}
            </p>

            <Link
              href={`/nodes/${currentSession.nodeId}`}
              className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Ver sesión
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}