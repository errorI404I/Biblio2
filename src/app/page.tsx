import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-lg font-bold">Biblio2</span>

          <Link
            href="/dashboard"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Ir al dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Control de presencia
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Información y administración de tus nodos
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Biblio2 permite consultar nodos, horarios, rankings,
            temporadas y rachas desde la Web. Los administradores también
            pueden gestionar la configuración de cada nodo.
          </p>

          <p className="mt-4 text-slate-600">
            El registro de presencia se realiza exclusivamente desde la app
            móvil mediante ubicación GPS.
          </p>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Acceder al dashboard
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            ["Mis nodos", "Consultá los nodos a los que pertenecés y su información básica."],
            ["Actividad", "Revisá horarios, rankings, temporadas y tu racha actual."],
            ["Administración", "Gestioná ubicación GPS, horarios, invitaciones y temporadas."],
          ].map(([title, description]) => (
            <article
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
