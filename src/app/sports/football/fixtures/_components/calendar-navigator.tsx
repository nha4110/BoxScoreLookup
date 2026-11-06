import Link from "next/link";
import { Suspense } from "react";
import { fetchMatches, matchesUrl, monthRange, shiftDate } from "./fixtures-data";
import { fixturesHref } from "./fixture-utils";
import { LocalCalendarGrid } from "./local-calendar-grid";
import type { Competition } from "./types";

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

function formatEuropeanDate(date: string): string {
  return `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}`;
}

async function MonthlyCalendar({
  date,
  competition,
}: {
  date: string;
  competition: Competition;
}) {
  const { from, to } = monthRange(date);
  const result = await fetchMatches(
    matchesUrl(shiftDate(from, -1), shiftDate(to, 1), competition),
  );
  if (result.error) {
    console.error("Unable to load monthly fixture indicators:", result.error);
  }
  return <LocalCalendarGrid date={date} competition={competition} matches={result.matches} />;
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
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:border-slate-600 [&::-webkit-details-marker]:hidden">
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
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 ${
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
            type="text"
            name="date"
            inputMode="numeric"
            autoComplete="off"
            placeholder="dd/mm/yyyy"
            pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
            defaultValue={formatEuropeanDate(date)}
            className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 focus:border-blue-400 focus:outline-none"
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
        fallback={
          <LocalCalendarGrid date={date} competition={competition} matches={[]} />
        }
      >
        <MonthlyCalendar date={date} competition={competition} />
      </Suspense>
    </section>
  );
}
