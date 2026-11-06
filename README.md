# BoxScoreLookup 

> A modern, high-performance, full-stack sports statistics and matchday hub providing real-time fixtures, live standings, and team analytics. Built with a decoupled architecture separating a secure Java micro-proxy backend from a lightning-fast Next.js frontend.

 **Live Production URL:** [https://boxscorelookup.vercel.app](https://boxscorelookup.vercel.app)

---

##  Key Features

* **Matchday Hub & Fixtures:** Interactive monthly calendar view with local timezone conversion, live match indicators, and scorecards across top-tier football leagues.
* **Live Standings & Team Analytics:** Comprehensive league standings, form guides, and deep-dive team profile statistics.
* **Secure Backend Proxy Architecture:** Centralized API request handling via Spring Boot to shield external third-party endpoints and mitigate strict rate-limiting constraints.
* **Responsive Dark/Light UI:** Built with Tailwind CSS, supporting smooth theme transitions and optimized layout components.

---

##  Tech Stack

### **Frontend**
* **Framework:** Next.js (App Router, Server Components, Suspense boundaries)
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

### **Backend & Infrastructure**
* **Core Language & Framework:** Java, Spring Boot (RESTful APIs)
* **Security:** Custom Spring Security header-based token verification (`X-Backend-Secret`)
* **Database & Caching (Architecture Roadmap):** Supabase (PostgreSQL) / JPA for historical data caching and sliding-window management
* **Hosting & Cloud:** Fly.io (Containerized Docker deployment)

---

##  Project Architecture

```text
BoxScoreLookup/
├── src/app/                     # Next.js Frontend App Router
│   ├── page.tsx                 # Homepage matchday ticker & charts
│   └── sports/football/         # Football modules (Fixtures, Standings, Match Stats, Team Stats)
├── backend (or separate service)# Spring Boot Java Backend Proxy (Deployed on Fly.io)
└── package.json
