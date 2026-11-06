import { fetchMatches, matchesUrl, sortAndNormalizeMatches } from "./fixtures-data";
import { FixtureCard } from "./fixture-card";
import type { Competition } from "./types";

export function ApiMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
      {children}
    </p>
  );
}

export async function FixturesList({
  date,
  competition,
}: {
  date: string;
  competition: Competition;
}) {
  const result = await fetchMatches(matchesUrl(date, date, competition));
  if (result.error) {
    return (
      <ApiMessage>
        {result.error.includes("HTTP 429")
          ? "Fixtures are temporarily rate-limited. Please try again shortly."
          : "Fixtures could not be loaded. Please try again later."}
      </ApiMessage>
    );
  }

  const matches = sortAndNormalizeMatches(result.matches, competition);
  return matches.length ? (
    <div className="mt-6 grid gap-3">
      {matches.map((match) => <FixtureCard key={match.id} match={match} />)}
    </div>
  ) : (
    <ApiMessage>No fixtures scheduled.</ApiMessage>
  );
}

export function FixturesLoading() {
  return (
    <div role="status" aria-label="Loading fixtures" className="mt-6">
      <p className="mb-3 text-sm text-slate-400">Loading fixtures…</p>
      <div className="grid gap-3" aria-hidden="true">
        {[0, 1].map((item) => (
          <div key={item} className="h-24 rounded-xl border border-slate-800 bg-slate-900/70" />
        ))}
      </div>
    </div>
  );
}
