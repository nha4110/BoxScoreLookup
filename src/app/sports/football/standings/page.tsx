import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

type Competition = {
  code: string;
  slug: string;
  name: string;
};

const COMPETITIONS: Competition[] = [
  { code: "CL", slug: "champions-league", name: "Champions League" },
  { code: "PL", slug: "epl", name: "Premier League" },
  { code: "PD", slug: "laliga", name: "La Liga" },
  { code: "SA", slug: "serie-a", name: "Serie A" },
  { code: "BL1", slug: "bundesliga", name: "Bundesliga" },
  { code: "PPL", slug: "primeira-liga", name: "Primeira Liga" },
];

type Standing = {
  position: number;
  team: { id: number; name: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
};

type StandingsResponse = {
  standings: { table: Standing[] }[];
};

async function StandingsTable({
  competition,
}: {
  competition: Competition;
}) {
  let standings: Standing[] = [];
  let errorMessage: string | null = null;

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL || "https://boxscore-backend.fly.dev"}/api/football/competitions/${competition.code}/standings`,
      {
        headers: { "X-Backend-Secret": process.env.BACKEND_SECRET || "nha4110" },
        next: { revalidate: 60 * 60 },
      },
    );

    if (!response.ok) {
      errorMessage = `Football API request failed (HTTP ${response.status}).`;
    } else {
      const data: StandingsResponse = await response.json();
      standings = data.standings?.[0]?.table ?? [];
    }
  } catch (error) {
    console.error(`Unable to load ${competition.name} standings:`, error);
    errorMessage = "Unable to load standings. Please try again later.";
  }

  if (errorMessage) {
    return <StandingsMessage message={errorMessage} />;
  }

  if (standings.length === 0) {
    return (
      <StandingsMessage
        message={`${competition.name} standings are unavailable.`}
      />
    );
  }

  const topFive = standings.slice(0, 5);
  const maxPoints = Math.max(...topFive.map((standing) => standing.points), 1);

  return (
    <div className="standings-enter standings-scroll mt-9 overflow-x-auto overflow-y-hidden rounded-sm border border-slate-800 bg-slate-900">
      <table className="w-full min-w-150 text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th scope="col" className="px-4 py-4 font-medium sm:px-5">
              Position
            </th>
            <th scope="col" className="px-4 py-4 font-medium sm:px-5">
              Team
            </th>
            <th scope="col" className="px-4 py-4 text-center font-medium sm:px-5">
              Played
            </th>
            <th scope="col" className="px-4 py-4 text-center font-medium sm:px-5">
              Won
            </th>
            <th scope="col" className="px-4 py-4 text-center font-medium sm:px-5">
              Draw
            </th>
            <th scope="col" className="px-4 py-4 text-center font-medium sm:px-5">
              Lost
            </th>
            <th scope="col" className="px-4 py-4 text-center font-medium sm:px-5">
              Points
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {topFive.map((standing) => (
            <tr
              key={`${competition.code}-${standing.team.id}`}
              className="standings-row text-(--app-text-primary) hover:bg-slate-800"
            >
              <td className="px-4 py-4 font-medium text-blue-300 sm:px-5">
                {standing.position}
              </td>
              <th
                scope="row"
                className="whitespace-nowrap px-4 py-4 font-medium text-white sm:px-5"
              >
                <Link
                  href={`/sports/football/team-stats?teamId=${standing.team.id}`}
                  className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                >
                  {standing.team.name}
                </Link>
              </th>
              <td className="px-4 py-4 text-center">{standing.playedGames}</td>
              <td className="px-4 py-4 text-center">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 text-xs font-semibold tabular-nums text-emerald-300">{standing.won}</span>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20 px-2 text-xs font-semibold tabular-nums text-amber-300">{standing.draw}</span>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/20 px-2 text-xs font-semibold tabular-nums text-rose-300">{standing.lost}</span>
              </td>
              <td className="min-w-52 px-4 py-4">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <span className="whitespace-nowrap font-semibold tabular-nums text-white">
                    {standing.points} <span className="text-xs text-slate-400">PTS</span>
                  </span>
                  <div
                    role="img"
                    aria-label={`${standing.points} points, ${Math.round((standing.points / maxPoints) * 100)} percent of leader`}
                    className="hidden h-1.5 min-w-12 flex-1 overflow-hidden rounded-full bg-slate-800 sm:block"
                  >
                    <div
                      className="h-full rounded-full bg-blue-400 transition-[width] duration-300"
                      style={{
                        width: `${Math.round((standing.points / maxPoints) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getCompetition(
  leagueParam?: string | string[],
  legacyCompetitionParam?: string | string[],
): Competition {
  const requestedLeague = Array.isArray(leagueParam)
    ? leagueParam[0]
    : leagueParam;
  const legacyCode = Array.isArray(legacyCompetitionParam)
    ? legacyCompetitionParam[0]
    : legacyCompetitionParam;
  const normalizedLeague = requestedLeague?.toLocaleLowerCase();

  return (
    COMPETITIONS.find(
      (competition) =>
        competition.slug === normalizedLeague ||
        competition.code.toLocaleLowerCase() === normalizedLeague,
    ) ??
    COMPETITIONS.find((competition) => competition.code === legacyCode) ??
    COMPETITIONS.find((competition) => competition.code === "PL")!
  );
}

function StandingsLeagueSelector({
  selectedCompetition,
}: {
  selectedCompetition: Competition;
}) {
  return (
    <div className="mt-6 max-w-sm">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">
        League
      </span>
      <details className="group relative">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-[background-color,border-color] duration-200 hover:border-slate-600 [&::-webkit-details-marker]:hidden">
          {selectedCompetition.name}
          <span
            aria-hidden="true"
            className="text-slate-400 transition-transform duration-200 group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <nav
          aria-label="Select standings league"
          className="invisible absolute left-0 top-12 z-20 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-2 opacity-0 shadow-xl transition-opacity duration-200 group-open:visible group-open:opacity-100"
        >
          <form action="/sports/football/standings" method="get">
            {COMPETITIONS.map((competition) => (
              <button
                key={competition.code}
                type="submit"
                name="league"
                value={competition.slug}
                aria-current={
                  competition.code === selectedCompetition.code
                    ? "true"
                    : undefined
                }
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-[background-color,border-color] duration-200 ${
                  competition.code === selectedCompetition.code
                    ? "bg-blue-500/15 font-medium text-blue-200"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {competition.name}
              </button>
            ))}
          </form>
        </nav>
      </details>
    </div>
  );
}

function StandingsMessage({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="mt-9 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300 sm:p-8"
    >
      {message}
    </div>
  );
}

function StandingsLoading() {
  return (
    <div
      role="status"
      className="mt-9 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400 sm:p-8"
    >
      Loading standings…
    </div>
  );
}

async function StandingsContent({
  searchParams,
}: {
  searchParams: Promise<{
    league?: string | string[];
    competition?: string | string[];
  }>;
}) {
  await connection();
  const params = await searchParams;
  const selectedCompetition = getCompetition(
    params.league,
    params.competition,
  );

  return (
    <main className="w-full flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-blue-300">
            Football / Standings
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Football Standings
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            {selectedCompetition.name} standings and team positions.
          </p>
        </div>
        <StandingsLeagueSelector selectedCompetition={selectedCompetition} />
        <Suspense fallback={<StandingsLoading />}>
          <StandingsTable competition={selectedCompetition} />
        </Suspense>
      </div>
      <style>{`
        @keyframes standings-enter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .standings-enter { animation: standings-enter 360ms ease-out both; }
        .standings-row { animation: standings-enter 420ms ease-out both; }
        .standings-scroll { scrollbar-width: none; }
        .standings-scroll::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .standings-enter, .standings-row { animation: none; }
        }
      `}</style>
    </main>
  );
}

export default function FootballStandingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    league?: string | string[];
    competition?: string | string[];
  }>;
}) {
  return (
    <Suspense fallback={<StandingsLoading />}>
      <StandingsContent searchParams={searchParams} />
    </Suspense>
  );
}
