import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <span className="text-xl font-bold">Biblio2</span>
        <Link
          href="/login"
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold transition hover:bg-white/10"
        >
          Iniciar sesión
        </Link>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-32">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Presencia simple y transparente
          </p>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
            Toda la información de tus nodos, en un solo lugar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Consultá horarios, ranking, temporadas y tu racha. Si administrás un nodo, gestioná su ubicación, integrantes y configuración desde la Web.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-lg bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Acceder a mi cuenta
            </Link>
            <span className="flex items-center text-sm text-slate-400">
              El registro de presencia se realiza desde la app móvil.
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {["Tus nodos y horarios", "Ranking, temporadas y rachas", "Administración centralizada"].map((feature) => (
            <article key={feature} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 h-2 w-12 rounded-full bg-emerald-400" />
              <h2 className="text-lg font-semibold">{feature}</h2>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
