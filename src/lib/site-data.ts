import { loadMdEntries, buildMergedMonthsData } from "@/lib/markdown-loader";
import { favourites } from "@content/sidebar/favourites";
import type { SiteData } from "@/lib/types";

export type { SiteData };

// Module-level cache: same object reference for the entire server process lifetime.
// This prevents React from re-rendering the sidebar when navigating between dates,
// because the props never change reference.
let _cache: SiteData | null = null;

export function getStableSiteData(): SiteData {
  if (_cache) return _cache;

  const mdEntries = loadMdEntries();
  const today = new Date().toISOString().slice(0, 10);

  const allEntries = [...mdEntries].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const allEntryDates = allEntries.map((e) => e.date);
  const monthsData = buildMergedMonthsData(allEntries, today);
  const entryByDate = new Map(allEntries.map((e) => [e.date, e]));
  const recentEntries = favourites
    .map((date) => entryByDate.get(date))
    .filter((e): e is NonNullable<typeof e> => e !== undefined)
    .map((e) => ({
      date: e.date,
      title: e.title,
      icon_name: e.icon_name,
      tags: e.tags,
    }));

  _cache = { allEntries, allEntryDates, monthsData, recentEntries };
  return _cache;
}
