import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

type Match = {
  id: number;
  homeTeam: { name: string };
  awayTeam: { name: string };
  competition: { id: number; name: string };
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

  let matches: Match[] = [];
  let dateMatches: Match[] = [];
  let errorMessage: string | null = null;

  try {
    const response = await fetch("https://api.football-data.org/v4/matches", {
      headers: { "X-Auth-Token": apiKey },
      cache: "no-store",
    });

    if (!response.ok) {
      errorMessage = `Football API request failed (HTTP ${response.status}).`;
    } else {
      const data: MatchesResponse = await response.json();
      dateMatches = data.matches.filter(
        (match) => match.utcDate.slice(0, 10) === selectedDate,
      );
      matches = dateMatches
        .filter(
          (match) =>
            (!selectedCompetition ||
              String(match.competition.id) === selectedCompetition) &&
            (!searchTerm ||
              match.competition.name
                .toLocaleLowerCase()
                .includes(searchTerm.toLocaleLowerCase())),
        )
        .slice(0, 10);
    }
  } catch (error) {
    console.error("Unable to load football fixtures:", error);
    errorMessage = "Unable to load fixtures. Please try again later.";
  }

  if (errorMessage) {
    return <FixturesMessage message={errorMessage} />;
  }

  const competitions = Array.from(
    new Map(
      dateMatches.map((match) => [
        String(match.competition.id),
        match.competition,
      ]),
    ).values(),
  ).sort((first, second) => first.name.localeCompare(second.name));

  return (
    <>
      <CompetitionFilter
        competitions={competitions}
        selectedCompetition={selectedCompetition}
        searchTerm={searchTerm}
        selectedDate={selectedDate}
      />
      {matches.length === 0 ? (
        <FixturesMessage message="No fixtures available for this date and filter." />
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
              href={`/sports/football/fixtures?date=${day.dateKey}${selectedCompetition ? `&competition=${selectedCompetition}` : ""}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`}
              aria-current={isSelected ? "date" : undefined}
              className={`flex min-h-12 min-w-[4.25rem] flex-1 items-center justify-center rounded-xl border px-2 text-center text-xs font-medium transition-all duration-200 sm:min-w-0 sm:text-sm ${
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
        <form
          method="get"
          className="invisible absolute right-0 top-14 z-20 w-72 rounded-xl border border-slate-700 bg-slate-900 p-4 opacity-0 shadow-xl transition-opacity duration-200 group-open:visible group-open:opacity-100"
        >
          <label
            htmlFor="fixture-date"
            className="text-sm font-medium text-slate-200"
          >
            Select date
          </label>
          <input
            id="fixture-date"
            type="date"
            name="date"
            defaultValue={selectedDate}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
          {selectedCompetition && (
            <input
              type="hidden"
              name="competition"
              value={selectedCompetition}
            />
          )}
          {searchTerm && (
            <input type="hidden" name="search" value={searchTerm} />
          )}
          <button
            type="submit"
            className="mt-3 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-white"
          >
            Go to date
          </button>
        </form>
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
  competitions: { id: number; name: string }[];
  selectedCompetition: string;
  searchTerm: string;
  selectedDate: string;
}) {
  const selectedName = competitions.find(
    (competition) => String(competition.id) === selectedCompetition,
  )?.name;

  return (
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
        <form
          method="get"
          className="invisible absolute left-0 top-14 z-20 w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border border-slate-700 bg-slate-900 p-4 opacity-0 shadow-xl transition-opacity duration-200 group-open:visible group-open:opacity-100"
        >
          <input type="hidden" name="date" value={selectedDate} />
          <label
            htmlFor="competition-search"
            className="text-sm font-medium text-slate-200"
          >
            Search competitions
          </label>
          <input
            id="competition-search"
            type="search"
            name="search"
            defaultValue={searchTerm}
            placeholder="Search by competition name"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
          />
          <label
            htmlFor="competition-select"
            className="mt-4 block text-sm font-medium text-slate-200"
          >
            Competition
          </label>
          <select
            id="competition-select"
            name="competition"
            defaultValue={selectedCompetition}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
          >
            <option value="">All Competitions</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-white"
          >
            Apply filters
          </button>
        </form>
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
