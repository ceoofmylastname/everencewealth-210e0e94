# PROMPT 18 — GSC URL-List Triage Script

Build a deterministic, re-runnable triage script that ingests 6 GSC Page Indexing CSV exports and emits 5 ready-to-apply output files. The script does **not** mutate the database, the sitemap, or call the IndexNow function. The user reviews `triage_report.csv` first, then applies each output manually.

## Verified assumptions (corrections from the prompt baked in)

| Prompt said | Actual codebase state | Plan does |
|---|---|---|
| `gone_urls (url_path, retired_reason, retired_at)` | Real columns: `url_path`, `reason`, `pattern_match`, `marked_gone_at`, `created_at` (id, created_at auto) | Generated SQL uses **`(url_path, reason, marked_gone_at)`** with `ON CONFLICT (url_path) DO NOTHING` |
| `all_published_slugs` view exists | Confirmed. Columns: `full_path`, `slug`, `language` | Existence check uses `.eq('full_path', path).maybeSingle()` |
| Edge function `ping-indexnow` | Confirmed at `supabase/functions/ping-indexnow/` | IndexNow JSON output targets that function name |
| `scripts/generateSitemap.ts` exists | Confirmed. **No blocklist mechanism currently in place** | Script only emits the `.txt`; wiring into the sitemap generator happens during apply step 4.2 (not in this ship) |
| `raw/` directory holds CSVs | Does not exist yet | Script fails gracefully with clear "create raw/ and drop the 6 CSVs first" message if any CSV is missing |

## What gets built

**One file:** `scripts/gscTriageURLs.ts`

That's it. No DB migrations. No edge function changes. No sitemap changes. The script only reads CSVs, queries `all_published_slugs`, and writes 5 files to `outputs/`.

## Categorization rules (deterministic, per GSC reason)

```text
soft-404 (46 URLs)
  isContentPath(url) AND NOT in all_published_slugs  → ADD_TO_GONE_URLS
  else                                                → CONTENT_QUALITY_REVIEW

page-with-redirect (40 URLs)
  path contains ',' OR matches comma-state regex     → REMOVE_FROM_SITEMAP
  else                                                → FIX_CANONICAL

duplicate-no-canonical (9 URLs)
  always                                              → FIX_CANONICAL

not-found (6 URLs)
  NOT in all_published_slugs                          → ADD_TO_GONE_URLS
  else                                                → FIX_CANONICAL

crawled-not-indexed (36 URLs)
  always                                              → CONTENT_QUALITY_REVIEW

discovered-not-indexed (48 URLs)
  in all_published_slugs                              → INDEXNOW_PUSH
  else                                                → CONTENT_QUALITY_REVIEW (logged with reason "discovered but not in published surface")
```

The `existsInPublished()` check is mandatory before any `ADD_TO_GONE_URLS` recommendation — inserting a published URL into `gone_urls` would make the PROMPT 17 catchall return 410 on a live page.

## Outputs (5 files in `outputs/`)

1. **`outputs/triage_report.csv`** — `url, category, action, reason` for every input row, sorted by action then category. The summary view the user inspects first.

2. **`outputs/triage_add_to_gone_urls.sql`** — corrected schema:
   ```sql
   -- GSC triage 2026-04-26. Review triage_report.csv before running.
   INSERT INTO public.gone_urls (url_path, reason, marked_gone_at) VALUES
     ('/en/blog/old-slug-1/', 'gsc-soft-404-2026-04-26', NOW()),
     ...
   ON CONFLICT (url_path) DO NOTHING;
   ```

3. **`outputs/triage_remove_from_sitemap.txt`** — one path per line, `#`-prefixed header explaining how to feed into a blocklist `Set` in `scripts/generateSitemap.ts` (wiring is manual, not part of this ship).

4. **`outputs/triage_indexnow_push.json`** — `{ "urls": [...], "source": "manual-gsc-triage-2026-04-26" }`. Pre-validated: every URL is confirmed present in `all_published_slugs`. URLs that fail this check get demoted to `triage_manual_review.csv`.

5. **`outputs/triage_manual_review.csv`** — every row with action `FIX_CANONICAL` or `CONTENT_QUALITY_REVIEW`. The dump for content/SEO review.

## Console summary at end

```text
Total URLs processed: N
Action distribution:
  ADD_TO_GONE_URLS:        X
  REMOVE_FROM_SITEMAP:     X
  FIX_CANONICAL:           X
  CONTENT_QUALITY_REVIEW:  X
  INDEXNOW_PUSH:           X
  IGNORE:                  X
Output files written to outputs/ (5 files)
```

## Hard guard rails (enforced in code)

1. `decide()` calls `existsInPublished()` before any `ADD_TO_GONE_URLS` recommendation.
2. `INDEXNOW_PUSH` URLs are double-checked against `all_published_slugs`; misses are demoted.
3. Script aborts with a clear message if any of the 6 CSVs is missing from `raw/`.
4. Re-running overwrites `outputs/`. User is reminded in the console summary to copy `outputs/` to `outputs/2026-04-26/` before applying if they want a snapshot.
5. Script never writes to the DB, never POSTs to ping-indexnow, never edits the sitemap.

## Apply sequence (after user reviews `outputs/triage_report.csv`)

These steps are **not** part of this ship. They're documented in the script's console summary for the user to run manually:

1. `psql "$SUPABASE_DB_URL" < outputs/triage_add_to_gone_urls.sql`
2. Wire the `.txt` blocklist into `scripts/generateSitemap.ts`, regenerate, redeploy
3. `curl -X POST -H "Authorization: Bearer $SUPABASE_ANON_KEY" -H "Content-Type: application/json" --data @outputs/triage_indexnow_push.json https://zbzrmpmqijvmjbhctfoe.functions.supabase.co/functions/v1/ping-indexnow`
4. Hand `triage_manual_review.csv` to content/SEO
5. Wait 14 days, re-screenshot GSC

## User action required before the script is useful

Drop the 6 GSC exports into `raw/` with the exact filenames from the prompt:

- `raw/gsc-2026-04-26-soft-404.csv`
- `raw/gsc-2026-04-26-page-with-redirect.csv`
- `raw/gsc-2026-04-26-duplicate-no-canonical.csv`
- `raw/gsc-2026-04-26-not-found.csv`
- `raw/gsc-2026-04-26-crawled-not-indexed.csv`
- `raw/gsc-2026-04-26-discovered-not-indexed.csv`

After approval, I'll create the script and an empty `raw/.gitkeep` + `outputs/.gitkeep` so the directories exist. Once the CSVs are dropped in, run `bun run scripts/gscTriageURLs.ts`.
