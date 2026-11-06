import Link from "next/link";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { connection } from "next/server";

type Team = {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
};

type MatchDetails = {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number | null;
  stage?: string;
  group?: string | null;
  lastUpdated?: string;
  competition?: {
    id?: number;
    name?: string;
    code?: string;
    emblem?: string;
  };
  season?: {
    startDate?: string;
    endDate?: string;
    currentMatchday?: number | null;
    winner?: { name?: string } | null;
  };
  homeTeam: Team;
  awayTeam: Team;
  score?: {
    winner?: string | null;
    duration?: string;
    fullTime?: { home?: number | null; away?: number | null };
    halfTime?: { home?: number | null; away?: number | null };
  };
  referees?: Array<{
    id?: number;
    name?: string;
    type?: string;
    nationality?: string;
  }>;
};

type MatchResponse = {
  data: MatchDetails | null;
  error: string | null;
};

function isMatchDetails(value: unknown): value is MatchDetails {
  if (!value || typeof value !== "object") return false;
  const match = value as Record<string, unknown>;
  return (
    typeof match.id === "number" &&
    typeof match.utcDate === "string" &&
    typeof match.status === "string" &&
    !!match.homeTeam &&
    typeof match.homeTeam === "object" &&
    typeof (match.homeTeam as Record<string, unknown>).name === "string" &&
    !!match.awayTeam &&
    typeof match.awayTeam === "object" &&
    typeof (match.awayTeam as Record<string, unknown>).name === "string"
  );
}

async function fetchMatchData(
  matchId: string,
): Promise<MatchDetails> {
  "use cache";

  const response = await fetch(
    `${process.env.BACKEND_URL || "https://boxscore-backend.fly.dev"}/api/football/matches/${matchId}`,
    {
      headers: { "X-Backend-Secret": process.env.BACKEND_SECRET || "nha4110" },
    },
  );
  if (!response.ok) {
    throw new Error(`Football match request failed (HTTP ${response.status}).`);
  }

  const payload: unknown = await response.json();
  if (!isMatchDetails(payload)) {
    throw new Error("The API response did not contain valid match details.");
  }

  if (payload.status === "FINISHED") {
    cacheLife({ stale: 300, revalidate: 86400, expire: 604800 });
  } else {
    cacheLife({ stale: 15, revalidate: 30, expire: 300 });
  }

  return payload;
}

async function getMatch(matchId: string): Promise<MatchResponse> {
  try {
    return { data: await fetchMatchData(matchId), error: null };
  } catch (error) {
    console.error("Unable to load football match details:", error);
    return {
      data: null,
      error:
        error instanceof Error && error.message.includes("HTTP 429")
          ? "Match details are temporarily rate-limited. Please try again shortly."
          : "Match details could not be loaded. Please try again later.",
    };
  }
}

function MatchHeader({ match }: { match: MatchDetails }) {
  const kickoff = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(match.utcDate));

  return (
    <header className="trip-line rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-blue-950/60 p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-4">
        {match.competition?.emblem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={match.competition.emblem}
            alt=""
            className="h-10 w-10 object-contain"
          />
        ) : null}
        <div>
          <p className="text-sm font-medium text-(--app-highlight)">
            {match.competition?.name ?? "Football"}
          </p>
          <p className="mt-1 text-xs text-(--app-text-secondary)">
            {[match.matchday ? `Matchday ${match.matchday}` : null, match.stage, match.group]
              .filter(Boolean)
              .join(" · ") || "Match details"}
          </p>
        </div>
        <span className="ml-auto rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-(--app-text-primary)">
          {match.status.replaceAll("_", " ")}
        </span>
      </div>
      <div className="mt-7">
        <h1 className="text-2xl font-bold tracking-tight text-(--app-text-primary) sm:text-3xl">
          <Link
            href={`/sports/football/team-stats?teamId=${match.homeTeam.id}`}
            className="transition-colors duration-200 hover:text-(--app-highlight)"
          >
            {match.homeTeam.name}
          </Link>{" "}
          <span className="text-(--app-text-muted)">vs</span>{" "}
          <Link
            href={`/sports/football/team-stats?teamId=${match.awayTeam.id}`}
            className="transition-colors duration-200 hover:text-(--app-highlight)"
          >
            {match.awayTeam.name}
          </Link>
        </h1>
        <p className="mt-2 text-sm text-(--app-text-secondary)">{kickoff} UTC</p>
      </div>
    </header>
  );
}

function TeamIdentity({ team }: { team: Team }) {
  return (
    <Link
      href={`/sports/football/team-stats?teamId=${team.id}`}
      className="group flex min-w-0 flex-col items-center gap-3 text-center"
    >
      {team.crest ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.crest} alt="" className="h-14 w-14 object-contain" />
      ) : (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-(--app-text-primary)">
          {team.tla ?? "FC"}
        </span>
      )}
      <span className="text-sm font-semibold text-(--app-text-primary) transition-colors duration-200 group-hover:text-(--app-highlight) sm:text-base">
        {team.name}
      </span>
      {team.tla ? (
        <span className="-mt-2 text-xs uppercase tracking-wider text-(--app-text-muted)">
          {team.tla}
        </span>
      ) : null}
    </Link>
  );
}

function MatchOverview({ match }: { match: MatchDetails }) {
  const homeGoals = match.score?.fullTime?.home;
  const awayGoals = match.score?.fullTime?.away;
  const isFinishedWithScore =
    match.status === "FINISHED" &&
    homeGoals != null &&
    awayGoals != null;
  const homeForm = isFinishedWithScore
    ? homeGoals > awayGoals
      ? "WIN"
      : homeGoals < awayGoals
        ? "LOSS"
        : "DRAW"
    : null;
  const awayForm = isFinishedWithScore
    ? awayGoals > homeGoals
      ? "WIN"
      : awayGoals < homeGoals
        ? "LOSS"
        : "DRAW"
    : null;

  return (
    <section className="trip-line mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
      <h2 className="text-lg font-semibold text-(--app-text-primary)">Overview</h2>
      <div className="mt-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl bg-slate-950/60 p-5 sm:p-6">
          <TeamIdentity team={match.homeTeam} />
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums text-(--app-text-primary) sm:text-4xl">
              {homeGoals ?? "—"}{" "}
              <span className="text-(--app-text-muted)">:</span>{" "}
              {awayGoals ?? "—"}
            </p>
            {isFinishedWithScore && homeForm && awayForm ? (
              <div className="mt-3 flex items-center justify-center gap-2">
                {[homeForm, awayForm].map((form, index) => (
                  <span
                    key={`${index}-${form}`}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${
                      form === "WIN"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : form === "LOSS"
                          ? "bg-rose-500/15 text-rose-300"
                          : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {index === 0 ? match.homeTeam.tla ?? "HOME" : match.awayTeam.tla ?? "AWAY"}{" "}
                    {form}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="mt-2 text-xs text-(--app-text-muted)">
              Full time
              {match.score?.halfTime?.home != null &&
              match.score.halfTime.away != null
                ? ` · HT ${match.score.halfTime.home}-${match.score.halfTime.away}`
                : ""}
            </p>
          </div>
          <TeamIdentity team={match.awayTeam} />
        </div>
        <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm leading-6 text-(--app-text-secondary)">
          Detailed match statistics, lineups, and player metrics are unavailable
          on the current API tier.
        </p>
      </div>
    </section>
  );
}

function MatchInformation({ match }: { match: MatchDetails }) {
  return (
    <section className="trip-line mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
      <h2 className="text-lg font-semibold text-(--app-text-primary)">Match Information</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="rounded-t-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-(--app-text-muted)">
            Referee
          </dt>
          <dd className="min-h-16 rounded-b-xl border border-t-0 border-slate-800 bg-slate-950/30 px-4 py-3 text-(--app-text-primary)">
            {match.referees?.length
              ? match.referees.map((referee) => referee.name).filter(Boolean).join(", ")
              : "Not provided"}
          </dd>
        </div>
        <div>
          <dt className="rounded-t-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-(--app-text-muted)">
            Score outcome
          </dt>
          <dd className="min-h-16 rounded-b-xl border border-t-0 border-slate-800 bg-slate-950/30 px-4 py-3 text-(--app-text-primary)">
            {match.score?.winner ?? "Not decided"}
          </dd>
        </div>
        <div>
          <dt className="rounded-t-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-(--app-text-muted)">
            Last updated
          </dt>
          <dd className="min-h-16 rounded-b-xl border border-t-0 border-slate-800 bg-slate-950/30 px-4 py-3 text-(--app-text-primary)">
            {match.lastUpdated
              ? new Intl.DateTimeFormat("en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "UTC",
                }).format(new Date(match.lastUpdated)) + " UTC"
              : "Not provided"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

async function MatchStatsContent({
  searchParams,
}: {
  searchParams: Promise<{ matchId?: string }>;
}) {
  await connection();
  const { matchId } = await searchParams;
  const validMatchId = matchId && /^\d+$/.test(matchId);
  const result = validMatchId
    ? await getMatch(matchId)
    : {
        data: null,
        error: "A valid matchId query parameter is required.",
      };

  return (
    <main className="match-enter mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/sports/football/fixtures"
        className="mb-5 inline-flex text-sm text-(--app-text-secondary) transition-colors duration-200 hover:text-(--app-highlight)"
      >
        ← Back to fixtures
      </Link>
      {result.data ? (
        <>
          <MatchHeader match={result.data} />
          <MatchOverview match={result.data} />
          <MatchInformation match={result.data} />
        </>
      ) : (
        <section
          role="alert"
          className="match-enter trip-line rounded-3xl border border-amber-500/20 bg-slate-900 p-6 text-sm text-(--app-text-primary)"
        >
          {validMatchId ? (
            result.error
          ) : (
            <>
              Choose a match to view its scoreboard and available details.{" "}
              <Link
                href="/sports/football/fixtures"
                className="font-semibold text-(--app-highlight) transition-colors duration-200 hover:text-(--app-text-primary)"
              >
                Browse fixtures.
              </Link>
            </>
          )}
        </section>
      )}
      <style>{`
        @keyframes match-enter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .match-enter { animation: match-enter 360ms ease-out both; }
        @media (prefers-reduced-motion: reduce) { .match-enter { animation: none; } }
      `}</style>
    </main>
  );
}

export default function MatchStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ matchId?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <p role="status" className="text-sm text-(--app-text-secondary)">
            Loading match details…
          </p>
        </main>
      }
    >
      <MatchStatsContent searchParams={searchParams} />
    </Suspense>
  );
}
