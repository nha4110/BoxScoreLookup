"use client";

import { useSyncExternalStore } from "react";
import { FixtureCard } from "./fixture-card";
import { localDateKey } from "./fixture-utils";
import type { Match } from "./types";

const subscribe = () => () => {};

export function LocalFixturesList({
  matches,
  selectedDate,
}: {
  matches: Match[];
  selectedDate: string;
}) {
  const ready = useSyncExternalStore(subscribe, () => true, () => false);

  if (!ready) {
    return (
      <p role="status" className="mt-6 text-sm text-slate-400">
        Loading local fixtures…
      </p>
    );
  }

  const localMatches = matches.filter(
    (match) => localDateKey(match.utcDate) === selectedDate,
  );

  return localMatches.length ? (
    <div className="mt-6 grid gap-3">
      {localMatches.map((match) => <FixtureCard key={match.id} match={match} />)}
    </div>
  ) : (
    <p className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
      No fixtures scheduled.
    </p>
  );
}
