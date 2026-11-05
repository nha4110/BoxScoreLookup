import type { Team, TeamMatch } from "./types";
import { MatchHistoryTabs } from "./match-history-tabs";
import { TeamAnalytics } from "./team-analytics";

export function TeamTabs({ team, matches }: { team: Team; matches: TeamMatch[] }) {
  return (
    <section className="trip-line mt-6 border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
      <h2 className="text-lg font-semibold text-white">Season performance</h2>
      <div className="group mt-5">
        <input
          id="team-tab-overview"
          name={`team-tabs-${team.id}`}
          type="radio"
          defaultChecked
          aria-label="Overview"
          className="peer/overview sr-only"
        />
        <input
          id="team-tab-history"
          name={`team-tabs-${team.id}`}
          type="radio"
          aria-label="Match history"
          className="peer/history sr-only"
        />
        <nav aria-label="Team analytics tabs" role="tablist" className="flex gap-2 border-b border-slate-800 pb-3">
          <label
            htmlFor="team-tab-overview"
            role="tab"
            className="group-has-[#team-tab-overview:checked]:border-blue-400 group-has-[#team-tab-overview:checked]:bg-blue-500/10 group-has-[#team-tab-overview:checked]:text-blue-200 cursor-pointer rounded-lg border border-transparent px-3 py-2 text-sm text-slate-400 transition-all duration-300 ease-in-out hover:text-white"
          >
            Overview
          </label>
          <label
            htmlFor="team-tab-history"
            role="tab"
            className="group-has-[#team-tab-history:checked]:border-blue-400 group-has-[#team-tab-history:checked]:bg-blue-500/10 group-has-[#team-tab-history:checked]:text-blue-200 cursor-pointer rounded-lg border border-transparent px-3 py-2 text-sm text-slate-400 transition-all duration-300 ease-in-out hover:text-white"
          >
            Match history
          </label>
        </nav>
        <TeamAnalytics team={team} matches={matches} />
        <MatchHistoryTabs team={team} matches={matches} />
      </div>
    </section>
  );
}
