import { Suspense } from "react";
import { connection } from "next/server";

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

async function StandingsTable() {
  await connection();

  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return <StandingsMessage message="Football API key is not configured." />;
  }

  let standings: Standing[] = [];
  let errorMessage: string | null = null;

  try {
    const response = await fetch(
      "https://api.football-data.org/v4/competitions/PL/standings",
      {
        headers: { "X-Auth-Token": apiKey },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      errorMessage = `Football API request failed (HTTP ${response.status}).`;
    } else {
      const data: StandingsResponse = await response.json();
      standings = data.standings?.[0]?.table ?? [];
    }
  } catch (error) {
    console.error("Unable to load Premier League standings:", error);
    errorMessage = "Unable to load standings. Please try again later.";
  }

  if (errorMessage) {
    return <StandingsMessage message={errorMessage} />;
  }

  if (standings.length === 0) {
    return <StandingsMessage message="Premier League standings are unavailable." />;
  }

  return (
    <div className="mt-9 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
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
          {standings.map((standing) => (
            <tr key={standing.team.id} className="text-slate-300">
              <td className="px-4 py-4 font-medium text-blue-300 sm:px-5">
                {standing.position}
              </td>
              <th
                scope="row"
                className="whitespace-nowrap px-4 py-4 font-medium text-white sm:px-5"
              >
                {standing.team.name}
              </th>
              <td className="px-4 py-4 text-center">{standing.playedGames}</td>
              <td className="px-4 py-4 text-center">{standing.won}</td>
              <td className="px-4 py-4 text-center">{standing.draw}</td>
              <td className="px-4 py-4 text-center">{standing.lost}</td>
              <td className="px-4 py-4 text-center font-semibold text-white">
                {standing.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default function FootballStandingsPage() {
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
            Premier League standings and team positions.
          </p>
        </div>
        <Suspense fallback={<StandingsLoading />}>
          <StandingsTable />
        </Suspense>
      </div>
    </main>
  );
}
