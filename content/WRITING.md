# How to write posts (daily entries)

This site is a **date-based archive**: each public post is one Markdown file named after the calendar day it represents. The body is rendered as reading text with a small, intentional subset of Markdown plus embed shortcuts.

---

## 1. Where files live

- Put each entry under `content/` in a folder for year and month:  
  `content/YYYY/MM/YYYY-MM-DD.md`
- **The filename must be** `YYYY-MM-DD.md` (ISO date). Only those files are picked up by the build.
- Example: `content/2026/04/2026-04-04.md` → published at `/2026-04-04`.

After you add or edit a file, the dev/build script regenerates `src/lib/content-index.json` so the app can load your Markdown. If something does not show up, restart `npm run dev` or run the build step once.

---

## 2. Front matter (YAML between `---`)

Every post starts with metadata between two `---` lines. Use **`key: value`** lines (simple pairs). Values can be wrapped in quotes if they contain commas or special characters.

Markdown posts do **not** use `url`, `like_count`, or `why_it_stayed` in front matter. **Likes** come from the live API (Redis). **Videos, links, and images** go in the body with `@[https://...]` (see below).

| Field | Required | What it does |
|--------|----------|----------------|
| `title` | Yes | Page title and SEO heading. |
| `description` | Optional | Subtitle shown under the title. If omitted, the first readable paragraph of the body is used instead. |
| `media-type` or `media_type` | Optional | Overrides default for the **hero** slot when you use a CMS-style URL (not used for plain Markdown-only posts). |
| `icon-name` or `icon_name` | Optional | Canonical keys are **lowercase** (`tweet`, `youtube`, `sparkle`, …). Labels like **`Twitter`** or **`YouTube`** are normalized automatically (`Twitter` → `tweet`). If omitted, the first **tag** token that matches the topic map is used, else `sparkle`. |
| `tags` | Optional | Comma- or pipe-separated labels. Shown **below the date** on the entry page and used for sidebar topic filters (known tokens map to the same icons as before). Legacy `genre:` in a file is still read once as `tags` for migration. |

**Tips**

- Put **YouTube, Spotify, article links, and images** in the **body** on their own line: `@[https://...]` (see section 3).
- For a **text-only** day, set `icon-name` (e.g. `sparkle`) so the hero placeholder and gradient match that topic.
- Avoid `# comment` lines inside the front matter block; the parser treats lines as `key: value` and may misread lines that contain `:` in odd ways.

---

## 3. Body: Markdown and embeds

The renderer supports:

- **Paragraphs** — normal lines of text (blank line = spacing).
- **Headings** — `#`, `##`, `###` at the start of a line.
- **Bold / italic / links** — `**bold**`, `*italic*`, `[label](https://example.com)`.
- **Block quotes** — lines starting with `> ` (space after `>`).
- **Bullet-like lists** — lines starting with `- ` or `* ` (rendered as a simple list style).

**Embeds (own line)** — this is how you add video, music, and page-related media:

| Syntax | Result |
|--------|--------|
| `@[https://...]` | One URL per line. YouTube and Spotify become players; direct image URLs (e.g. `.jpg`, `.png`, `.webp`) become images. |
| `@![caption](https://...)` | Image with optional caption (caption may be empty: `@![](https://...)`). |
| `![alt](https://...)` | Standard Markdown image (caption from alt text). |

Put each `@[...]` or image line on its own line so the parser can see it.

**Hero vs body:** For Markdown-only entries, the top **hero** area is a simple placeholder unless you use a CMS-style pipeline. All rich embeds belong in the article body via `@[...]`.

---

## 4. Workflow checklist

1. Copy an existing `YYYY-MM-DD.md` from `content/` as a template.
2. Set the **filename** to the **publication date** you want in the URL.
3. Fill **front matter** (`title` at minimum; add `genre`, `icon-name`, etc. as needed).
4. Write the **body** in Markdown; use `@[url]` on its own line for YouTube, Spotify, images, or any link the embed handler supports.
5. Run the site locally and open `/YYYY-MM-DD` to proofread.

---

## 5. Tone and structure (editorial)

These are suggestions, not rules enforced by code:

- **One day, one post** — the archive reads best when each file is a single day’s note, link, or short essay.
- **Title** — clear and specific; it is what people see first.
- **Genre / tags** — use them so future you can scan the sidebar and filters; keep tokens consistent over time when possible.
- **Length** — short notes are fine; long posts work if you use headings and `@[...]` breaks so the page does not become a wall of text.

---

## 6. Troubleshooting

| Issue | What to check |
|--------|----------------|
| Page 404 or empty day | Filename must be exactly `YYYY-MM-DD.md`; date folder must match. |
| Changes not visible | Regenerate / restart dev so `content-index.json` updates. |
| Image does not load | URL must be `https` (or allowed `http`); very unusual hosts may still block hotlinking. |
| Wrong icon or color | Set `icon-name` explicitly, or add topic tokens to `tags` (e.g. `life`, `youtube`) so filters and inference match. |

For implementation details, see `scripts/generate-content-index.mjs`, `src/lib/markdown-loader.ts`, and `src/components/content-parser.tsx`.
