import type { Competition } from "./types";

export function fixturesHref(date: string, competition: Competition): string {
  const query = new URLSearchParams({ date, competition: competition.code });
  return `/sports/football/fixtures?${query}`;
}

export function localDateKey(value: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
