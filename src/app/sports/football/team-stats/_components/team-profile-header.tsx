import type { Team } from "./types";

export function TeamProfileHeader({ team }: { team: Team }) {
  const metadata = [
    team.area?.name,
    team.venue,
    team.founded ? `Founded ${team.founded}` : null,
  ].filter(Boolean);

  return (
    <header className="team-profile-card trip-line flex flex-col gap-5 border border-slate-800 p-6 font-sans sm:flex-row sm:items-center sm:p-8">
      {team.crest ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.crest} alt="" className="h-20 w-20 object-contain" />
      ) : (
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-slate-300">
          {team.tla ?? "FC"}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-blue-300">Club profile</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {team.name}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {[team.shortName, team.tla].filter(Boolean).join(" · ") || "Team information"}
        </p>
        {metadata.length ? (
          <p className="mt-3 text-sm text-slate-400">{metadata.join(" · ")}</p>
        ) : null}
      </div>
      {team.website ? (
        <a
          href={team.website}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors duration-200 hover:border-blue-400 hover:text-white"
        >
          Club website
        </a>
      ) : null}
    </header>
  );
}
