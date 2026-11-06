import type { Competition, Match, MatchesResult } from "./types";

export const COMPETITIONS: Competition[] = [
  { code: "CL", slug: "champions-league", name: "Champions League" },
  { code: "PL", slug: "epl", name: "Premier League" },
  { code: "PD", slug: "laliga", name: "La Liga" },
  { code: "SA", slug: "serie-a", name: "Serie A" },
  { code: "BL1", slug: "bundesliga", name: "Bundesliga" },
  { code: "PPL", slug: "primeira-liga", name: "Primeira Liga" },
];

export function getCompetition(code?: string): Competition {
  return (
    COMPETITIONS.find((item) => item.code === code) ??
    COMPETITIONS.find((item) => item.code === "PD")!
  );
}

export function selectedDate(date?: string): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date().toISOString().slice(0, 10);
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
    ? date
    : new Date().toISOString().slice(0, 10);
}

export function matchesUrl(from: string, to: string, competition: Competition): URL {
  const baseUrl = process.env.BACKEND_URL || "https://boxscore-backend.fly.dev";
  const url = new URL(
    `${baseUrl}/api/football/competitions/${competition.code}/matches`,
  );
  url.searchParams.set("dateFrom", from);
  url.searchParams.set("dateTo", to);
  return url;
}

export function monthRange(date: string): { from: string; to: string } {
  const selected = new Date(`${date}T00:00:00.000Z`);
  const year = selected.getUTCFullYear();
  const month = selected.getUTCMonth();
  return {
    from: new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10),
    to: new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10),
  };
}

function cacheDuration(url: URL): number {
  const from = url.searchParams.get("dateFrom");
  const to = url.searchParams.get("dateTo");
  const today = new Date().toISOString().slice(0, 10);
  if (to && to < today) return 30 * 24 * 60 * 60;
  if (from && from === to && from > today) return 5 * 60;
  if (from && from === today && from === to) return 30;
  return 15 * 60;
}

export async function fetchMatches(url: URL): Promise<MatchesResult> {
  try {
    const response = await fetch(url, {
      headers: { "X-Backend-Secret": process.env.BACKEND_SECRET || "nha4110" },
      next: { revalidate: cacheDuration(url) },
    });
    if (!response.ok) {
      console.error(`Football fixtures request failed (HTTP ${response.status}): ${url}`);
      return {
        matches: [],
        error: `Football fixtures request failed (HTTP ${response.status}).`,
      };
    }

    const data: { matches?: Match[] } = await response.json();
    return { matches: data.matches ?? [], error: null };
  } catch (error) {
    console.error("Unable to load football fixtures:", error);
    return { matches: [], error: "Football fixtures could not be loaded." };
  }
}

export function sortAndNormalizeMatches(
  matches: Match[],
  selectedCompetition: Competition,
): Match[] {
  const unique = new Map<number, Match>();
  for (const match of matches) {
    const competition =
      COMPETITIONS.find((item) => item.code === match.competition.code) ??
      selectedCompetition;
    unique.set(match.id, {
      ...match,
      competition: { ...match.competition, ...competition },
    });
  }
  return [...unique.values()].sort(
    (a, b) => Date.parse(a.utcDate) - Date.parse(b.utcDate),
  );
}

export function fixturesHref(date: string, competition: Competition): string {
  const query = new URLSearchParams({ date, competition: competition.code });
  return `/sports/football/fixtures?${query}`;
}

export function leagueSlug(code: string): string {
  return COMPETITIONS.find((item) => item.code === code)?.slug ?? "epl";
}
