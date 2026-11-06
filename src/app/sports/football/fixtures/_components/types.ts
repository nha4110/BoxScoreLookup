export type Competition = { code: string; slug: string; name: string };

export type Team = { id: number; name: string; crest?: string; tla?: string };

export type Match = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  competition: { id: number; name: string; code?: string };
  utcDate: string;
  status: string;
  score?: { fullTime?: { home: number | null; away: number | null } };
};

export type Standing = {
  position: number;
  team: { id: number; name: string };
  points: number;
};

export type MatchesResult = { matches: Match[]; error: string | null };
