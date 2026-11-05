import type { Team, TeamMatch } from "./types";

function PointsPacingChart({
  matches,
  teamId,
  seasonStartYear,
  total,
}: {
  matches: TeamMatch[];
  teamId: number;
  seasonStartYear: number;
  total: number;
}) {
  const seasonStart = Date.UTC(seasonStartYear, 7, 1);
  const seasonEnd = Date.UTC(seasonStartYear + 1, 5, 1);
  const pacing = matches.reduce<{ total: number; coordinates: string[] }>(
    (record, match) => {
      const isHome = match.homeTeam.id === teamId;
      const goalsFor = isHome
        ? match.score!.fullTime!.home!
        : match.score!.fullTime!.away!;
      const goalsAgainst = isHome
        ? match.score!.fullTime!.away!
        : match.score!.fullTime!.home!;
      const points =
        record.total + (goalsFor > goalsAgainst ? 3 : goalsFor === goalsAgainst ? 1 : 0);
      const progress = (Date.parse(match.utcDate) - seasonStart) / (seasonEnd - seasonStart);
      const x = 42 + Math.max(0, Math.min(1, progress)) * 308;
      const y = 130 - (Math.min(points, 120) / 120) * 120;
      return { total: points, coordinates: [...record.coordinates, `${x},${y}`] };
    },
    { total: 0, coordinates: [] },
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-200">Points pacing</h3>
        <span className="text-xs tabular-nums text-slate-400">{total} season points</span>
      </div>
      <svg
        viewBox="0 0 360 170"
        role="img"
        aria-label={`Points pacing across ${matches.length} matches in the ${seasonStartYear}-${seasonStartYear + 1} season, ending at ${total} points`}
        className="mt-3 h-40 w-full overflow-visible"
        preserveAspectRatio="none"
      >
        {[0, 30, 60, 90, 120].map((points) => {
          const y = 130 - (points / 120) * 120;
          return (
            <g key={points}>
              <path d={`M42 ${y}H350`} stroke="currentColor" strokeOpacity=".16" />
              <text x="36" y={y + 3} textAnchor="end" fill="currentColor" fontSize="8" opacity=".72">
                {points === 120 ? "120 PTS" : points}
              </text>
            </g>
          );
        })}
        {["AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY"].map(
          (month, index) => (
            <text
              key={month}
              x={42 + (index / 9) * 308}
              y="151"
              textAnchor="middle"
              fill="currentColor"
              fontSize="7"
              opacity=".72"
            >
              {month}
            </text>
          ),
        )}
        <polyline
          points={pacing.coordinates.join(" ")}
          fill="none"
          stroke="var(--app-highlight)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export function TeamAnalytics({ team, matches }: { team: Team; matches: TeamMatch[] }) {
  const finishedMatches = matches
    .filter(
      (match) =>
        match.status === "FINISHED" &&
        match.score?.fullTime?.home != null &&
        match.score.fullTime.away != null,
    )
    .sort((left, right) => Date.parse(left.utcDate) - Date.parse(right.utcDate));
  const summary = finishedMatches.reduce(
    (record, match) => {
      const home = match.homeTeam.id === team.id;
      const goalsFor = home ? match.score!.fullTime!.home! : match.score!.fullTime!.away!;
      const goalsAgainst = home ? match.score!.fullTime!.away! : match.score!.fullTime!.home!;
      record.goalsFor += goalsFor;
      record.goalsAgainst += goalsAgainst;
      if (goalsFor > goalsAgainst) record.wins += 1;
      else if (goalsFor === goalsAgainst) record.draws += 1;
      else record.losses += 1;
      return record;
    },
    { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 },
  );
  const played = finishedMatches.length;
  const metrics = [
    ["Played", played],
    ["Wins", summary.wins],
    ["Draws", summary.draws],
    ["Losses", summary.losses],
    ["Goal difference", summary.goalsFor - summary.goalsAgainst],
  ];
  const maxGoals = Math.max(summary.goalsFor, summary.goalsAgainst, 1);
  const lastMatchDate = played ? new Date(finishedMatches[played - 1].utcDate) : new Date();
  const seasonStartYear =
    lastMatchDate.getUTCMonth() >= 7
      ? lastMatchDate.getUTCFullYear()
      : lastMatchDate.getUTCFullYear() - 1;
  const seasonMatches = finishedMatches.filter((match) => {
    const date = Date.parse(match.utcDate);
    return date >= Date.UTC(seasonStartYear, 7, 1) &&
      date < Date.UTC(seasonStartYear + 1, 5, 1);
  });
  const seasonPoints = seasonMatches.reduce((points, match) => {
    const home = match.homeTeam.id === team.id;
    const goalsFor = home ? match.score!.fullTime!.home! : match.score!.fullTime!.away!;
    const goalsAgainst = home ? match.score!.fullTime!.away! : match.score!.fullTime!.home!;
    return points + (goalsFor > goalsAgainst ? 3 : goalsFor === goalsAgainst ? 1 : 0);
  }, 0);
  const percentage = (count: number) => played ? Math.round((count / played) * 100) : 0;

  return (
    <section
      id="team-overview"
      role="tabpanel"
      className="team-tab-content hidden transition-all duration-300 ease-in-out peer-checked/overview:block"
    >
      <div className="grid gap-3 pt-5 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</p>
          </div>
        ))}
      </div>
      {played ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-200">Results breakdown</h3>
              <span className="text-xs text-slate-500">{played} played</span>
            </div>
            <div
              role="img"
              aria-label={`${summary.wins} wins, ${summary.draws} draws, ${summary.losses} losses`}
              className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-800"
            >
              <span className="bg-emerald-400 transition-all duration-300" style={{ width: `${percentage(summary.wins)}%` }} />
              <span className="bg-amber-300 transition-all duration-300" style={{ width: `${percentage(summary.draws)}%` }} />
              <span className="bg-rose-400 transition-all duration-300" style={{ width: `${percentage(summary.losses)}%` }} />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
              <span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />Wins {summary.wins}</span>
              <span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-300" />Draws {summary.draws}</span>
              <span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-rose-400" />Losses {summary.losses}</span>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <h3 className="text-sm font-semibold text-slate-200">Goals scored vs conceded</h3>
            <div className="mt-4 space-y-4">
              {[
                { label: "Scored", count: summary.goalsFor, color: "bg-blue-400" },
                { label: "Conceded", count: summary.goalsAgainst, color: "bg-slate-500" },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-semibold tabular-nums text-white">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className={`h-full rounded-full ${color} transition-all duration-300`} style={{ width: `${Math.round((count / maxGoals) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              Recent form
              {finishedMatches.slice(-5).map((match) => {
                const home = match.homeTeam.id === team.id;
                const goalsFor = home ? match.score!.fullTime!.home! : match.score!.fullTime!.away!;
                const goalsAgainst = home ? match.score!.fullTime!.away! : match.score!.fullTime!.home!;
                const form = goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D";
                return (
                  <span
                    key={match.id}
                    aria-label={form === "W" ? "Win" : form === "L" ? "Loss" : "Draw"}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-slate-950 ${
                      form === "W" ? "bg-emerald-400" : form === "L" ? "bg-rose-400" : "bg-amber-300"
                    }`}
                  >
                    {form}
                  </span>
                );
              })}
            </div>
          </section>
          <PointsPacingChart
            matches={seasonMatches}
            teamId={team.id}
            seasonStartYear={seasonStartYear}
            total={seasonPoints}
          />
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">
          Season charts will appear when completed match data is available.
        </p>
      )}
      <p className="mt-4 text-xs text-slate-500">
        Summary is calculated from finished matches returned by the current API response.
      </p>
    </section>
  );
}
