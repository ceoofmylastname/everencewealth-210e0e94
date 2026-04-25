# PROMPT 15 — IndexNow Push Pipeline (Hardened)

## Reality Check vs. Prompt Assumptions

The prompt assumed a greenfield IndexNow install. Audit reveals partial infrastructure with three functional gaps:

| Component | Prompt assumed | Actual state | Action |
|---|---|---|---|
| Secret `INDEXNOW_KEY` | Generate fresh | **Missing**. Function falls back to hardcoded `8f3a2c1d4e5b6f7a8c9d0e1f2a3b4c5d` (16 hex chars, committed to repo) | Generate new 64-char key, store as secret, retire old |
| Key file at origin | Create `public/{KEY}.txt` | `public/indexnow-key.txt` exists with weak key, no trailing newline, nonstandard filename | Replace with `public/{NEW_KEY}.txt` matching the secret |
| Edge function | Create `indexnow-ping` | `ping-indexnow` already exists, accepts both `{urls}` and `{table, slug}` shapes, fans out to api.indexnow.org + bing + yandex | **Reuse**. Add log-to-DB step, switch to `INDEXNOW_KEY` secret, remove hardcoded fallback |
| DB triggers | Create on 5 tables | Migration files define them but `information_schema.triggers` returns **0 rows live** — triggers are not installed. Publishes do NOT ping IndexNow today. | Re-create triggers cleanly; add `static_pages` (was missing) |
| `indexnow_pings` log table | Create | Does not exist | Create |
| `static_pages` | Has `status` column | **No `status` column** — every row is live | Fire trigger on every UPDATE (matches prompt note) |
| `glossary_terms` table | Create trigger | **Does not exist** — content lives in `public/glossary.json` | Skip trigger; cover via bulk submit script |
| `all_published_slugs` view | Used by bulk script | Already exists from Prompt 13/17, returns `full_path` | Reuse directly |

The site has been silently relying on Bing/Google crawl discovery this whole time despite having an IndexNow function. This plan makes it actually work.

---

## Plan

### Step 1 — Rotate the IndexNow key

1. Generate a new 64-char lowercase hex string (cryptographically random).
2. Store as Supabase secret `INDEXNOW_KEY` via `add_secret`. The user will paste the value in the secret prompt.
3. Write `public/{KEY}.txt` (filename = the key itself, per IndexNow spec) containing only the key + single trailing newline.
4. Delete the old `public/indexnow-key.txt` (weak, leaked).
5. Add `scripts/buildAssertIndexNowKeyFile.ts` invoked from `build.sh` that fails the build if:
   - Exactly one `public/[0-9a-f]{64}.txt` file exists, AND
   - Its basename (sans `.txt`) equals its file contents (trimmed).
   The script does NOT need the secret — it only checks file/filename consistency. Secret/file alignment is verified by the `keyLocation` URL test in Step 6.

### Step 2 — Refactor `ping-indexnow` edge function

Edits to `supabase/functions/ping-indexnow/index.ts`:

- Read `INDEXNOW_KEY` from env. If missing, return 500 with clear error — **remove the hardcoded fallback** so a misconfigured deploy fails loudly instead of pinging with a leaked key.
- Compute `KEY_LOCATION = ${BASE_URL}/${INDEXNOW_KEY}.txt` dynamically (was hardcoded to old filename).
- After fanout to the 3 endpoints, insert one row per endpoint into `public.indexnow_pings`:
  `urls TEXT[], submitted_at TIMESTAMPTZ DEFAULT now(), endpoint TEXT, status_code INT, response_body TEXT, source TEXT` (`'insert' | 'update' | 'manual' | 'manual-bulk'`).
- Source field: derive from request body's `action` (DB trigger sends `TG_OP`) or `source` (manual/bulk callers). Default `'manual'`.
- Keep existing CORS, keep the `{table, slug}` → URL builder for back-compat with any old triggers, but the new triggers (Step 3) will send `{urls, source}` directly.
- Add JWT auth check on the manual path: if `source === 'manual'` or `'manual-bulk'`, require `Authorization` header with admin claim. Trigger-originated calls authenticate via `Authorization: Bearer <anon>` with a body marker — keep `verify_jwt = false` (default) and validate in code.

### Step 3 — Database migration

One migration file containing:

**3a. `indexnow_pings` table** with RLS — admin-only SELECT, anon INSERT (function uses anon key).

**3b. `notify_indexnow()` function** — clean rewrite separate from existing `notify_sitemap_ping()`. URL builder per the prompt's CASE block:
- `blog_articles` → `/{lang}/blog/{slug}/`
- `qa_pages` → `/{lang}/qa/{slug}/`
- `location_pages` → `/{lang}/locations/{city_slug}/{topic_slug}/` (both languages, `/ubicaciones/` skipped — zero data rows)
- `comparison_pages` → `/en/compare/{slug}/` or `/es/comparar/{slug}/`
- `static_pages` → `/{lang}/{slug}/` (fires on every UPDATE since no status column)

For tables with `status`: only fire when `NEW.status = 'published'`. For `static_pages`: skip the status check.

Calls `net.http_post` to `https://zbzrmpmqijvmjbhctfoe.functions.supabase.co/functions/v1/ping-indexnow` with body `{urls: [url], source: TG_OP}` and `Authorization: Bearer <ANON_KEY>` (sourced from a GUC `app.settings.anon_key` with hardcoded fallback to the project's anon key — same pattern used by `notify_sitemap_ping` per migration `20260424033831`).

**3c. Triggers** — drop any pre-existing `on_*_ping_indexnow` triggers (from old migrations that didn't actually install), then `CREATE TRIGGER` on:
- `blog_articles` AFTER INSERT OR UPDATE OF status, slug, headline, detailed_content, meta_description
- `qa_pages` AFTER INSERT OR UPDATE OF status, slug, question, answer, meta_description
- `location_pages` AFTER INSERT OR UPDATE OF status, city_slug, topic_slug, content
- `comparison_pages` AFTER INSERT OR UPDATE OF status, slug, content
- `static_pages` AFTER INSERT OR UPDATE OF slug, title, h1, body_markdown (no status filter)

Each trigger calls `notify_indexnow()`. The existing `notify_sitemap_ping` triggers (whatever survives) are **left in place** — they fire the same edge function with `{table, slug}` shape, which is harmless duplication during the cutover. Cleanup of those is a separate ticket.

### Step 4 — Manual ping endpoint

Already covered by `ping-indexnow` accepting `{urls, source: 'manual'}`. Add a thin admin UI later (out of scope for this prompt). For now, document the curl shape in `.lovable/plan.md`.

### Step 5 — One-shot bulk submit script

`scripts/indexnowBulkSubmit.ts`:
1. Query `SELECT full_path, language FROM public.all_published_slugs` → covers blog/qa/locations/compare/static.
2. Read `public/glossary.json`, generate `/en/glossary/{term-slug}/` and `/es/glossary/{term-slug}/` per entry (verify `term-slug` field name in JSON before generating).
3. Map all paths to absolute URLs (`https://www.everencewealth.com{path}`).
4. Batch into chunks of 10000, POST each to the deployed `ping-indexnow` with `source: 'manual-bulk'` and a service-role bearer token (script runs locally with env access).
5. Log result count and first-row ping_id.

Run once after deploy. Re-runnable safely (IndexNow ignores duplicates within a window).

### Step 6 — Verification checklist

1. `curl -sIL https://www.everencewealth.com/{NEW_KEY}.txt` → `200 text/plain`.
2. `curl https://www.everencewealth.com/{NEW_KEY}.txt` body equals `INDEXNOW_KEY` secret value (manual eyeball).
3. Touch a published blog post (UPDATE meta_description). Within ~5s:
   `SELECT * FROM indexnow_pings ORDER BY submitted_at DESC LIMIT 5;` → 3 rows (one per endpoint), status_code 200/202, urls contains the test URL, source = `'UPDATE'`.
4. Bulk-submit script runs, logs N rows where N = `SELECT count(*) FROM all_published_slugs` + glossary URLs.
5. Bing Webmaster Tools URL Inspection on test URL within 10 min shows "Discovered via IndexNow".

---

## Files Touched

**Created**:
- `public/{NEW_64_CHAR_KEY}.txt`
- `scripts/buildAssertIndexNowKeyFile.ts`
- `scripts/indexnowBulkSubmit.ts`
- `supabase/migrations/{timestamp}_indexnow_triggers_and_log.sql`

**Edited**:
- `supabase/functions/ping-indexnow/index.ts` (logging + remove hardcoded key + JWT check on manual)
- `build.sh` (invoke key-file assertion)
- `.lovable/plan.md` (document curl shape + cutover notes)

**Deleted**:
- `public/indexnow-key.txt` (weak, retired)

## Required User Action Before Implementation

The `INDEXNOW_KEY` secret must be added. Once approved, the implementation will:
1. Generate the 64-char key.
2. Prompt the user to add it as the `INDEXNOW_KEY` secret (cannot self-set).
3. Pause until secret is confirmed, then proceed with file creation, migration, and function refactor.

## Out of Scope

- Cleaning up the legacy `notify_sitemap_ping` triggers (functional duplication is harmless; separate ticket).
- Admin UI for manual ping (curl-only for now).
- Glossary migration to DB (would unlock real-time triggers; documented but not done).
