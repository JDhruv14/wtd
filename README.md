# What the Dhruv

A personal, date-based archive site: daily Markdown entries, a calendar sidebar, topic filters, and live likes (Redis). The UI is built as a calm, editorial reading experience.

## Stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS**
- Content: Markdown under `content/` with YAML front matter
- **OpenNext + Cloudflare** for deploy (`wrangler`, `@opennextjs/cloudflare`)
- **Upstash Redis** for `/api/like` counts (optional locally; set env in production)

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Regenerates the content index, then starts Next dev server |
| `npm run build` | Content index + OpenNext Cloudflare production build |
| `npm run preview` | Preview the Cloudflare build |
| `npm run deploy` | Deploy via OpenNext Cloudflare |
| `npm run lint` | ESLint |

## Environment

Create `.env` (not committed) with:

- `UPSTASH_REDIS_REST_URL` — REST URL from Upstash
- `UPSTASH_REDIS_REST_TOKEN` — REST token

If these are missing, like counts still work in the UI but persist as zeros server-side.

## Writing posts

See **`content/WRITING.md`** for file layout, front matter, Markdown syntax, embeds (`@[url]`), **`icon-name`**, **`tags`**, and topics.

## Content layout

- Entries: `content/YYYY/MM/YYYY-MM-DD.md`
- Favourites list: `content/sidebar/favourites.ts`
- Build writes `src/lib/content-index.json` (generated; do not hand-edit)

## License

Private project unless you add a license.
