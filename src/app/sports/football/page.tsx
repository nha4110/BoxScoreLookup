import Link from "next/link";

const dashboardItems = [
  {
    title: "Fixtures",
    description: "Upcoming matches and schedules.",
    href: "/sports/football/fixtures",
    number: "01",
  },
  {
    title: "Match Stats",
    description: "Scores and completed matches.",
    href: "/sports/football/results",
    number: "02",
  },
  {
    title: "Standings",
    description: "League tables and team positions.",
    href: "/sports/football/standings",
    number: "03",
  },
];

export default function FootballPage() {
  return (
    <main className="w-full flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-blue-300">Sports / Football</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Football Dashboard
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Fixtures, results and standings — all in one place.
          </p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {dashboardItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-200 hover:scale-105 hover:border-slate-700 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-semibold text-blue-300">
                  {item.number}
                </span>
                <span className="text-lg text-slate-500 transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-300">
                  →
                </span>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-white">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
