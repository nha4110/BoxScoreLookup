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
  description: "Fast football fixtures, standings and results without clutter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-950 text-slate-100">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
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
              {[
                { href: "/", label: "Home" },
                { href: "/sports", label: "Sports" },
                { href: "/sports/football", label: "Football" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-800 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
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
                href="https://github.com/nha4110"
                target="_blank"
                rel="noreferrer"
                className="transition-all duration-200 hover:text-white"
              >
                GitHub
              </a>
              <span>LinkedIn · Coming Soon</span>
              <span>Portfolio · Coming Soon</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
