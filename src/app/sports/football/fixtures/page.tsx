import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

type Match = {
  id: number;
  homeTeam: { name: string };
  awayTeam: { name: string };
  competition: ApiCompetition;
  utcDate: string;
  status: string;
  score?: {
    fullTime?: {
      home: number | null;
      away: number | null;
    };
  };
};

type MatchesResponse = {
  matches: Match[];
};

type Competition = {
  code: string;
  name: string;
};

type ApiCompetition = {
  id: number;
  name: string;
  code?: string;
};

const COMPETITIONS: Competition[] = [
  { code: "CL", name: "Champions League" },
  { code: "PL", name: "Premier League" },
  { code: "ELC", name: "Championship" },
  { code: "PD", name: "La Liga" },
  { code: "SA", name: "Serie A" },
  { code: "BL1", name: "Bundesliga" },
];
// FUTURE:
// Add NBA, Tennis, Formula 1 and Cricket competition registries here.

function sortCompetitions(competitions: Competition[]): Competition[] {
  return [...competitions].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

function filterCompetitions(
  competitions: Competition[],
  searchTerm: string,
): Competition[] {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  if (!normalizedSearch) {
    return competitions;
  }

  return competitions.filter((competition) =>
    competition.name.toLocaleLowerCase().includes(normalizedSearch),
  );
}

type CompetitionMatchesResult = {
  matches: Match[];
  error: string | null;
};

function getTodayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getMatchesUrl(
  selectedDate: string,
  selectedCompetition?: Competition,
): URL | null {
  if (!selectedCompetition) {
    return selectedDate === getTodayUtcDate()
      ? new URL("https://api.football-data.org/v4/matches")
      : null;
  }

  const url = new URL(
    `https://api.football-data.org/v4/competitions/${selectedCompetition.code}/matches`,
  );
  url.searchParams.set("dateFrom", selectedDate);
  url.searchParams.set("dateTo", selectedDate);
  return url;
}

function normalizeMatches(
  matches: Match[],
  selectedCompetition?: Competition,
): Match[] {
  return matches.map((match) => {
    const registryEntry =
      COMPETITIONS.find(
        (competition) => competition.code === match.competition.code,
      ) ?? selectedCompetition;

    return registryEntry
      ? {
          ...match,
          competition: {
            ...match.competition,
            code: registryEntry.code,
            name: registryEntry.name,
          },
        }
      : match;
  });
}

function deduplicateAndSortMatches(matches: Match[]): Match[] {
  const uniqueMatches = new Map<number, Match>();
  for (const match of matches) {
    if (!uniqueMatches.has(match.id)) {
      uniqueMatches.set(match.id, match);
    }
  }

  return Array.from(uniqueMatches.values()).sort(
    (first, second) =>
      new Date(first.utcDate).getTime() - new Date(second.utcDate).getTime(),
  );
}

async function fetchMatches(
  url: URL,
  apiKey: string,
): Promise<CompetitionMatchesResult> {
  try {
    const response = await fetch(url, {
      headers: { "X-Auth-Token": apiKey },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        matches: [],
        error: `Football fixtures request failed (HTTP ${response.status}).`,
      };
    }

    const data: MatchesResponse = await response.json();
    return { matches: data.matches, error: null };
  } catch (error) {
    console.error("Unable to load football fixtures:", error);
    return {
      matches: [],
      error: "Football fixtures could not be loaded.",
    };
  }
}

async function FixturesList({
  selectedDate,
  selectedCompetition,
  searchTerm,
}: {
  selectedDate: string;
  selectedCompetition: string;
  searchTerm: string;
}) {
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    return <FixturesMessage message="Football API key is not configured." />;
  }

  const competition = COMPETITIONS.find(
    (entry) => entry.code === selectedCompetition,
  );
  const url = getMatchesUrl(selectedDate, competition);
  const competitionFilter = (
    <CompetitionFilter
      competitions={sortCompetitions(COMPETITIONS)}
      selectedCompetition={selectedCompetition}
      searchTerm={searchTerm}
      selectedDate={selectedDate}
    />
  );

  if (!url) {
    return (
      <>
        {competitionFilter}
        <FixturesMessage message="Select a competition to view fixtures for this date." />
      </>
    );
  }

  const result = await fetchMatches(url, apiKey);
  if (result.error) {
    return (
      <>
        {competitionFilter}
        <FixturesMessage message={result.error} />
      </>
    );
  }

  const dateMatches = deduplicateAndSortMatches(
    normalizeMatches(result.matches, competition),
  );
  const matches = dateMatches.slice(0, 10);

  return (
    <>
      {competitionFilter}
      {matches.length === 0 ? (
        <FixturesMessage
          message={
            dateMatches.length === 0
              ? `No matches scheduled for ${new Intl.DateTimeFormat("en", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(`${selectedDate}T00:00:00.000Z`))}.`
              : "No matches for this competition on the selected date."
          }
        />
      ) : (
        <div className="mt-6 grid gap-4">
          {matches.map((match) => (
            <article
              key={match.id}
              className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm transition-all duration-200 hover:border-slate-700 hover:shadow-lg"
            >
              <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <p className="mb-4 truncate text-sm font-medium text-slate-400">
                    {match.competition.name}
                  </p>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3">
                    <p className="truncate font-semibold text-white">
                      {match.homeTeam.name}
                    </p>
                    <span className="min-w-8 text-right text-xl font-semibold tabular-nums text-white">
                      {match.score?.fullTime?.home ?? "—"}
                    </span>
                    <p className="truncate font-semibold text-white">
                      {match.awayTeam.name}
                    </p>
                    <span className="min-w-8 text-right text-xl font-semibold tabular-nums text-white">
                      {match.score?.fullTime?.away ?? "—"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-4 text-sm md:min-w-36 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:py-2 md:pl-6">
                  <time
                    dateTime={match.utcDate}
                    className="font-medium text-slate-300"
                  >
                    {new Intl.DateTimeFormat("en", {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "UTC",
                    }).format(new Date(match.utcDate))}{" "}
                    UTC
                  </time>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                    {match.status.replaceAll("_", " ")}
                  </span>
                </div>
              </div>
              <div className="border-t border-slate-800 px-5 py-3 sm:px-6">
                {/* TODO: Add /sports/football/match/[id] as a Match Details page. */}
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-500"
                >
                  Stats
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function getSelectedDate(dateParam?: string) {
  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return new Date().toISOString().slice(0, 10);
  }

  const parsedDate = new Date(`${dateParam}T00:00:00.000Z`);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== dateParam
  ) {
    return new Date().toISOString().slice(0, 10);
  }

  return dateParam;
}

function getCalendarDays(selectedDate: string): (string | null)[] {
  const selected = new Date(`${selectedDate}T00:00:00.000Z`);
  const year = selected.getUTCFullYear();
  const month = selected.getUTCMonth();
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from(
    { length: firstWeekday },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(
      new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10),
    );
  }

  return cells;
}

function getDateHref(
  date: string,
  selectedCompetition: string,
  searchTerm: string,
): string {
  const params = new URLSearchParams({ date });

  if (selectedCompetition) {
    params.set("competition", selectedCompetition);
  }
  if (searchTerm) {
    params.set("search", searchTerm);
  }

  return `/sports/football/fixtures?${params.toString()}`;
}

function DateNavigator({
  selectedDate,
  selectedCompetition,
  searchTerm,
}: {
  selectedDate: string;
  selectedCompetition: string;
  searchTerm: string;
}) {
  const selected = new Date(`${selectedDate}T00:00:00.000Z`);
  const weekStart = new Date(selected);
  weekStart.setUTCDate(weekStart.getUTCDate() - selected.getUTCDay());
  const calendarDays = getCalendarDays(selectedDate);
  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(selected);

  // TODO: Future week-based loading.
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setUTCDate(weekStart.getUTCDate() + index);
    const dateKey = date.toISOString().slice(0, 10);

    return {
      date,
      dateKey,
      label: new Intl.DateTimeFormat("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date),
    };
  });

  return (
    <div className="flex items-stretch gap-3">
      <nav
        aria-label="Select fixture date"
        className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1"
      >
        {days.map((day) => {
          const isSelected = day.dateKey === selectedDate;

          return (
            <Link
              key={day.dateKey}
              href={getDateHref(
                day.dateKey,
                selectedCompetition,
                searchTerm,
              )}
              prefetch={false}
              aria-current={isSelected ? "date" : undefined}
              className={`flex min-h-12 min-w-17 flex-1 items-center justify-center rounded-xl border px-2 text-center text-xs font-medium transition-all duration-200 sm:min-w-0 sm:text-sm ${
                isSelected
                  ? "border-blue-400 bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {day.label}
            </Link>
          );
        })}
      </nav>
      <details className="group relative">
        <summary
          aria-label="Open calendar"
          title="Open calendar"
          className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-950 transition-all duration-200 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
            <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" />
          </svg>
        </summary>
        <div className="invisible absolute right-0 top-14 z-20 w-[min(21rem,calc(100vw-2.5rem))] rounded-xl border border-slate-700 bg-slate-900 p-4 opacity-0 shadow-xl transition-opacity duration-200 group-open:visible group-open:opacity-100">
          <div className="mb-4 text-center text-sm font-semibold text-white">
            {monthLabel}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((weekday) => (
              <span key={weekday} className="py-2 font-medium">
                {weekday}
              </span>
            ))}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <span key={`empty-${index}`} />;
              }

              const isSelected = date === selectedDate;
              return (
                <Link
                  key={date}
                  href={getDateHref(date, selectedCompetition, searchTerm)}
                  prefetch={false}
                  aria-current={isSelected ? "date" : undefined}
                  className={`flex h-9 items-center justify-center rounded-lg text-sm transition-colors duration-200 ${
                    isSelected
                      ? "bg-blue-500 font-semibold text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {Number(date.slice(-2))}
                </Link>
              );
            })}
          </div>
        </div>
      </details>
    </div>
  );
}

function CompetitionFilter({
  competitions,
  selectedCompetition,
  searchTerm,
  selectedDate,
}: {
  competitions: Competition[];
  selectedCompetition: string;
  searchTerm: string;
  selectedDate: string;
}) {
  const filteredCompetitions = filterCompetitions(competitions, searchTerm);
  const selectedName = competitions.find(
    (competition) => competition.code === selectedCompetition,
  )?.name;
  const groupedCompetitions = filteredCompetitions.reduce<
    Record<string, Competition[]>
  >((groups, competition) => {
    const letter = competition.name.charAt(0).toLocaleUpperCase();
    groups[letter] ??= [];
    groups[letter].push(competition);
    return groups;
  }, {});

  return (
    // FUTURE:
    // This competition picker can be extracted into
    // CompetitionFilter.tsx when additional sports,
    // leagues, or advanced filtering are introduced.
    <div className="mt-6 border-b border-slate-800 pb-4">
      <details className="group relative inline-block">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-slate-600 [&::-webkit-details-marker]:hidden">
          {selectedName ?? "All Competitions"}
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 text-slate-400 transition-opacity duration-200 group-open:rotate-180"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <div className="invisible absolute left-0 top-14 z-20 w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border border-slate-700 bg-slate-900 p-3 opacity-0 shadow-xl transition-opacity duration-200 group-open:visible group-open:opacity-100">
          <form method="get">
            <input type="hidden" name="date" value={selectedDate} />
            {selectedCompetition && (
              <input
                type="hidden"
                name="competition"
                value={selectedCompetition}
              />
            )}
            <label htmlFor="competition-search" className="sr-only">
              Search competitions
            </label>
            <input
              id="competition-search"
              type="search"
              name="search"
              defaultValue={searchTerm}
              placeholder="Search competitions..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
            />
            <span className="sr-only">
              Press Enter to search competitions
            </span>
          </form>
          <div className="mt-2 max-h-72 overflow-y-auto">
            <Link
              href={`/sports/football/fixtures?date=${selectedDate}`}
              prefetch={false}
              aria-current={!selectedCompetition ? "true" : undefined}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                !selectedCompetition
                  ? "bg-slate-800 font-medium text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              All Competitions
            </Link>
            {Object.entries(groupedCompetitions).map(([letter, items]) => (
              <section key={letter} className="mt-2">
                <h2 className="px-3 py-1 text-xs font-semibold uppercase text-slate-500">
                  {letter}
                </h2>
                {items.map((competition) => {
                  const isSelected = competition.code === selectedCompetition;

                  return (
                    <Link
                      key={competition.code}
                      href={`/sports/football/fixtures?date=${selectedDate}&competition=${competition.code}`}
                      prefetch={false}
                      aria-current={isSelected ? "true" : undefined}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                        isSelected
                          ? "bg-slate-800 font-medium text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {competition.name}
                    </Link>
                  );
                })}
              </section>
            ))}
            {filteredCompetitions.length === 0 && (
              <p className="px-3 py-4 text-sm text-slate-400">
                No competitions match your search.
              </p>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}

function FixturesMessage({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="mt-9 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300 sm:p-8"
    >
      {message}
    </div>
  );
}

function FixturesLoading() {
  return (
    <div
      role="status"
      className="mt-9 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400 sm:p-8"
    >
      Loading fixtures…
    </div>
  );
}

async function FixturesContent({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    competition?: string;
    search?: string;
  }>;
}) {
  await connection();
  const { date, competition, search } = await searchParams;
  const selectedDate = getSelectedDate(date);
  const selectedCompetition = competition ?? "";
  const searchTerm = search?.trim() ?? "";
  const selectedDateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${selectedDate}T00:00:00.000Z`));

  return (
    <main className="w-full flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <DateNavigator
          selectedDate={selectedDate}
          selectedCompetition={selectedCompetition}
          searchTerm={searchTerm}
        />
        <div className="border-b border-slate-800 py-8 text-center sm:py-10">
          <p className="text-sm font-medium text-blue-300">
            Football / Fixtures
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {selectedDateLabel}
          </h1>
        </div>
        <Suspense fallback={<FixturesLoading />}>
          <FixturesList
            selectedDate={selectedDate}
            selectedCompetition={selectedCompetition}
            searchTerm={searchTerm}
          />
        </Suspense>
      </div>
    </main>
  );
}

export default function FootballFixturesPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    competition?: string;
    search?: string;
  }>;
}) {
  return (
    <Suspense fallback={<FixturesLoading />}>
      <FixturesContent searchParams={searchParams} />
    </Suspense>
  );
}
