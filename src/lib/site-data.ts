import { loadMdEntries, buildMergedMonthsData } from "@/lib/markdown-loader";
import type { Entry, MonthData } from "@/lib/types";

export interface SiteData {
  allEntries: Entry[];
  allEntryDates: string[];
  monthsData: MonthData[];
  recentEntries: Pick<Entry, "date" | "title" | "primary_color" | "icon_name" | "genre">[];
}

// Module-level cache: same object reference for the entire server process lifetime.
// This prevents React from re-rendering the sidebar when navigating between dates,
// because the props never change reference.
let _cache: SiteData | null = null;

export function getStableSiteData(): SiteData {
  if (_cache) return _cache;

  const mdEntries = loadMdEntries();
  const today = new Date().toISOString().slice(0, 10);
  
  const allEntries = [...mdEntries].sort((a, b) => b.date.localeCompare(a.date));
  const allEntryDates = allEntries.map(e => e.date);
  const monthsData = buildMergedMonthsData(allEntries, today);
  const recentEntries = allEntries.slice(0, 7).map(e => ({
    date: e.date,
    title: e.title,
    primary_color: e.primary_color,
    icon_name: e.icon_name,
    genre: e.genre,
  }));

  _cache = { allEntries, allEntryDates, monthsData, recentEntries };
  return _cache;
}
