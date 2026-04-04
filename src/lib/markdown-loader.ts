import fs from 'fs';
import path from 'path';
import type { Entry, DayData, MonthData } from './types';
import { GENRE_MAP, getTopicColor } from './topics';

// Content lives at: content/YYYY/MM/YYYY-MM-DD.md
const CONTENT_DIR = path.join(process.cwd(), 'content');

const MONTH_ABBR: Record<number, string> = {
  1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR',
  5: 'MAY', 6: 'JUN', 7: 'JUL', 8: 'AUG',
  9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC',
};

type FMeta = { [key: string]: string | undefined };

function parseFrontmatter(src: string): { meta: FMeta; body: string } {
  const s = src.trimStart();
  if (!s.startsWith('---')) return { meta: {}, body: s };
  const nl = s.indexOf('\n', 3);
  if (nl === -1) return { meta: {}, body: s };
  const endFm = s.indexOf('\n---', nl);
  if (endFm === -1) return { meta: {}, body: s };

  const meta: FMeta = {};
  for (const line of s.slice(nl + 1, endFm).split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const k = line.slice(0, sep).trim();
    const v = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
    if (k && v) meta[k] = v;
  }

  return { meta, body: s.slice(endFm + 4).trim() };
}

/** Auto-detect media_type from a URL when not explicitly set. */
function inferMediaType(url: string): string {
  if (!url) return 'article';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
  if (url.includes('spotify.com')) return 'link';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'tweet';
  if (url.includes('music.apple.com')) return 'link';
  return 'link';
}

/** URL → icon name for well-known domains. */
const URL_ICON_MAP: Array<[string, string]> = [
  ['youtube.com', 'youtube'], ['youtu.be', 'youtube'],
  ['twitter.com', 'tweet'],   ['x.com', 'tweet'],
  ['spotify.com', 'music'],
  ['music.apple.com', 'album'],
  ['soundcloud.com', 'music'],
  ['letterboxd.com', 'movie'],
  ['podcasts.apple.com', 'podcast'], ['podcastindex.org', 'podcast'],
  ['github.com', 'code'],
  ['dribbble.com', 'design'], ['behance.net', 'design'],
];

/**
 * Infer the calendar icon from URL first, then the genre.
 * Genre is matched against GENRE_MAP (case-insensitive, first token wins).
 */
function inferIconName(url: string, genre: string | undefined): string {
  for (const [domain, icon] of URL_ICON_MAP) {
    if (url.includes(domain)) return icon;
  }
  if (genre) {
    const first = genre.trim().toLowerCase().split(/[,\s]+/)[0];
    if (first && GENRE_MAP[first]) return GENRE_MAP[first].icon;
  }
  return 'sparkle';
}

/** Recursively collect all YYYY-MM-DD.md file paths under CONTENT_DIR. */
function collectMdFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMdFiles(full));
    } else if (entry.isFile() && /^\d{4}-\d{2}-\d{2}\.md$/.test(entry.name)) {
      files.push(full);
    }
  }

  return files.sort();
}

export function loadMdEntries(): Entry[] {
  try {
    const files = collectMdFiles(CONTENT_DIR);

    return files.map((filePath, idx) => {
      const date = path.basename(filePath).slice(0, 10);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { meta, body } = parseFrontmatter(raw);
      const mediaUrl = meta.url ?? meta.media_url ?? '';
      const mediaType = meta['media-type'] ?? meta.media_type ?? inferMediaType(mediaUrl);
      const iconName = meta['icon-name'] ?? meta.icon_name ?? inferIconName(mediaUrl, meta.genre);
      
      return {
        id: 10000 + idx,
        created_at: `${date}T00:00:00.000Z`,
        date,
        title: meta.title ?? '',
        content: body,
        media_type: mediaType,
        media_url: mediaUrl,
        icon_name: iconName,
        primary_color: getTopicColor(iconName) ?? null,
        keywords: meta.keywords ?? null,
        genre: meta.genre ?? null,
        tags: meta.tags ?? null,
        why_it_stayed: meta.why_it_stayed ?? null,
        like_count: Number(meta.like_count ?? 0),
        initialMetadata: null,
      } as Entry;
    });
  } catch {
    return [];
  }
}

export function buildMergedMonthsData(
  allEntries: Entry[],
  today: string
): MonthData[] {
  const entryMap = new Map(allEntries.map(e => [e.date, e]));

  const monthKeys = new Set<string>();

  // Ensure calendar always shows continuous months from April 2026 up to the end of the year.
  const startYear = 2026;
  const startMonth = 4; // April

  const currentYear = Math.max(startYear, parseInt(today.slice(0, 4)));

  for (let year = startYear; year <= currentYear; year++) {
    const minMonth = year === startYear ? startMonth : 1;
    const maxMonth = 12; // Show the full year natively without needing external data
    for (let month = minMonth; month <= maxMonth; month++) {
      const monthStr = String(month).padStart(2, '0');
      monthKeys.add(`${year}-${monthStr}`);
    }
  }

  // Also include any months that might have entries outside of this range
  for (const e of allEntries) {
    monthKeys.add(e.date.slice(0, 7));
  }

  return Array.from(monthKeys).sort().reverse().map(key => {
    const [y, m] = key.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const days: DayData[] = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = `${key}-${String(day).padStart(2, '0')}`;
      const entry = entryMap.get(date);
      return {
        day,
        date,
        hasContent: !!entry,
        isToday: date === today,
        iconName: entry?.icon_name ?? null,
        primaryColor: entry?.primary_color ?? null,
        genre: entry?.genre ?? null,
      };
    });
    return { month: MONTH_ABBR[m], year: String(y), days };
  });
}
