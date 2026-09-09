import Link from "next/link";
import { JoinNodeButton } from "@/components/nodes/JoinNodeButton";

import { createClient } from "@/lib/supabase/server";
import { getInvitationByCode } from "@/lib/api/invitations";

type JoinPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function JoinPage({
  params,
}: JoinPageProps) {
  const { code } = await params;

  const invitation =
    await getInvitationByCode(code);

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-lg border border-slate-300 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Invitación inválida
          </h1>

          <p className="mt-3 text-slate-600">
            El enlace no existe, fue revocado o ya venció.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-lg rounded-lg border border-slate-300 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Invitación
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {invitation.nodeName}
        </h1>

        {invitation.nodeDescription && (
          <p className="mt-3 text-slate-600">
            {invitation.nodeDescription}
          </p>
        )}

        {invitation.expiresAt && (
          <p className="mt-4 text-sm text-slate-500">
            Esta invitación vence el{" "}
            {new Date(
              invitation.expiresAt
            ).toLocaleString("es-AR")}
          </p>
        )}

        <div className="mt-6">
            {!user ? (
  <Link
    href={`/login?next=/join/${code}`}
    className="inline-block rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
  >
    Continuar con Google
  </Link>
) : (
  <div className="space-y-4">
    <p className="text-slate-700">
      Sesión iniciada como{" "}
      <span className="font-medium">
        {user.email}
      </span>
    </p>

    <JoinNodeButton code={code} />
  </div>
)}
          
        </div>
      </div>
    </main>
  );
}