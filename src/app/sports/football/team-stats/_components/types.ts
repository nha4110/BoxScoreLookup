export type Team = {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
  venue?: string;
  founded?: number;
  area?: { name?: string };
  website?: string;
  clubColors?: string;
};

export type TeamMatch = {
  id: number;
  utcDate: string;
  status: string;
  competition?: { name?: string; code?: string };
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score?: { fullTime?: { home?: number | null; away?: number | null } };
};
