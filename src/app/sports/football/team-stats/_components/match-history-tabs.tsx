import Link from "next/link";
import type { Team, TeamMatch } from "./types";

function TeamMatchList({
  team,
  fixtures,
  emptyMessage,
}: {
  team: Team;
  fixtures: TeamMatch[];
  emptyMessage: string;
}) {
  if (!fixtures.length) return <p className="pt-5 text-sm text-slate-400">{emptyMessage}</p>;

  return (
    <div className="space-y-3 pt-5">
      {fixtures.map((match) => {
        const isHome = match.homeTeam.id === team.id;
        const goalsFor = isHome ? match.score?.fullTime?.home : match.score?.fullTime?.away;
        const goalsAgainst = isHome ? match.score?.fullTime?.away : match.score?.fullTime?.home;
        const score =
          match.score?.fullTime?.home != null && match.score.fullTime.away != null
            ? `${match.score.fullTime.home} - ${match.score.fullTime.away}`
            : "vs";
        const outcome =
          match.status === "FINISHED" && goalsFor != null && goalsAgainst != null
            ? goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D"
            : match.status.replaceAll("_", " ");

        return (
          <Link
            key={match.id}
            href={`/sports/football/match-stats?matchId=${match.id}`}
            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 transition-colors duration-200 hover:border-blue-400/50 sm:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <p className="text-sm font-medium text-slate-200">
                {match.homeTeam.name} <span className="text-slate-500">vs</span> {match.awayTeam.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {match.competition?.name ?? "Football"} ·{" "}
                {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(match.utcDate))}
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-white">{score}</span>
            <span className="col-span-2 text-xs font-medium text-slate-400 sm:col-span-1 sm:text-right">
              {outcome}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function MatchHistoryTabs({ team, matches }: { team: Team; matches: TeamMatch[] }) {
  const pastMatches = matches
    .filter((match) => match.status === "FINISHED")
    .sort((left, right) => Date.parse(right.utcDate) - Date.parse(left.utcDate));
  const upcomingMatches = matches
    .filter((match) => match.status === "TIMED" || match.status === "SCHEDULED")
    .sort((left, right) => Date.parse(left.utcDate) - Date.parse(right.utcDate));

  return (
    <section
      id="team-match-history"
      role="tabpanel"
      className="team-tab-content hidden font-sans peer-checked/history:block"
    >
      <div className="group mt-5">
        <nav aria-label="Filter match history" role="tablist" className="flex gap-2 border-b border-slate-800 pb-3">
          <label
            role="tab"
            className="group-has-[#past-matches:checked]:border-blue-400 group-has-[#past-matches:checked]:bg-blue-500/10 group-has-[#past-matches:checked]:text-blue-200 cursor-pointer rounded-lg border border-transparent px-3 py-2 text-sm text-slate-400 hover:text-white"
          >
            <input type="radio" name={`match-history-${team.id}`} id="past-matches" defaultChecked className="sr-only" />
            Past Matches
          </label>
          <label
            role="tab"
            className="group-has-[#upcoming-matches:checked]:border-blue-400 group-has-[#upcoming-matches:checked]:bg-blue-500/10 group-has-[#upcoming-matches:checked]:text-blue-200 cursor-pointer rounded-lg border border-transparent px-3 py-2 text-sm text-slate-400 hover:text-white"
          >
            <input type="radio" name={`match-history-${team.id}`} id="upcoming-matches" className="sr-only" />
            Upcoming Matches
          </label>
        </nav>
        <div className="team-tab-content hidden group-has-[#past-matches:checked]:block">
          <TeamMatchList team={team} fixtures={pastMatches} emptyMessage="No completed matches were returned." />
        </div>
        <div className="team-tab-content hidden group-has-[#upcoming-matches:checked]:block">
          <TeamMatchList team={team} fixtures={upcomingMatches} emptyMessage="No upcoming matches were returned." />
        </div>
      </div>
    </section>
  );
}
