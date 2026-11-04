import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              The match-day essentials
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              BoxScore
              <span className="text-blue-400">Lookup</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Fast football fixtures, standings and results without clutter.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sports"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-105 hover:bg-blue-400 hover:shadow-lg"
              >
                Browse Sports
              </Link>
              <Link
                href="/sports/football"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/50 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              >
                Football Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-14 sm:mt-16" aria-labelledby="overview-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-300">Stay in the game</p>
              <h2
                id="overview-heading"
                className="mt-1 text-2xl font-semibold tracking-tight text-white"
              >
                Everything you need, at a glance
              </h2>
            </div>
            <p className="text-sm text-slate-400">Football coverage, made simple.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Fixtures",
                description: "See upcoming matches and schedules in one place.",
                href: "/sports/football/fixtures",
                number: "01",
              },
              {
                title: "Results",
                description: "Catch up on the latest scores and completed matches.",
                href: "/sports/football/results",
                number: "02",
              },
              {
                title: "Standings",
                description: "Keep track of league tables and the race for the top.",
                href: "/sports/football/standings",
                number: "03",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-200 hover:scale-105 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-semibold text-blue-300">
                    {item.number}
                  </span>
                  <span className="text-lg text-slate-500 transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-300">
                    →
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
