/**
 * Canonical site origin for Open Graph / Twitter absolute URLs.
 * Set `NEXT_PUBLIC_SITE_URL` in production (no trailing slash), e.g. `https://yoursite.com`.
 */
export function getSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return new URL(raw.replace(/\/$/, ""));
  }
  return new URL("http://localhost:3000");
}
