import Link from "next/link";

const sports = [
  {
    name: "Football",
    description: "Fixtures, results and standings for the beautiful game.",
    status: "Available",
    href: "/sports/football",
    available: true,
  },
  {
    name: "Basketball",
    description: "Scores, schedules and league tables.",
    status: "Coming Soon",
    available: false,
  },
  {
    name: "Tennis",
    description: "Follow tournaments, matches and player rankings.",
    status: "Coming Soon",
    available: false,
  },
] as const;

export default function SportsPage() {
  return (
    <main className="w-full flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-blue-300">Choose your game</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Available Sports
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Start with football today. More sports are on the way.
          </p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport, index) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-semibold text-blue-300">
                    0{index + 1}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      sport.available
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {sport.status}
                  </span>
                </div>
                <h2 className="mt-6 text-xl font-semibold text-white">
                  {sport.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {sport.description}
                </p>
                <p className="mt-6 text-sm font-medium text-blue-300">
                  {sport.available ? "Explore football →" : "In development"}
                </p>
              </>
            );

            return sport.available ? (
              <Link
                key={sport.name}
                href={sport.href}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-200 hover:scale-105 hover:border-slate-700 hover:shadow-lg"
              >
                {content}
              </Link>
            ) : (
              <article
                key={sport.name}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                {content}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
