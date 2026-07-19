# Durable hub routing (collision basenames)

## Production design

| Layer | Role |
| --- | --- |
| **Content** | Collision hubs use **folder-qualified absolute** hrefs (`/admin/admin_guide`, `/guides/admin_guide`, `/legal/readme`). Hygiene hubs use lowercase relative stems. |
| **Gate** | After build: `npm run check:hub-slugs` (wired in `.github/workflows/deploy.yml`). Requires correct `data-slug` on `.tr-folder-nav-item` and forbids bare collision slugs. |
| **Not durable** | Local patches under `.quartz/plugins/crawl-links` or `node_modules/@quartz-community/utils` — wiped by `npm ci` / `plugin install`. |

## What not to do

- Do not “fix” Quartz hub resolution only in `quartz/util/path.ts` expecting Pages to change. CrawlLinks does not import that module for link rewrite.
- Do not gate deploy on full `npm run check:links` until monorepo source-map unresolved links are allowlisted.

## Local verify

```bat
npx quartz build
npm run check:hub-slugs
```
