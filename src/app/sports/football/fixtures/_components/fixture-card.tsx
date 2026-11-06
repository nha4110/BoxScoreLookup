"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Match, Team } from "./types";

const subscribe = () => () => {};

function Crest({ team }: { team: Team }) {
  return team.crest ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={team.crest} alt="" className="h-7 w-7 shrink-0 object-contain" />
  ) : (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[9px] font-semibold text-slate-400">
      {team.tla ?? "FC"}
    </span>
  );
}

function TeamRow({ team }: { team: Team }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Crest team={team} />
      <p className="min-w-0 truncate text-sm font-medium text-slate-100">
        {team.name}
      </p>
    </div>
  );
}

export function FixtureCard({ match }: { match: Match }) {
  const hasScore = match.status === "FINISHED" || match.status === "IN_PLAY";
  const kickoff = useSyncExternalStore(
    subscribe,
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(match.utcDate)),
    () => null,
  );

  return (
    <article className="trip-line border border-slate-800 bg-slate-900 px-4 py-4 transition-[transform,border-color] duration-150 ease-in-out hover:-translate-y-0.5 hover:border-slate-700 sm:px-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center">
        <div className="min-w-0 space-y-3">
          <TeamRow team={match.homeTeam} />
          <TeamRow team={match.awayTeam} />
          <div className="flex flex-wrap items-center gap-3">
            <time dateTime={match.utcDate} className="text-xs text-slate-400">
              {kickoff ?? "Local kickoff time"}
            </time>
            <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[11px] font-medium text-blue-300">
              {match.status.replaceAll("_", " ")}
            </span>
          </div>
        </div>
        <div className="flex min-w-24 items-center justify-start rounded-lg bg-slate-950/60 px-4 py-2 sm:justify-center">
          {hasScore ? (
            <p className="text-lg font-bold tabular-nums text-white">
              {match.score?.fullTime?.home ?? "—"}
              <span className="mx-2 text-slate-600">:</span>
              {match.score?.fullTime?.away ?? "—"}
            </p>
          ) : (
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              vs
            </span>
          )}
        </div>
        <div className="hidden h-16 border-l border-zinc-800 sm:block" aria-hidden="true" />
        <Link
          href={`/sports/football/match-stats?matchId=${match.id}`}
          aria-label={`Match Stats: ${match.homeTeam.name} vs ${match.awayTeam.name}`}
          className="inline-flex min-h-11 items-center justify-center border-t border-slate-800 pt-3 text-sm font-semibold text-slate-200 transition-colors duration-200 hover:text-blue-200 sm:border-0 sm:pt-0"
        >
          Match Stats
        </Link>
      </div>
    </article>
  );
}
