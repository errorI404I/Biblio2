import Link from "next/link";

export function AppSidebar() {
  return (
    <aside className="min-h-[calc(100vh-65px)] w-64 border-r border-slate-300 bg-slate-900 p-4">
      <nav className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="rounded-md px-3 py-2 text-slate-100 hover:bg-slate-800"
        >
          Dashboard
        </Link>

        <Link
          href="/nodes"
          className="rounded-md px-3 py-2 text-slate-100 hover:bg-slate-800"
        >
          Mis nodos
        </Link>

        <Link
          href="/profile"
          className="rounded-md px-3 py-2 text-slate-100 hover:bg-slate-800"
        >
          Perfil
        </Link>

        <Link
          href="/admin"
          className="rounded-md px-3 py-2 text-slate-100 hover:bg-slate-800"
        >
          Administración
        </Link>
      </nav>
    </aside>
  );
}