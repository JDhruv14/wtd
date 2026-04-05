/**
 * Single source of truth for all topics. Each entry is the canonical icon key
 * (matching icon.tsx cases), with display info and the tag tokens that map to it.
 */
export interface TopicConfig {
  label: string;
  color: string;
  /** Tag / icon-name tokens (lowercase) that resolve to this topic. */
  aliases: string[];
}

export const TOPICS: Record<string, TopicConfig> = {
  sparkle: { label: "Life", color: "#FFB703", aliases: ["life", "sparkle"] },
  youtube: { label: "YouTube", color: "#FF0000", aliases: ["youtube"] },
  tweet: {
    label: "Twitter",
    color: "#1DA1F2",
    aliases: ["twitter", "tweet", "x"],
  },
  code: { label: "Code", color: "#06D6A0", aliases: ["code"] },
  website: {
    label: "Internet",
    color: "#48CAE4",
    aliases: ["internet", "website"],
  },
  movie: { label: "Movie", color: "#FF6B6B", aliases: ["movie"] },
  podcast: { label: "Podcast", color: "#9D4EDD", aliases: ["podcast"] },
  book: { label: "Book", color: "#2A9D8F", aliases: ["book"] },
  anime: { label: "Otaku", color: "#FF9EED", aliases: ["otaku", "anime"] },
};

/** Build a reverse-lookup token → canonical key at module load time. */
const TOKEN_TO_KEY: Record<string, string> = {};
for (const [key, cfg] of Object.entries(TOPICS)) {
  for (const alias of cfg.aliases) TOKEN_TO_KEY[alias] = key;
}

/** Normalize any icon-name or tag token to a canonical TOPICS key, or `undefined` if unknown. */
function resolveTopicKey(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const lower = raw.trim().toLowerCase();
  return TOKEN_TO_KEY[lower] ?? (TOPICS[lower] ? lower : undefined);
}

/** Returns the canonical TOPICS key, falling back to `"sparkle"` for unknowns. */
export function canonicalIconName(raw: string | null | undefined): string {
  return resolveTopicKey(raw) ?? "sparkle";
}

/** Returns the accent color for a topic key or any recognized alias. */
export function getTopicColor(
  iconName: string | null | undefined,
): string | undefined {
  const key = resolveTopicKey(iconName);
  return key ? TOPICS[key].color : undefined;
}

/** Shape used by the sidebar filter UI. */
export const CANONICAL_GENRES = Object.entries(TOPICS).map(([icon, cfg]) => ({
  icon,
  label: cfg.label,
  color: cfg.color,
}));

/** Parses comma/pipe-separated tag tokens and returns matching canonical topic keys. */
export function parseTagsForTopics(tags: string | null | undefined): string[] {
  if (!tags) return [];
  const seen = new Set<string>();
  for (const token of tags.split(/[|,]/).map((t) => t.trim().toLowerCase())) {
    const key = TOKEN_TO_KEY[token];
    if (key) seen.add(key);
  }
  return Array.from(seen);
}

/** Primary topic key from tags, then icon_name, then `"sparkle"`. */
export function getTopicKeyFromEntry(
  tags: string | null | undefined,
  iconName: string | null | undefined,
): string {
  return parseTagsForTopics(tags)[0] ?? canonicalIconName(iconName);
}

/** All topic keys for an entry (from tags, or icon_name if no tags match). */
export function getTopicKeysFromEntry(
  tags: string | null | undefined,
  iconName: string | null | undefined,
): string[] {
  const fromTags = parseTagsForTopics(tags);
  return fromTags.length > 0 ? fromTags : [canonicalIconName(iconName)];
}
