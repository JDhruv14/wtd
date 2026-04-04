export type MediaType = "video" | "link" | "tweet" | "twitter-article" | string;

export interface EntryMetadata {
  title: string;
  description?: string;
  image?: string;
  url: string;
}

export interface Entry {
  id: number;
  created_at: string;
  date: string;
  title: string;
  content: string;
  media_type: MediaType;
  media_url: string;
  icon_name: string | null;
  primary_color: string | null;
  keywords: string | null;      // legacy: kept for old TipTap entries
  genre: string | null;         // displayed "Filed under" tags (e.g. "music, hip-hop")
  tags: string | null;          // invisible search/meta keywords
  why_it_stayed: string | null; // optional personal annotation shown in sidebar
  like_count: number;
  initialMetadata: EntryMetadata | null;
}

export interface DayData {
  day: number;
  date: string;
  hasContent: boolean;
  isToday: boolean;
  iconName: string | null;
  primaryColor: string | null;
  genre: string | null;
}

export interface MonthData {
  month: string;
  year: string;
  days: DayData[];
}

export interface EntrySummary {
  date: string;
  media_type: string;
  icon_name: string;
  primary_color: string;
}

export interface SiteData {
  monthsData: MonthData[];
  allEntryDates: string[];
  latestEntryDate: string;
  allEntries: EntrySummary[];
  entries: Entry[];
}

