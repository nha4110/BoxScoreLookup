import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

type Competition = { code: string; slug: string; name: string };
type Team = { id: number; name: string; crest?: string; tla?: string };
type Match = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  competition: { id: number; name: string; code?: string };
  utcDate: string;
  status: string;
  score?: { fullTime?: { home: number | null; away: number | null } };
};
type Standing = {
  position: number;
  team: { id: number; name: string };
  points: number;
};
type MatchesResult = { matches: Match[]; error: string | null };

const COMPETITIONS: Competition[] = [
  { code: "CL", slug: "champions-league", name: "Champions League" },
  { code: "PL", slug: "epl", name: "Premier League" },
  { code: "PD", slug: "laliga", name: "La Liga" },
  { code: "SA", slug: "serie-a", name: "Serie A" },
  { code: "BL1", slug: "bundesliga", name: "Bundesliga" },
  { code: "PPL", slug: "primeira-liga", name: "Primeira Liga" },
];

function getCompetition(code?: string): Competition {
  return (
    COMPETITIONS.find((item) => item.code === code) ??
    COMPETITIONS.find((item) => item.code === "PD")!
  );
}

function matchesUrl(from: string, to: string, competition: Competition): URL {
  const url = new URL(
    `https://api.football-data.org/v4/competitions/${competition.code}/matches`,
  );
  url.searchParams.set("dateFrom", from);
  url.searchParams.set("dateTo", to);
  return url;
}

function monthRange(date: string): { from: string; to: string } {
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

async function fetchMatches(url: URL, apiKey: string): Promise<MatchesResult> {
  try {
    const response = await fetch(url, {
      headers: { "X-Auth-Token": apiKey },
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

function sortAndNormalizeMatches(
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

function fixturesHref(date: string, competition: Competition): string {
  const query = new URLSearchParams({ date, competition: competition.code });
  return `/sports/football/fixtures?${query}`;
}

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

function FixtureCard({ match }: { match: Match }) {
  const hasScore = match.status === "FINISHED" || match.status === "IN_PLAY";
  const kickoff = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(match.utcDate));

  return (
    <article className="trip-line border border-slate-800 bg-slate-900 px-4 py-4 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-slate-700 sm:px-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center">
        <div className="min-w-0 space-y-3">
          <TeamRow team={match.homeTeam} />
          <TeamRow team={match.awayTeam} />
          <div className="flex flex-wrap items-center gap-3">
            <time dateTime={match.utcDate} className="text-xs text-slate-400">
              {kickoff} UTC
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

async function FixturesList({
  date,
  competition,
}: {
  date: string;
  competition: Competition;
}) {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return <ApiMessage>Football API key is not configured.</ApiMessage>;

  const result = await fetchMatches(matchesUrl(date, date, competition), apiKey);
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

function ApiMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
      {children}
    </p>
  );
}

function leagueSlug(code: string): string {
  return COMPETITIONS.find((item) => item.code === code)?.slug ?? "epl";
}

async function StandingsInsights({ competition }: { competition: Competition }) {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return <StandingsMessage />;

  const url = `https://api.football-data.org/v4/competitions/${competition.code}/standings`;
  let standings: Standing[] = [];
  try {
    const response = await fetch(url, {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      console.error(`Football standings request failed (HTTP ${response.status}): ${url}`);
    } else {
      const data: { standings?: { table?: Standing[] }[] } =
        await response.json();
      standings = data.standings?.[0]?.table ?? [];
    }
  } catch (error) {
    console.error(`Unable to load ${competition.name} standings:`, error);
  }
  if (!standings.length) return <StandingsMessage />;

  return (
    <section className="trip-line flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 lg:h-full">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-300">
          Standings Insights
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">{competition.name}</h2>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-3 py-2.5 font-medium">Pos</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Club</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {standings.slice(0, 5).map((standing) => (
              <tr key={standing.team.id} className="text-slate-300">
                <td className="w-12 px-3 py-2.5 font-semibold tabular-nums text-blue-300">
                  {standing.position}
                </td>
                <th scope="row" className="truncate px-3 py-2.5 font-medium text-white">
                  {standing.team.name}
                </th>
                <td className="w-14 px-3 py-2.5 text-right font-semibold tabular-nums text-white">
                  {standing.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link
        href={`/sports/football/standings?league=${leagueSlug(competition.code)}`}
        className="mt-4 inline-flex min-h-10 items-center justify-center self-start rounded-lg border border-slate-700 px-4 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-200"
      >
        Full Standings
      </Link>
    </section>
  );
}

function StandingsMessage() {
  return (
    <section
      role="status"
      className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 lg:h-full"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-blue-300">
        Standings Insights
      </p>
      <p className="mt-3 text-sm text-slate-400">Standings are unavailable right now.</p>
    </section>
  );
}

function selectedDate(date?: string): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date().toISOString().slice(0, 10);
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
    ? date
    : new Date().toISOString().slice(0, 10);
}

function calendarDates(date: string): (string | null)[] {
  const selected = new Date(`${date}T00:00:00.000Z`);
  const year = selected.getUTCFullYear();
  const month = selected.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDay + 1;
    return day > 0 && day <= lastDay
      ? new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10)
      : null;
  });
}

function shiftMonth(date: string, offset: number): string {
  const current = new Date(`${date}T00:00:00.000Z`);
  const day = current.getUTCDate();
  const target = new Date(
    Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + offset, 1),
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

function CalendarGrid({
  date,
  competition,
  fixtureDates,
}: {
  date: string;
  competition: Competition;
  fixtureDates: Set<string>;
}) {
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return (
    <div className="grid flex-1 grid-cols-7 grid-rows-[auto_repeat(6,minmax(2.25rem,1fr))] gap-0.5 sm:gap-1">
      {weekdays.map((weekday) => (
        <div key={weekday} className="py-1.5 text-center text-[11px] font-medium text-slate-500 sm:text-xs">
          {weekday}
        </div>
      ))}
      {calendarDates(date).map((day, index) =>
        day ? (
          <Link
            key={day}
            href={fixturesHref(day, competition)}
            prefetch={false}
            aria-current={day === date ? "date" : undefined}
            aria-label={`${Number(day.slice(-2))}${fixtureDates.has(day) ? ", matches available" : ""}`}
            className={`flex h-full min-h-9 flex-col items-center justify-center rounded-lg border text-xs transition-all duration-300 ease-in-out sm:text-sm ${
              day === date
                ? "border-blue-400 bg-blue-500 font-semibold text-white shadow-md shadow-blue-500/15"
                : "border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>{Number(day.slice(-2))}</span>
            {fixtureDates.has(day) && (
              <span aria-hidden="true" className="calendar-match-indicator h-2.5 text-[9px] leading-2.5 text-amber-300">
                ★
              </span>
            )}
          </Link>
        ) : (
          <span key={`empty-${index}`} className="h-full min-h-9" />
        ),
      )}
    </div>
  );
}

async function MonthlyCalendar({
  date,
  competition,
}: {
  date: string;
  competition: Competition;
}) {
  const fixtureDates = new Set<string>();
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    console.error("Football fixtures API key is not configured.");
  } else {
    const { from, to } = monthRange(date);
    const result = await fetchMatches(matchesUrl(from, to, competition), apiKey);
    if (result.error) {
      console.error("Unable to load monthly fixture indicators:", result.error);
    } else {
      result.matches.forEach((match) => fixtureDates.add(match.utcDate.slice(0, 10)));
    }
  }
  return <CalendarGrid date={date} competition={competition} fixtureDates={fixtureDates} />;
}

function LeagueSelector({
  date,
  competition,
}: {
  date: string;
  competition: Competition;
}) {
  return (
    <div className="sm:ml-auto sm:w-52">
      <span className="mb-1 block text-xs font-medium text-slate-400">League</span>
      <details className="group relative">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:border-slate-600 [&::-webkit-details-marker]:hidden">
          {competition.name}<span aria-hidden="true" className="text-slate-400">▾</span>
        </summary>
        <nav
          aria-label="Select league"
          className="invisible absolute right-0 top-12 z-20 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-2 opacity-0 shadow-xl transition-opacity duration-200 group-open:visible group-open:opacity-100"
        >
          <form action="/sports/football/fixtures" method="get">
            <input type="hidden" name="date" value={date} />
            {COMPETITIONS.map((item) => (
              <button
                key={item.code}
                type="submit"
                name="competition"
                value={item.code}
                aria-current={item.code === competition.code ? "true" : undefined}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-300 ease-in-out ${
                  item.code === competition.code
                    ? "bg-blue-500/15 font-medium text-blue-200"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </form>
        </nav>
      </details>
    </div>
  );
}

function DateNavigator({
  date,
  competition,
}: {
  date: string;
  competition: Competition;
}) {
  const label = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
  const emptyIndicators = new Set<string>();
  return (
    <section className="trip-line flex w-full flex-col rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-4 lg:h-full">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          {[-1, 0, 1].map((offset) =>
            offset === 0 ? (
              <h2 key="month" className="text-base font-semibold text-white sm:text-lg">
                {label}
              </h2>
            ) : (
              <Link
                key={offset}
                href={fixturesHref(shiftMonth(date, offset), competition)}
                prefetch={false}
                aria-label={offset < 0 ? "Previous month" : "Next month"}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors duration-200 hover:border-blue-400 hover:bg-slate-800 hover:text-white"
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  {offset < 0 ? "‹" : "›"}
                </span>
              </Link>
            ),
          )}
        </div>
        <LeagueSelector date={date} competition={competition} />
      </div>
      <form action="/sports/football/fixtures" method="get" className="mb-4 flex items-end gap-2">
        <input type="hidden" name="competition" value={competition.code} />
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-xs font-medium text-slate-400">Go to date</span>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="scheme-dark min-h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 focus:border-blue-400 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="min-h-10 rounded-lg border border-slate-700 px-3 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-blue-400 hover:text-white"
        >
          Go
        </button>
      </form>
      <Suspense
        fallback={<CalendarGrid date={date} competition={competition} fixtureDates={emptyIndicators} />}
      >
        <MonthlyCalendar date={date} competition={competition} />
      </Suspense>
    </section>
  );
}

function FixturesLoading() {
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

function StandingsLoading() {
  return (
    <section
      role="status"
      aria-label="Loading standings"
      className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 lg:h-full"
    >
      <p className="mb-4 text-sm text-slate-400">Loading standings…</p>
      <div className="grid gap-3" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="h-8 rounded-md bg-slate-900 transition-opacity duration-200" />
        ))}
      </div>
    </section>
  );
}

async function FixturesContent({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; competition?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const date = selectedDate(params.date);
  const competition = getCompetition(params.competition);
  const label = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));

  return (
    <main className="w-full flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="relative mb-6 text-center">
          <p className="text-sm font-medium text-blue-300">Football / Fixtures</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {label}
          </h1>
        </div>
        <div key={`${competition.code}-${date}`} className="fixture-date-enter">
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-stretch">
            <DateNavigator date={date} competition={competition} />
            <Suspense fallback={<StandingsLoading />}>
              <StandingsInsights competition={competition} />
            </Suspense>
          </div>
          <Suspense fallback={<FixturesLoading />}>
            <FixturesList date={date} competition={competition} />
          </Suspense>
        </div>
      </div>
      <style>{`
        @keyframes fixture-date-enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fixture-date-enter { animation: fixture-date-enter 320ms ease-out both; }
        @media (prefers-reduced-motion: reduce) { .fixture-date-enter { animation: none; } }
      `}</style>
    </main>
  );
}

export default function FootballFixturesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; competition?: string }>;
}) {
  return (
    <Suspense fallback={<FixturesLoading />}>
      <FixturesContent searchParams={searchParams} />
    </Suspense>
  );
}
