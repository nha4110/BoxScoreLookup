import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { TeamProfileHeader } from "./_components/team-profile-header";
import { TeamTabs } from "./_components/team-tabs";
import type { Team, TeamMatch } from "./_components/types";

type ApiResult = { payload: unknown; error: string | null };
type TeamsResponse = { teams: Team[] };

function isTeamMatch(value: unknown): value is TeamMatch {
  if (!value || typeof value !== "object") return false;
  const match = value as Record<string, unknown>;
  const home = match.homeTeam;
  const away = match.awayTeam;
  return (
    typeof match.id === "number" &&
    typeof match.utcDate === "string" &&
    typeof match.status === "string" &&
    !!home &&
    typeof home === "object" &&
    typeof (home as Record<string, unknown>).id === "number" &&
    typeof (home as Record<string, unknown>).name === "string" &&
    !!away &&
    typeof away === "object" &&
    typeof (away as Record<string, unknown>).id === "number" &&
    typeof (away as Record<string, unknown>).name === "string"
  );
}

async function fetchApi(endpoint: string, revalidate = 900): Promise<ApiResult> {
  try {
    const response = await fetch(endpoint, {
      headers: { "X-Backend-Secret": process.env.BACKEND_SECRET || "nha4110" },
      next: { revalidate },
    });
    const payload: unknown = await response.json();
    return response.ok
      ? { payload, error: null }
      : {
          payload,
          error:
            response.status === 429
              ? "Team data is temporarily rate-limited. Please try again shortly."
              : `Team data could not be loaded (HTTP ${response.status}).`,
        };
  } catch (error) {
    console.error("Unable to load football team data:", error);
    return { payload: null, error: "A network error prevented team data from loading." };
  }
}

function isTeam(value: unknown): value is Team {
  if (!value || typeof value !== "object") return false;
  const team = value as Record<string, unknown>;
  return typeof team.id === "number" && typeof team.name === "string";
}

function isTeamsResponse(value: unknown): value is TeamsResponse {
  if (!value || typeof value !== "object") return false;
  const teams = (value as Record<string, unknown>).teams;
  return Array.isArray(teams) && teams.every(isTeam);
}

function isMatchesResponse(value: unknown): value is { matches: TeamMatch[] } {
  if (!value || typeof value !== "object") return false;
  const matches = (value as Record<string, unknown>).matches;
  return Array.isArray(matches) && matches.every(isTeamMatch);
}

function normalizeTeamName(name: string): string {
  return name.trim().normalize("NFKC").toLocaleLowerCase();
}

async function TeamStatsContent({
  searchParams,
}: {
  searchParams: Promise<{ teamId?: string; teamName?: string }>;
}) {
  await connection();
  const { teamId, teamName } = await searchParams;
  const isValidId = teamId && /^\d+$/.test(teamId);
  const requestedName = teamName?.trim();
  const baseUrl = `${process.env.BACKEND_URL || "https://boxscore-backend.fly.dev"}/api/football/teams`;
  let team: Team | null = null;
  let teamResult: ApiResult = { payload: null, error: null };
  let matchesResult: ApiResult = { payload: null, error: null };
  let resolvedTeamId = isValidId ? teamId : undefined;

  if (isValidId) {
    const [details, teamMatches] = await Promise.all([
      fetchApi(`${baseUrl}/${teamId}`, 86400),
      fetchApi(`${baseUrl}/${teamId}/matches`),
    ]);
    teamResult = details;
    matchesResult = teamMatches;
    team = isTeam(details.payload) ? details.payload : null;
  } else if (requestedName) {
    const query = new URLSearchParams({ name: requestedName });
    teamResult = await fetchApi(`${baseUrl}?${query.toString()}`, 86400);
    if (isTeamsResponse(teamResult.payload)) {
      const requested = normalizeTeamName(requestedName);
      team =
        teamResult.payload.teams.find(
          (candidate) =>
            normalizeTeamName(candidate.name) === requested ||
            normalizeTeamName(candidate.shortName ?? "") === requested,
        ) ?? null;
      resolvedTeamId = team?.id.toString();
    }

    if (resolvedTeamId) {
      const [details, teamMatches] = await Promise.all([
        fetchApi(`${baseUrl}/${resolvedTeamId}`, 86400),
        fetchApi(`${baseUrl}/${resolvedTeamId}/matches`),
      ]);
      teamResult = details;
      matchesResult = teamMatches;
      team = isTeam(details.payload) ? details.payload : team;
    }
  }

  const matches = isMatchesResponse(matchesResult.payload)
    ? matchesResult.payload.matches
    : [];
  const error = teamResult.error ?? matchesResult.error;

  return (
    <main className="team-page-enter mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="mb-5 inline-flex text-sm text-slate-400 hover:text-blue-300">
        ← Home
      </Link>
      {team ? (
        <>
          <TeamProfileHeader team={team} />
          {matchesResult.error ? (
            <p role="alert" className="mt-5 text-sm text-amber-300">{matchesResult.error}</p>
          ) : null}
          <TeamTabs team={team} matches={matches} />
        </>
      ) : (
        <section role="alert" className="rounded-3xl border border-amber-500/20 bg-slate-900 p-6 text-sm text-amber-200">
          {isValidId
            ? error ?? "Team details were not available in the API response."
            : requestedName
              ? teamResult.error ?? `No team matching "${requestedName}" was found.`
              : "Select a team from the standings table to view its profile and match history."}
          {!isValidId && !requestedName ? (
            <Link href="/sports/football/standings" className="ml-1 font-semibold text-blue-300 hover:text-blue-200">
              Browse standings.
            </Link>
          ) : null}
        </section>
      )}
      <style>{`
        @keyframes team-content-enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .team-page-enter, .team-tab-content { animation: team-content-enter 320ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .team-page-enter, .team-tab-content { animation: none; }
        }
      `}</style>
    </main>
  );
}

export default function TeamStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ teamId?: string; teamName?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <p role="status" className="text-sm text-slate-400">Loading team statistics…</p>
        </main>
      }
    >
      <TeamStatsContent searchParams={searchParams} />
    </Suspense>
  );
}
