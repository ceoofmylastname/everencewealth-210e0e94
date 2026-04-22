

## Sitemap fix + pre-flight URL resolution check

Final plan with 4 amendments + pre-flight URL verification baked in. Single execution.

### Pre-flight check (BEFORE writing any sitemap)

Verify each candidate URL pattern actually resolves to real content (not 404, not SPA fallback to homepage). Any pattern that fails routing gets either fixed in the same commit OR swapped to the working URL pattern with the violation flagged.

**Check 1 — Guides:** `curl -sL https://everencewealth.lovable.app/en/guides/<slug>` for all 6 brochure slugs. Inspect for:
- HTTP 200 + brochure content (not the React `<NotFound />` component)
- Page title matches brochure, not "Page Not Found"

If `/en/guides/<slug>` returns 404 or SPA-fallback-without-content:
- (a) **Preferred:** add the localized route in `App.tsx` so `/en/guides/<slug>` renders `BrochureDetail` in the same commit.
- (b) **Fallback:** write `/guides/<slug>` into the sitemap with `<xhtml:link rel="alternate" hreflang="en" href="..."/>` and flag the language-prefix violation as a separate follow-up.

**Check 2 — State-guides:** `curl -sL https://everencewealth.lovable.app/en/retirement-planning/<topic_slug>` for at least one `topic_slug` returned by the dedup query. Same 200 + real content check. Same fix-or-swap rule.

**Check 3 — Strategies:** `curl -sL` `/en/strategies/iul` and `/es/estrategias/seguro-universal-indexado`. Already verified ES content exists in `es.ts` translations, but routing must respond 200.

**Check 4 — Glossary:** if `glossary_terms` table is non-empty, curl `/en/glossary/<first-slug>`. If table is empty, skip — sitemap ships valid empty `<urlset/>`.

Report each check's result (URL, status, content sample) before proceeding to generator execution.

### Generator changes — `scripts/generateSitemap.ts`

Helpers:
- `gitLastModified(filePath)` — `git log -1 --format=%cI -- <file>`. Throws on git failure → falls back to per-strategy `REVIEW_DATES` constant. Never `mtime`/`NOW()`.
- `lastmodFromRow(row)` — `row.updated_at ?? row.date_modified`. Throws if both null.
- `writeSitemap(lang, type, urls)` — Set-based dedup on `<loc>`; throws when `type ∈ {blog, qa, strategies, locations, comparisons}` and 0 URLs; warns for `{guides, glossary, state-guides}`.
- DB query wrapper — `try/catch` per query, logs failure, re-throws to fail build with non-zero exit.

New generators:

| File | Source | URL pattern (post-pre-flight) | lastmod | Expected |
|---|---|---|---|---|
| `en/strategies.xml` | hardcoded `STRATEGIES.en` | `/en/strategies/{slug}` | `gitLastModified()` | 4 |
| `es/strategies.xml` | hardcoded `STRATEGIES.es` | `/es/estrategias/{slug}` | `gitLastModified()` | 4 |
| `en/guides.xml` | `brochures` WHERE `language='en'` | `/en/guides/{slug}` *(or fallback)* | `updated_at` | 6 |
| `es/guides.xml` | `brochures` WHERE `language='es'` | `/es/guides/{slug}` | `updated_at` | 0 (empty `<urlset/>`) |
| `en/glossary.xml` | `glossary_terms` else `glossary.json` | `/en/glossary/{slug}` | `updated_at` | 0 or N |
| `es/glossary.xml` | same filtered ES | `/es/glossary/{slug}` | `updated_at` | 0 or N |
| `en/state-guides.xml` | `location_pages WHERE state_code IS NOT NULL AND status='published' AND language='en' GROUP BY topic_slug` | `/en/retirement-planning/{topic_slug}` | `MAX(updated_at)` | ~5–10 |
| `es/state-guides.xml` | same, language='es' | `/es/retirement-planning/{topic_slug}` | `MAX(updated_at)` | N |

Existing generators (blog, qa, locations, comparisons) regenerated with the same dedup + assert + lastmod policy. Anchor-fragment glossary URLs removed.

### Master index

`public/sitemap-index.xml` and `public/sitemap.xml` list all 16 child sitemaps:
```
en/{blog,qa,locations,comparisons,strategies,guides,glossary,state-guides}.xml
es/{blog,qa,locations,comparisons,strategies,guides,glossary,state-guides}.xml
```

### Build pipeline + cleanup

- `package.json`: `"build": "tsx scripts/generateSitemap.ts && vite build"` so every Cloudflare Pages deploy regenerates from live DB regardless of build entrypoint.
- Delete `public/sitemaps/{da,de,fi,fr,hu,nl,no,pl,sv}/`, `public/sitemaps/brochures.xml`, root `public/sitemaps/glossary.xml`.

### Execution order

1. Run pre-flight curl checks (guides, state-guides, strategies, optional glossary). Report results.
2. If any URL fails: apply (a) routing fix or (b) URL-swap-with-flag, then re-curl.
3. Edit `scripts/generateSitemap.ts` (helpers + 4 new generators + dedup + assertions + try/catch).
4. Edit `package.json` build script.
5. Delete legacy directories + standalone XML files.
6. Run `npx tsx scripts/generateSitemap.ts`.
7. Report:
   - Per-file `<url>` counts for all 16 sitemaps.
   - First 3 `<url>` entries from `en/strategies.xml`, `en/guides.xml`, `en/state-guides.xml`.
   - Regenerated `sitemap-index.xml` contents.
   - Pre-flight check log + any (a)/(b) decisions made.

### Out of scope (queued separately)

- React Helmet → SSR JSON-LD migration (next deploy — highest AI-citation lever).
- `/en/sitemap` HTML hub soft-404.
- `/llms.txt` SPA shell.
- Glossary content backfill if both `glossary_terms` and `glossary.json` empty.

