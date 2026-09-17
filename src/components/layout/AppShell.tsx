import Link from "next/link";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import { UserMenu } from "./UserMenu";

type AppShellProps = {
  children: React.ReactNode;
};

export async function AppShell({
  children,
}: AppShellProps) {
  const supabase = await createClient();

  const cookieStore = await cookies();

  const isAdminMode =
    cookieStore.get("app_mode")?.value === "admin";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile:
    | {
        display_name: string | null;
        avatar_url: string | null;
      }
    | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    profile = data;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className={`sticky top-0 z-40 border-b ${
          isAdminMode
            ? "border-amber-200 bg-amber-50"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              href={
                isAdminMode
                  ? "/admin"
                  : "/dashboard"
              }
              className="text-lg font-bold text-slate-900"
            >
              Biblio2
            </Link>

            {isAdminMode && (
              <nav className="hidden items-center gap-6 md:flex">
                <Link
                  href="/admin"
                  className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
                >
                  Administración
                </Link>

                <Link
                  href="/admin/nodes/create"
                  className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
                >
                  Crear nodo
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAdminMode && (
              <span className="hidden rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-900 sm:inline-flex">
                ADMIN
              </span>
            )}

            <UserMenu
              email={user?.email}
              displayName={profile?.display_name}
              avatarUrl={profile?.avatar_url}
              isAdminMode={isAdminMode}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
