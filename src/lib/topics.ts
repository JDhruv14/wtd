/**
 * Topic categories ? each maps to a unique icon + color.
 * Colors are mid-range saturation so they read clearly on both light and dark backgrounds.
 */
export interface TopicConfig {
  label: string;
  color: string;
}

export const TOPICS: Record<string, TopicConfig> = {
  // video / media
  youtube:  { label: "YouTube",  color: "#FF0000" }, // YouTube Red
  reel:     { label: "Reel",     color: "#E1306C" }, // Instagram Rose
  movie:    { label: "Movie",    color: "#FF6B6B" }, // Vibrant Coral
  anime:    { label: "Otaku",    color: "#FF9EED" }, // Soft Pink
  show:     { label: "TV Show",  color: "#00E5FF" }, // Neon Cyan

  // reading / writing
  article:  { label: "Article",  color: "#FFD166" }, // Sunglow
  blog:     { label: "Blog",     color: "#F4A261" }, // Sandy Brown
  book:     { label: "Book",     color: "#2A9D8F" }, // Muted Teal
  thread:   { label: "Thread",   color: "#118AB2" }, // Sapphire Blue
  thought:  { label: "Thought",  color: "#B5A642" }, // Brass Gold

  // social / web
  tweet:    { label: "Twitter",  color: "#1DA1F2" }, // Twitter Blue
  website:  { label: "Internet", color: "#48CAE4" }, // Sky Blue
  link:     { label: "Link",     color: "#0077B6" }, // Ocean Blue

  // audio
  music:    { label: "Music",    color: "#1DB954" }, // Spotify Green
  album:    { label: "Album",    color: "#E9C46A" }, // Maize
  podcast:  { label: "Podcast",  color: "#9D4EDD" }, // Deep Purple

  // creative / tech
  design:   { label: "Design",   color: "#FF007F" }, // Vibrant Fuchsia 
  photo:    { label: "Photo",    color: "#ACB89A" }, // Sage Green 
  art:      { label: "Art",      color: "#FFB5A7" }, // Peach Pink
  code:     { label: "Code",     color: "#06D6A0" }, // Syntax Mint
  game:     { label: "Game",     color: "#7209B7" }, // Grape Purple 
  tool:     { label: "Tool",     color: "#9A8C98" }, // Steel Lavender
  sparkle:  { label: "Life",     color: "#FFB703" }, // Bright Star Yellow
};

export function getTopicColor(iconName: string | null | undefined): string | undefined {
  if (!iconName) return undefined;
  return TOPICS[iconName]?.color;
}

export const GENRE_MAP: Record<string, { icon: string; color: string; label: string }> = {
  life:     { icon: 'sparkle', color: '#FBBF24', label: 'Life' },
  youtube:  { icon: 'youtube', color: '#EF4444', label: 'YouTube' },
  twitter:  { icon: 'tweet',   color: '#3B82F6', label: 'Twitter' },
  code:     { icon: 'code',    color: '#84CC16', label: 'Code' },
  internet: { icon: 'website', color: '#06B6D4', label: 'Internet' },
  movie:    { icon: 'movie',   color: '#A855F7', label: 'Movie' },
  podcast:  { icon: 'podcast', color: '#8B5CF6', label: 'Podcast' },
  book:     { icon: 'book',    color: '#22C55E', label: 'Book' },
  otaku:    { icon: 'anime',   color: '#EC4899', label: 'Otaku' },
};

export const CANONICAL_GENRES = Object.entries(GENRE_MAP).map(([genre, config]) => ({
  genre,
  icon: config.icon,
  color: config.color,
  label: config.label,
}));

export function parseGenreTokens(genre: string | null | undefined): string[] {
  if (!genre) return [];

  const tokens = genre
    .split(/[|,]/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  const icons = tokens
    .map((token) => GENRE_MAP[token]?.icon)
    .filter((icon): icon is string => Boolean(icon));

  return Array.from(new Set(icons));
}

export function getGenreTopicKey(genre: string | null | undefined): string | null {
  return parseGenreTokens(genre)[0] ?? null;
}

export function getTopicKeyFromEntry(
  genre: string | null | undefined,
  iconName: string | null | undefined,
): string {
  return getGenreTopicKey(genre) ?? iconName ?? 'sparkle';
}

export function getTopicKeysFromEntry(
  genre: string | null | undefined,
  iconName: string | null | undefined,
): string[] {
  const genreIcons = parseGenreTokens(genre);
  if (genreIcons.length > 0) return genreIcons;
  return [iconName ?? 'sparkle'];
}
