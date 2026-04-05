/**
 * Social preview image (must exist in `public/`).
 * Code referenced `og-image.png` while the repo asset is `gh_image.png` — keep one path here.
 * Override: `NEXT_PUBLIC_OG_IMAGE=/your.png` (leading slash, under public).
 */
export function getOgImagePath(): string {
  const raw = process.env.NEXT_PUBLIC_OG_IMAGE?.trim();
  if (raw) {
    if (raw.startsWith("/")) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;
  }
  return "/gh_image.png";
}
