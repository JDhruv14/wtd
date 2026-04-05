/**
 * Canonical site origin for Open Graph / Twitter absolute URLs (metadataBase).
 * Set `NEXT_PUBLIC_SITE_URL` on production builds (no trailing slash).
 * Cloudflare Pages sets `CF_PAGES_URL` — we use it if the public URL isn’t set.
 */
export function getSiteUrl(): URL {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.CF_PAGES_URL,
  ];
  for (const c of candidates) {
    const raw = c?.trim();
    if (raw && /^https?:\/\//i.test(raw)) {
      return new URL(raw.replace(/\/$/, ""));
    }
  }
  return new URL("http://localhost:3000");
}
