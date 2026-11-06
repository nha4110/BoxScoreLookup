import Link from "next/link";

export const instant = false;

type Standing = {
  position: number;
  points: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  team: { id: number; name: string };
};

const FEATURED_LEAGUES = [
  { code: "CL", name: "Champions League" },
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "La Liga" },
  { code: "SA", name: "Serie A" },
  { code: "BL1", name: "Bundesliga" },
  { code: "PPL", name: "Primeira Liga" },
];

async function getLeagueStandings(code: string): Promise<Standing[]> {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL || "https://boxscore-backend.fly.dev"}/api/football/competitions/${code}/standings`,
      {
        headers: { "X-Backend-Secret": process.env.BACKEND_SECRET || "nha4110" },
        next: { revalidate: 3600 },
      },
    );
    if (!response.ok) {
      console.error(`Homepage ${code} standings request failed (HTTP ${response.status}).`);
      return [];
    }

    const data: { standings?: { table?: Standing[] }[] } = await response.json();
    return data.standings?.[0]?.table ?? [];
  } catch (error) {
    console.error(`Unable to load homepage ${code} standings:`, error);
    return [];
  }
}

function LeagueTicker({ standings }: { standings: Standing[] }) {
  const items = standings.slice(0, 5).map((standing) => ({
    id: standing.team.id,
    name: standing.team.name,
  }));
  if (!items.length) {
    return (
      <p role="status" className="trip-line rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-slate-400">
        League ticker data is temporarily unavailable.
      </p>
    );
  }
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
                key={`${team.id}-${index}`}
                className="flex items-center gap-7 whitespace-nowrap text-xs font-medium text-slate-300"
                aria-hidden={index >= items.length}
              >
                <Link
                  href={`/sports/football/team-stats?teamName=${encodeURIComponent(team.name)}`}
                  tabIndex={index >= items.length ? -1 : undefined}
                  aria-hidden={index >= items.length}
                  className="transition-colors duration-150 hover:text-blue-300"
                >
                  {team.name}
                </Link>
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
  const topFive = standings.slice(0, 5);
  const leader = Math.max(1, ...topFive.map((standing) => standing.points));

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
          className="text-sm font-semibold text-blue-300 transition-colors duration-150 hover:text-blue-200"
        >
          Full table <span aria-hidden="true">→</span>
        </Link>
      </div>

      {topFive.length ? (
        <div className="mt-6 space-y-5">
          {topFive.map((standing) => (
            <div key={standing.team.id} className="grid gap-2 sm:grid-cols-[minmax(8rem,1fr)_2fr_auto] sm:items-center sm:gap-4">
              <Link
                href={`/sports/football/team-stats?teamId=${standing.team.id}`}
                className="truncate text-sm font-semibold text-slate-100 transition-colors duration-150 hover:text-blue-300"
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
                  className="h-full rounded-full bg-rose-400 transition-[width] duration-300"
                  style={{ width: `${Math.max(3, (standing.points / leader) * 100)}%` }}
                />
              </div>
              <p className="flex gap-3 text-xs tabular-nums text-slate-300 sm:justify-end">
                <span className="font-semibold text-slate-100">{standing.points} PTS</span>
                <span className="flex gap-1.5" aria-label={`${standing.won} wins, ${standing.draw} draws, ${standing.lost} losses`}>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-emerald-300" aria-label={`${standing.won} wins`}>{standing.won}</span>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-amber-300" aria-label={`${standing.draw} draws`}>{standing.draw}</span>
                  <span className="rounded-full border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-rose-300" aria-label={`${standing.lost} losses`}>{standing.lost}</span>
                </span>
              </p>
            </div>
          ))}
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-700 pt-4 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            <span>Wins</span><span>Draws</span><span>Losses</span>
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

function goalDifference(standing: Standing): number | null {
  if (standing.goalDifference != null) return standing.goalDifference;
  if (standing.goalsFor != null && standing.goalsAgainst != null) {
    return standing.goalsFor - standing.goalsAgainst;
  }
  return null;
}

function ChampionsLeagueLeaders({ standings }: { standings: Standing[] }) {
  const useGoalDifference = standings.some((standing) => goalDifference(standing) != null);
  const leaders = [...standings]
    .sort((left, right) => {
      const leftMetric = useGoalDifference
        ? goalDifference(left) ?? left.goalsFor ?? 0
        : left.goalsFor ?? 0;
      const rightMetric = useGoalDifference
        ? goalDifference(right) ?? right.goalsFor ?? 0
        : right.goalsFor ?? 0;
      return rightMetric - leftMetric;
    })
    .slice(0, 5);
  const max = Math.max(
    1,
    ...leaders.map((standing) =>
      useGoalDifference
        ? goalDifference(standing) ?? standing.goalsFor ?? 0
        : standing.goalsFor ?? 0,
    ),
  );
  const metricLabel = useGoalDifference ? "Goal difference" : "Goals scored";

  return (
    <section className="trip-line rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Champions League · Top five</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-100">Goal leaders</h2>
      </div>
      {leaders.length ? (
        <ol className="mt-5 space-y-4">
          {leaders.map((standing, index) => {
            const value = useGoalDifference
              ? goalDifference(standing) ?? standing.goalsFor ?? 0
              : standing.goalsFor ?? 0;
            return (
              <li key={standing.team.id} className="grid grid-cols-[minmax(0,1fr)_2fr_auto] items-center gap-3">
                <Link
                  href={`/sports/football/team-stats?teamId=${standing.team.id}`}
                  className="truncate text-sm font-medium text-slate-100 transition-colors duration-150 hover:text-blue-300"
                >
                  <span className="mr-2 text-xs tabular-nums text-slate-500">{index + 1}.</span>
                  {standing.team.name}
                </Link>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800" role="img" aria-label={`${value} ${metricLabel}`}>
                  <div className="h-full rounded-full bg-rose-400" style={{ width: `${Math.max(3, (Math.max(0, value) / max) * 100)}%` }} />
                </div>
                <span className="text-xs font-semibold tabular-nums text-slate-200">{value}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p role="status" className="mt-5 text-sm text-slate-400">Champions League goal data is unavailable.</p>
      )}
      <p className="mt-4 text-xs text-slate-500">Ranked by {metricLabel.toLowerCase()}.</p>
    </section>
  );
}

function LeagueGoalsChart({
  standingsByLeague,
}: {
  standingsByLeague: Record<string, Standing[]>;
}) {
  const leaders = FEATURED_LEAGUES.filter((league) => league.code !== "CL").map((league) => {
    const topScorer = [...(standingsByLeague[league.code] ?? [])]
      .filter((standing) => standing.goalsFor != null)
      .sort((left, right) => (right.goalsFor ?? 0) - (left.goalsFor ?? 0))[0];
    return {
      ...league,
      team: topScorer?.team.name,
      goals: topScorer?.goalsFor ?? 0,
    };
  });
  const maxGoals = Math.max(1, ...leaders.map((leader) => leader.goals));
  const axisMax = Math.ceil(maxGoals / 5) * 5;
  const ticks = Array.from({ length: 5 }, (_, index) => Math.round((axisMax * index) / 4));

  return (
    <section className="trip-line rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Featured competitions</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-100">Top team goals by league</h2>
        <p className="mt-1 text-xs text-slate-400">Goals scored by each competition&apos;s leading team</p>
      </div>
      <div className="mt-6 grid h-52 grid-cols-[2.5rem_1fr] gap-3">
        <div className="flex flex-col justify-between pb-7 text-right text-[10px] tabular-nums text-slate-500" aria-hidden="true">
          {[...ticks].reverse().map((tick) => <span key={tick}>{tick}</span>)}
        </div>
        <div className="relative border-b border-l border-slate-700">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-7">
            {ticks.slice(1, -1).map((tick) => (
              <div
                key={tick}
                className="absolute right-0 left-0 border-t border-dashed border-slate-700/70"
                style={{ top: `${100 - (tick / axisMax) * 100}%` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 bottom-7 grid grid-cols-5 gap-2 px-2">
            {leaders.map((leader) => {
              const height = leader.team ? (leader.goals / axisMax) * 100 : 0;
              return (
                <div key={leader.code} className="relative h-full min-w-0">
                  <span
                    className="absolute left-1/2 z-10 -translate-x-1/2 text-[10px] font-semibold tabular-nums text-slate-200"
                    style={{ bottom: `calc(${height}% + 4px)` }}
                  >
                    {leader.team ? leader.goals : "—"}
                  </span>
                  <div
                    className="absolute bottom-0 left-1/2 w-full max-w-10 -translate-x-1/2 rounded-t-md bg-rose-400"
                    style={{ height: `${height}%` }}
                    role="img"
                    aria-label={leader.team ? `${leader.team}, ${leader.goals} goals in ${leader.name}` : `Goal data unavailable for ${leader.name}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="absolute inset-x-0 bottom-0 grid h-7 grid-cols-5 items-center gap-2 px-2">
            {leaders.map((leader) => (
              <span key={leader.code} className="wrap-break-word text-center text-[10px] font-semibold leading-tight text-slate-400">{leader.name}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-slate-500">Y-axis: goals scored</p>
    </section>
  );
}

export default async function Home() {
  const leagueResults = await Promise.all(
    FEATURED_LEAGUES.map(async (league) => [
      league.code,
      await getLeagueStandings(league.code),
    ] as const),
  );
  const standingsByLeague = Object.fromEntries(leagueResults);
  const standings = standingsByLeague.PL ?? [];
  const championsLeague = standingsByLeague.CL ?? [];

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
                className="inline-flex min-h-11 items-center rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Browse fixtures <span aria-hidden="true" className="ml-2">→</span>
              </Link>
              <Link
                href="/sports/football/standings?league=epl"
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition-all duration-150 hover:border-blue-300"
              >
                League standings
              </Link>
            </div>
          </div>
          <TopTeamsChart standings={standings} />
        </section>
        <section className="grid gap-6">
          <ChampionsLeagueLeaders standings={championsLeague} />
          <LeagueGoalsChart standingsByLeague={standingsByLeague} />
        </section>
      </div>
    </main>
  );
}
