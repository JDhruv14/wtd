# Writing posts

One file per day: `content/YYYY/MM/YYYY-MM-DD.md` → public URL `/YYYY-MM-DD`.

Run `npm run dev` after adding or editing files so the content index regenerates.

---

## Front matter (YAML between `---`)

| Field | Notes |
|-------|--------|
| `title` | **Required.** Page title. |
| `description` | Optional. Subtitle under the title. If omitted, a short excerpt is taken from the body (embed lines are skipped). |
| `icon-name` | Optional. Canonical **topic key** for accent colour and calendar icon (see table below). Aliases like `Twitter` → `tweet` work. If omitted, first matching **tag** is used, else `sparkle`. |
| `tags` | Optional. Comma- or pipe-separated. Shown under the date and drive sidebar filters. Use tokens from the topics table. Legacy `genre:` is still read once as tags. |

Do **not** put `url`, `like_count`, or `why_it_stayed` in front matter. Likes are stored via the API; links and media go in the body with `@[...]`.

---

## Markdown quick reference

| You want | Write |
|----------|--------|
| **Bold** | `**bold**` |
| *Italic* | `*italic*` or `_italic_` |
| Link | `[label](https://example.com)` |
| Heading | `#` `##` `###` at line start |
| Quote | Line starting with `> ` |
| List | Lines starting with `- ` or `* ` |
| Paragraph | Blank line between blocks |

**Embeds** — each on its **own line**:

| Syntax | Use |
|--------|-----|
| `@[https://…]` | YouTube / Spotify players, images, or generic links the parser supports |
| `@![caption](https://…)` | Image with optional caption |
| `![alt](https://…)` | Standard Markdown image |

Text-only posts are fine; optional hero media only appears when you embed a URL that resolves to media.

---

## Topics & `icon-name`

Use these **canonical keys** in `icon-name` (lowercase). **Tags** can use any **alias** in the same row — multiple tags can attach to one entry.

| Key (`icon-name`) | Label (UI) | Tag aliases |
|---------------------|------------|-------------|
| `sparkle` | Life | `life`, `sparkle` |
| `youtube` | YouTube | `youtube` |
| `tweet` | Twitter | `twitter`, `tweet`, `x` |
| `code` | Code | `code` |
| `website` | Internet | `internet`, `website` |
| `movie` | Movie | `movie` |
| `podcast` | Podcast | `podcast` |
| `book` | Book | `book` |
| `anime` | Otaku | `otaku`, `anime` |

Unknown names fall back to `sparkle`.

---

## Checklist

1. Copy an existing `YYYY-MM-DD.md`.
2. Set `title` (and optionally `description`, `icon-name`, `tags`).
3. Write the body; put embeds on their own lines.
4. Open `/YYYY-MM-DD` locally to proofread.

For implementation details, see `scripts/generate-content-index.mjs`, `src/lib/markdown-loader.ts`, and `src/components/content-parser.tsx`.
