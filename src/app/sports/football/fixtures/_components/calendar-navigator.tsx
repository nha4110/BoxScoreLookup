import Link from "next/link";
import { Suspense } from "react";
import { fetchMatches, fixturesHref, monthRange } from "./fixtures-data";
import type { Competition } from "./types";

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
  const { from, to } = monthRange(date);
  const result = await fetchMatches(
    new URL(
      `${process.env.BACKEND_URL || "https://boxscore-backend.fly.dev"}/api/football/competitions/${competition.code}/matches?dateFrom=${from}&dateTo=${to}`,
    ),
  );
  if (result.error) {
    console.error("Unable to load monthly fixture indicators:", result.error);
  } else {
    result.matches.forEach((match) => fixtureDates.add(match.utcDate.slice(0, 10)));
  }
  return <CalendarGrid date={date} competition={competition} fixtureDates={fixtureDates} />;
}

function LeagueSelector({
  date,
  competition,
  competitions,
}: {
  date: string;
  competition: Competition;
  competitions: Competition[];
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
            {competitions.map((item) => (
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

export function CalendarNavigator({
  date,
  competition,
  competitions,
}: {
  date: string;
  competition: Competition;
  competitions: Competition[];
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
        <LeagueSelector date={date} competition={competition} competitions={competitions} />
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
