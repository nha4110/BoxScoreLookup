import Link from "next/link";

type Standing = {
  position: number;
  points: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  team: { id: number; name: string };
};

async function getLeagueSnapshot(): Promise<Standing[]> {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL || "https://boxscore-backend.fly.dev"}/api/football/competitions/PL/standings`,
      {
        headers: { "X-Backend-Secret": process.env.BACKEND_SECRET || "nha4110" },
        next: { revalidate: 3600 },
      },
    );
    if (!response.ok) {
      console.error(`Homepage standings request failed (HTTP ${response.status}).`);
      return [];
    }

    const data: { standings?: { table?: Standing[] }[] } = await response.json();
    return data.standings?.[0]?.table?.slice(0, 5) ?? [];
  } catch (error) {
    console.error("Unable to load homepage standings snapshot:", error);
    return [];
  }
}

function LeagueTicker({ standings }: { standings: Standing[] }) {
  const items = standings.length
    ? standings.map((standing) => standing.team.name)
    : ["Premier League", "Fixtures", "Standings", "Matchday"];
  const ticker = [...items, ...items];

  return (
    <div className="trip-line overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
      <div className="flex items-center gap-4 px-4 py-3">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">
          League ticker
        </span>
        <div
          role="region"
          aria-label="Premier League top five"
          className="league-marquee min-w-0 overflow-hidden"
        >
          <div className="league-marquee-track flex w-max items-center gap-7">
            {ticker.map((team, index) => (
              <span
                key={`${team}-${index}`}
                className="flex items-center gap-7 whitespace-nowrap text-xs font-medium text-slate-300"
                aria-hidden={index >= items.length}
              >
                {team}
                <span aria-hidden="true" className="text-rose-500">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopTeamsChart({ standings }: { standings: Standing[] }) {
  const leader = Math.max(1, ...standings.map((standing) => standing.points));

  return (
    <section
      aria-labelledby="top-teams-title"
      className="trip-line rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Premier League · Current table
          </p>
          <h2 id="top-teams-title" className="mt-1 text-xl font-semibold text-slate-100">
            Top team stats
          </h2>
        </div>
        <Link
          href="/sports/football/standings?league=epl"
          className="text-sm font-semibold text-blue-300 transition-colors duration-200 hover:text-blue-200"
        >
          Full table <span aria-hidden="true">→</span>
        </Link>
      </div>

      {standings.length ? (
        <div className="mt-6 space-y-5">
          {standings.map((standing) => (
            <div key={standing.team.id} className="grid gap-2 sm:grid-cols-[minmax(8rem,1fr)_2fr_auto] sm:items-center sm:gap-4">
              <Link
                href={`/sports/football/team-stats?teamId=${standing.team.id}`}
                className="truncate text-sm font-semibold text-slate-100 transition-colors duration-200 hover:text-blue-300"
              >
                <span className="mr-2 text-xs tabular-nums text-slate-500">
                  {String(standing.position).padStart(2, "0")}
                </span>
                {standing.team.name}
              </Link>
              <div
                role="img"
                aria-label={`${standing.points} points`}
                className="h-2 overflow-hidden rounded-full bg-slate-800"
              >
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-300"
                  style={{ width: `${Math.max(3, (standing.points / leader) * 100)}%` }}
                />
              </div>
              <p className="flex gap-3 text-xs tabular-nums text-slate-300 sm:justify-end">
                <span className="font-semibold text-slate-100">{standing.points} PTS</span>
                <span aria-label={`${standing.won} wins, ${standing.draw} draws, ${standing.lost} losses`}>
                  <span className="text-emerald-300">✓{standing.won}</span>{" "}
                  <span className="text-amber-300">={standing.draw}</span>{" "}
                  <span className="text-rose-300">×{standing.lost}</span>
                </span>
              </p>
            </div>
          ))}
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-700 pt-4 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            <span>✓ Wins</span><span>= Draws</span><span>× Losses</span>
            <span className="ml-auto">Points relative to leader</span>
          </div>
        </div>
      ) : (
        <p role="status" className="mt-6 rounded-xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-300">
          League data is temporarily unavailable. Open the standings page to choose a competition.
        </p>
      )}
    </section>
  );
}

export default async function Home() {
  const standings = await getLeagueSnapshot();

  return (
    <main className="w-full flex-1">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-5 py-7 sm:px-8 sm:py-12">
        <LeagueTicker standings={standings} />
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="trip-line flex min-h-72 flex-col justify-between rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400">
                Football · Matchday hub
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
                The season,<br />in clear view.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Fixtures, league positions and team form — no clutter between you and the game.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/sports/football/fixtures"
                className="inline-flex min-h-11 items-center rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Browse fixtures <span aria-hidden="true" className="ml-2">→</span>
              </Link>
              <Link
                href="/sports/football/standings?league=epl"
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition-all duration-200 hover:border-blue-300"
              >
                League standings
              </Link>
            </div>
          </div>
          <TopTeamsChart standings={standings} />
        </section>
      </div>
    </main>
  );
}
