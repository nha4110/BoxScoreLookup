"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { fixturesHref, localDateKey } from "./fixture-utils";
import type { Competition, Match } from "./types";

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

const subscribe = () => () => {};

export function LocalCalendarGrid({
  date,
  competition,
  matches,
}: {
  date: string;
  competition: Competition;
  matches: Match[];
}) {
  const localDates = useSyncExternalStore(
    subscribe,
    () => matches.map((match) => localDateKey(match.utcDate)).join(","),
    () => "",
  );
  const fixtureDates = new Set(localDates.split(",").filter(Boolean));

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
            className={`flex h-full min-h-9 flex-col items-center justify-center rounded-lg border text-xs transition-colors duration-150 sm:text-sm ${
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
