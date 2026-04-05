export type MediaType = "video" | "link" | "tweet" | "twitter-article" | string;

export interface EntryMetadata {
  title: string;
  description?: string;
  image?: string;
  url: string;
}

/** Canonical entry shape. Theme color is always derived from `icon_name` via `TOPICS` (see `getTopicColor`). */
export interface Entry {
  id: number;
  created_at: string;
  date: string;
  title: string;
  /** Optional front matter subtitle shown under the title. Falls back to auto-extracted body text. */
  description: string | null;
  content: string;
  icon_name: string | null;
  /** Comma- or pipe-separated labels; shown under the date on the entry page and used for topic filters. */
  tags: string | null;
  like_count: number;
  media_url: string;
  media_type: MediaType;
  initialMetadata: EntryMetadata | null;
}

export interface DayData {
  day: number;
  date: string;
  hasContent: boolean;
  isToday: boolean;
  iconName: string | null;
  tags: string | null;
}

export interface MonthData {
  month: string;
  year: string;
  days: DayData[];
}

export interface SiteData {
  allEntries: Entry[];
  allEntryDates: string[];
  monthsData: MonthData[];
  recentEntries: Pick<Entry, "date" | "title" | "icon_name" | "tags">[];
}
