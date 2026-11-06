import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BoxScoreLookup | Sports, without the clutter",
  description: "Fast football fixtures, standings and team stats without clutter.",
};

const themeBootstrap = `
  (() => {
    const key = "boxscorelookup-theme";
    const root = document.documentElement;
    let theme = "dark";
    try {
      const saved = localStorage.getItem(key);
      if (saved === "light" || saved === "dark") theme = saved;
    } catch (error) {
      console.warn("Theme preference could not be loaded:", error);
    }
    root.dataset.theme = theme;
    document.addEventListener("DOMContentLoaded", () => {
      const toggle = document.getElementById("theme-toggle");
      if (toggle instanceof HTMLInputElement) toggle.checked = theme === "light";
    });
    document.addEventListener("change", (event) => {
      if (!(event.target instanceof HTMLInputElement) || event.target.id !== "theme-toggle") return;
      theme = event.target.checked ? "light" : "dark";
      root.dataset.theme = theme;
      try {
        localStorage.setItem(key, theme);
      } catch (error) {
        console.warn("Theme preference could not be saved:", error);
      }
    });
    window.addEventListener("storage", (event) => {
      if (event.key !== key || (event.newValue !== "light" && event.newValue !== "dark")) return;
      theme = event.newValue;
      root.dataset.theme = theme;
      const toggle = document.getElementById("theme-toggle");
      if (toggle instanceof HTMLInputElement) toggle.checked = theme === "light";
    });
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="flex min-h-full flex-col bg-slate-950 text-slate-100">
        <style>{`
          :root {
            color-scheme: dark;
            --app-bg: #1c262f;
            --app-surface: #27333d;
            --app-surface-muted: #303d47;
            --app-surface-raised: #46515b;
            --app-border: #46515b;
            --app-border-accent: #496c74;
            --app-text-primary: #f4f6f7;
            --app-text-secondary: #c7d0d2;
            --app-text-muted: #97aeb3;
            --app-highlight: #87b2bb;
            --app-accent: #496c74;
            --app-trip: #e32645;
          }
          html[data-theme="light"] {
            color-scheme: light;
            --app-bg: #a18669;
            --app-surface: #b1977b;
            --app-surface-muted: #bca58b;
            --app-surface-raised: #c7b397;
            --app-border: #7d7d7d;
            --app-border-accent: #496c74;
            --app-text-primary: #000000;
            --app-text-secondary: #1c1c1c;
            --app-text-muted: #333333;
            --app-highlight: #000000;
            --app-accent: #496c74;
          }
          html body { background-color: var(--app-bg); color: var(--app-text-primary); }
          html .bg-slate-950, html .bg-slate-900,
          html .bg-slate-900\\/90, html .bg-slate-900\\/80,
          html .bg-slate-900\\/70, html .bg-slate-900\\/50 {
            background-color: var(--app-surface);
            background-image: none;
          }
          html .bg-slate-950\\/70, html .bg-slate-950\\/60,
          html .bg-slate-950\\/50, html .bg-slate-950\\/30 {
            background-color: var(--app-surface-muted);
          }
          html .bg-slate-800 { background-color: var(--app-surface-raised); }
          html .text-white, html .text-slate-100, html .text-slate-200,
          html .text-slate-300 { color: var(--app-text-primary); }
          html .text-slate-400 { color: var(--app-text-secondary); }
          html .text-slate-500, html .text-slate-600 { color: var(--app-text-muted); }
          html .text-blue-200, html .text-blue-300, html .text-blue-400 {
            color: var(--app-highlight);
          }
          html .text-emerald-300 { color: #79b99a; }
          html .text-amber-300 { color: #e0bd72; }
          html .text-rose-300, html .text-rose-400 { color: #ff8291; }
          html .match-header, html .match-header * { color: #ffffff !important; }
          html .border-slate-800, html .border-slate-700,
          html .border-slate-600, html .border-zinc-800,
          html .divide-slate-800 > :not(:last-child) {
            border-color: var(--app-border);
          }
          html .hover\\:border-slate-700:hover,
          html .hover\\:border-slate-600:hover { border-color: var(--app-border-accent); }
          html .bg-blue-500 { background-color: var(--app-accent); }
          html .bg-blue-400 { background-color: var(--app-highlight); }
          html .bg-blue-500.text-white { color: #fff; }
          html .text-blue-500 { color: var(--app-highlight); }
          html .bg-blue-500\\/10, html .bg-blue-500\\/15,
          html .bg-blue-400\\/10 { background-color: color-mix(in srgb, var(--app-highlight) 18%, transparent); }
          html .bg-emerald-500\\/15 { background-color: color-mix(in srgb, #28835c 20%, transparent); }
          html .bg-amber-500\\/15 { background-color: color-mix(in srgb, #aa7417 20%, transparent); }
          html .bg-rose-500\\/15 { background-color: color-mix(in srgb, #c72942 18%, transparent); }
          html .hover\\:bg-slate-800:hover, html .hover\\:bg-slate-900:hover {
            background-color: var(--app-surface-raised);
          }
          html .hover\\:bg-blue-400:hover { background-color: var(--app-border-accent); }
          html[data-theme="light"] .hover\\:text-white:hover,
          html[data-theme="light"] .hover\\:text-blue-200:hover,
          html[data-theme="light"] .hover\\:text-blue-300:hover,
          html[data-theme="light"] .hover\\:text-blue-400:hover,
          html[data-theme="light"] .group:hover .group-hover\\:text-blue-300 {
            color: #000000;
          }
          html[data-theme="light"] .text-emerald-300 { color: #285d43; }
          html[data-theme="light"] .text-amber-300 { color: #72531c; }
          html[data-theme="light"] .text-rose-300, html[data-theme="light"] .text-rose-400 {
            color: #8b2332;
          }
          html[data-theme="light"] .bg-blue-500.text-white { color: #fff; }
          html[data-theme="light"] .bg-blue-500 { color: #fff; }
          html header, html footer { background-color: color-mix(in srgb, var(--app-bg) 94%, transparent); }
          html table thead { background-color: var(--app-surface-muted); }
          html .scheme-dark { color-scheme: light; }
          .trip-line { position: relative; }
          .trip-line::before {
            position: absolute;
            z-index: 1;
            top: 0;
            right: 0;
            left: 0;
            height: 3px;
            background: var(--app-trip);
            content: "";
          }
          .trip-line:not(header) { border-radius: 0.125rem; }
          .team-profile-card {
            background-color: #1c262f !important;
            color: #ffffff !important;
          }
          .team-profile-card * { color: #ffffff !important; }
          .team-profile-card .bg-slate-800 { background-color: #46515b !important; }
          html[data-theme="light"] .calendar-match-indicator { color: #000000; }
          html[data-theme="light"] .text-slate-950 { color: #000000; }
          .league-marquee-track { animation: league-marquee 32s linear infinite; }
          .league-marquee:hover .league-marquee-track { animation-play-state: paused; }
          @keyframes league-marquee { to { transform: translateX(-50%); } }
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { scroll-behavior: auto !important; }
            .league-marquee-track { animation: none; }
          }
          @media (hover: none) {
            header details[open] > div {
              visibility: visible;
              opacity: 1;
              transform: translateY(0);
              pointer-events: auto;
            }
          }
          body, header, footer, main, section, article, a, button, input, td, th {
            transition-property: background-color, border-color, color, box-shadow;
            transition-duration: 150ms;
          }
        `}</style>
        <header className="trip-line sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg transition-all duration-200 hover:opacity-80"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                BS
              </span>
              <span className="text-base font-semibold tracking-tight text-white">
                BoxScoreLookup
              </span>
            </Link>
            <nav aria-label="Main navigation" className="flex items-center gap-1">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-slate-800 hover:text-white"
              >
                Home
              </Link>
              <details className="group relative">
                <summary className="cursor-pointer list-none rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors duration-150 hover:bg-slate-800 hover:text-white [&::-webkit-details-marker]:hidden">
                  Football <span className="ml-1 text-xs text-slate-500">▾</span>
                </summary>
                <div className="pointer-events-none invisible absolute left-0 top-full z-50 w-52 translate-y-1 rounded-xl border border-slate-800 bg-slate-900 p-2 opacity-0 shadow-xl transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {[
                    {
                      href: "/sports/football/fixtures",
                      label: "Fixtures & Schedule",
                    },
                    {
                      href: "/sports/football/standings",
                      label: "League Standings",
                    },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors duration-150 hover:bg-slate-800 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
              <span className="cursor-not-allowed rounded-lg px-3 py-2 text-sm font-medium text-slate-500">
                NBA <span className="hidden text-xs sm:inline">(Coming Soon)</span>
              </span>
              <label
                htmlFor="theme-toggle"
                className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-2 transition-colors duration-200 hover:border-blue-400"
                title="Toggle light and dark theme"
              >
                <span aria-hidden="true" className="text-sm">☾</span>
                <input id="theme-toggle" type="checkbox" className="peer sr-only" />
                <span className="relative h-5 w-9 rounded-full bg-slate-700 transition-colors duration-200 peer-checked:bg-blue-500 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:duration-200 peer-checked:after:translate-x-4" />
                <span aria-hidden="true" className="text-sm">☀</span>
                <span className="sr-only">Toggle light and dark theme</span>
              </label>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-auto border-t border-slate-800 bg-slate-950">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold tracking-tight text-white">
                BoxScoreLookup
              </p>
              <p className="mt-1 text-sm text-slate-500">
                © 2026 BoxScoreLookup
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
              <a
                href="https://github.com/nha4110/BoxScoreLookup"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-150 hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/nhat-hoang-lu-3209563a2"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-150 hover:text-white"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
