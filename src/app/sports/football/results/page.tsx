export default function FootballResultsPage() {
  const sections = [
    {
      title: "Match Data Available",
      items: [
        "Match ID",
        "UTC date",
        "Status",
        "Matchday, stage and group",
        "Last updated timestamp",
        "Full-time and half-time scores",
        "Score winner and duration",
        "Referee information",
      ],
    },
    {
      title: "Competition Information Available",
      items: [
        "Competition ID, name, code and type",
        "Competition emblem",
        "Competition area",
        "Season ID and date range",
        "Current matchday and season winner",
      ],
    },
    {
      title: "Team Information Available",
      items: [
        "Team ID and name",
        "Short name and three-letter abbreviation",
        "Team crest",
      ],
    },
    {
      title: "Match Status Available",
      items: ["Status field (including TIMED, IN_PLAY and FINISHED)"],
    },
  ];

  const futureFeatures = [
    {
      title: "Match Details Page",
      detail:
        "Match IDs are present and can identify matches for a future detail route.",
      available: true,
    },
    {
      title: "Head-to-Head",
      detail:
        "The provider documents related match data; availability depends on the subscribed API plan.",
      available: true,
    },
    {
      title: "Competition Standings and Scorers",
      detail:
        "The provider documents separate competition endpoints for standings and scorers.",
      available: true,
    },
    {
      title: "Live Match Stats",
      detail:
        "Possession, cards and substitutions are not present in the current matches response.",
      available: false,
    },
    {
      title: "Lineups and Player Statistics",
      detail:
        "These fields are not present in the current matches response.",
      available: false,
    },
  ];

  // Keep the capability summary provider-focused so other sports can use the same diagnostic layout.
  return (
    <main className="w-full flex-1">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-blue-300">Football / Match Stats</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Football Match Stats
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Developer-facing overview of match data currently available from
            football-data.org.
          </p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="text-lg font-semibold text-white">
                {section.title}
              </h2>
              <ul className="mt-4 grid gap-3">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-300"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">
            Potential Future Features
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {futureFeatures.map((feature) => (
              <li
                key={feature.title}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      feature.available ? "bg-emerald-400" : "bg-slate-500"
                    }`}
                  />
                  <h3 className="text-sm font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {feature.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
