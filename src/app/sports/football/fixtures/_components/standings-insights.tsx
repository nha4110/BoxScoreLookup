import Link from "next/link";
import { leagueSlug } from "./fixtures-data";
import type { Competition, Standing } from "./types";

export async function StandingsInsights({ competition }: { competition: Competition }) {
  const baseUrl = process.env.BACKEND_URL || "https://boxscore-backend.fly.dev";
  const url = `${baseUrl}/api/football/competitions/${competition.code}/standings`;
  let standings: Standing[] = [];
  try {
    const response = await fetch(url, {
      headers: { "X-Backend-Secret": process.env.BACKEND_SECRET || "nha4110" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      console.error(`Football standings request failed (HTTP ${response.status}): ${url}`);
    } else {
      const data: { standings?: { table?: Standing[] }[] } =
        await response.json();
      standings = data.standings?.[0]?.table ?? [];
    }
  } catch (error) {
    console.error(`Unable to load ${competition.name} standings:`, error);
  }
  if (!standings.length) return <StandingsMessage />;

  return (
    <section className="trip-line flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-4 font-sans sm:p-5 lg:h-full">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-300">
          Standings Insights
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">{competition.name}</h2>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-3 py-2.5 font-medium">Pos</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Club</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {standings.slice(0, 5).map((standing) => (
              <tr key={standing.team.id} className="text-slate-300">
                <td className="w-12 px-3 py-2.5 font-semibold tabular-nums text-blue-300">
                  {standing.position}
                </td>
                <th scope="row" className="truncate px-3 py-2.5 font-medium text-white">
                  {standing.team.name}
                </th>
                <td className="w-14 px-3 py-2.5 text-right font-semibold tabular-nums text-white">
                  {standing.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link
        href={`/sports/football/standings?league=${leagueSlug(competition.code)}`}
        className="mt-4 inline-flex min-h-10 items-center justify-center self-start rounded-lg border border-slate-700 px-4 text-sm font-medium text-slate-200 transition-colors duration-150 hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-200"
      >
        Full Standings
      </Link>
    </section>
  );
}

function StandingsMessage() {
  return (
    <section
      role="status"
      className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-4 font-sans sm:p-5 lg:h-full"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-blue-300">
        Standings Insights
      </p>
      <p className="mt-3 text-sm text-slate-400">Standings are unavailable right now.</p>
    </section>
  );
}

export function StandingsLoading() {
  return (
    <section
      role="status"
      aria-label="Loading standings"
      className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-4 font-sans sm:p-5 lg:h-full"
    >
      <p className="mb-4 text-sm text-slate-400">Loading standings…</p>
      <div className="grid gap-3" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="h-8 rounded-md bg-slate-900 transition-opacity duration-200" />
        ))}
      </div>
    </section>
  );
}
