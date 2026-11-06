import { Suspense } from "react";
import { connection } from "next/server";
import { CalendarNavigator } from "./_components/calendar-navigator";
import { COMPETITIONS, getCompetition, selectedDate } from "./_components/fixtures-data";
import { FixturesList, FixturesLoading } from "./_components/fixtures-list";
import { StandingsInsights, StandingsLoading } from "./_components/standings-insights";

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
            <CalendarNavigator
              date={date}
              competition={competition}
              competitions={COMPETITIONS}
            />
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
