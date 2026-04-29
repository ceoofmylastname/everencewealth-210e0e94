# PROMPT 28 — Build the 25 recruiting clusters (51-75)

## What's already done (do not redo)

Investigation found that the prior infrastructure work is already shipped:

- **Manifest already has 75 clusters.** `supabase/functions/bulk-build-clusters/manifest.json` has `total_count: 75`, max id 75, and clusters 51-75 all carry `compliance_class: "recruiting_no_income_claims"` and `moneyPageTarget: "/contracting/intake"`.
- **BOFU URL is live.** `https://www.everencewealth.com/contracting/intake` returns HTTP 200 (no redirect). It's already in `MONEY_PAGE_WHITELIST` inside `bulk-build-clusters/index.ts`.
- **Compliance pipeline is wired.** `build-cluster-step/index.ts` lines 323-357 already runs `scanText()` against `headline / meta_title / meta_description / speakable_answer / detailed_content` for every article in a recruiting cluster, demotes hits to `status='draft'`, and upserts into `flagged_articles` with `compliance_class` and `reason='income_claim_detected'`. Gated on `compliance_class === "recruiting_no_income_claims"`, so the existing 50 wealth clusters are untouched.
- **`flagged_articles` table exists** with the right columns (`article_id, reason, matched_pattern, matched_excerpt, cluster_generation_id, compliance_class, status`).
- **Sync trigger from PROMPT 27 is live.** `sync_cluster_progress()` keeps `cluster_completion_progress` accurate as articles land — but it only `UPDATE`s, it does not `INSERT`.

## What's actually missing

### 1. Two regex patterns from your spec aren't in `INCOME_PATTERNS`

Current scanner (lines 20-30 of `build-cluster-step/index.ts`) covers `$\d`, earn/income/make-money/salary phrasing, top-earner, best-paying, dollar shorthand. **Missing:**

- `\bsign[-\s]?on\s+bonus\b`
- `\boverride\s+schedule\b`

Add both to `INCOME_PATTERNS` with labels `signon_bonus` and `override_schedule`. Five-line change.

### 2. `cluster_completion_progress` rows for 51-75 don't exist

The build pipeline assigns a fresh UUID (`cluster_generations.id`) per cluster build and writes that as `blog_articles.cluster_id`. The PROMPT 27 sync trigger then runs an `UPDATE … WHERE cluster_id = …` — **which silently does nothing if no row exists.** Result without action: builds will succeed, articles will land, but the dashboard shows 11/36 forever.

Two viable fixes; recommending **option B**:

- **A. Pre-seed 25 rows with manual UUIDs** as your prompt requests. Problem: those UUIDs won't match the `cluster_generations.id` the orchestrator assigns at build time, so the trigger still misses.
- **B. Have the worker insert the progress row when it creates the `cluster_generations` job.** Single insert in `build-cluster-step` right after `generate-cluster` returns the new job id. Uses the real cluster_id from day one. Carries the manifest's compliance class, tier, and priority into the row.

Going with B. Insert sketch (added inside the worker, immediately after a new `cluster_generations` row is created for an entry):

```sql
INSERT INTO cluster_completion_progress
  (cluster_id, cluster_theme, total_articles_needed, status,
   tier, priority_score, languages_status, last_updated)
VALUES
  ($job_id, $manifest_entry.name, 60, 'in_progress',
   'tier_1', $manifest_entry.id,
   jsonb_build_object('compliance_class', 'recruiting_no_income_claims'),
   now())
ON CONFLICT (cluster_id) DO NOTHING;
```

Tier `tier_1` and the compliance_class JSONB are only set when `compliance_class === "recruiting_no_income_claims"`; wealth clusters keep their existing default behavior unchanged.

The PROMPT 27 trigger then takes over and bumps `english_articles / translations_completed / articles_completed / status` on every insert into `blog_articles` and `qa_pages`. When `articles_completed` hits 60, status flips to `'completed'` and `completed_at` is set automatically — no extra work needed in the worker.

### 3. IndexNow ping per completed cluster

`build-cluster-step` doesn't currently call `ping-indexnow` when a cluster finishes. Add a single fire-and-forget call inside the same `if (completionOk)` branch, after results are written: pull all `blog_articles.slug` and `qa_pages.slug` for the completed `cluster_id`, build the URL list (EN + ES, both `/blog/` and `/qa/`), and POST to `ping-indexnow` with `source: 'cluster_complete'`. The function already accepts `{ urls: string[], source: string }`.

## Plan of work

1. **Edit `supabase/functions/build-cluster-step/index.ts`:**
   - Append 2 regex entries to `INCOME_PATTERNS`.
   - Right after orchestrator confirms a fresh `cluster_generations` job for a manifest entry, upsert the `cluster_completion_progress` row (only writing tier/compliance metadata for recruiting class).
   - Inside the `completionOk` branch, after the compliance scan, fetch the cluster's slugs and fire-and-forget `ping-indexnow`.
2. **Deploy `build-cluster-step`.** No new edge function, no migration.
3. **Dry run.** `POST /functions/v1/bulk-build-clusters` with `{ mode: 'dry_run', start_from: 51, limit: 25 }` and report:
   - Manifest validation result (already passes — verified offline).
   - Classification array showing 25 build entries (no skips expected — no production overlap with recruiting topics, all `skip_by_default: false`).
   - Confirmation that BOFU `/contracting/intake` is in whitelist and returns 200.
   - Compliance scanner pattern list (now 11 patterns, gated on `recruiting_no_income_claims` only).
   - Estimated cost/time: derived from existing wealth-cluster batch history in `cluster_batch_jobs` (we'll query the average duration and Anthropic token usage of a wealth-cluster build and multiply by 25).
4. **Stop and wait** for explicit "go live."
5. **On approval:** re-POST with `mode: 'live'`. The cron-driven worker chain handles the rest in priority_score order. Each cluster's `cluster_completion_progress` row will go `not_started → in_progress → completed` automatically via the PROMPT 27 trigger.

## Files touched

- `supabase/functions/build-cluster-step/index.ts` — regex additions + progress-row upsert + IndexNow ping (~40 lines added)

No migration. No manifest change. No changes to the existing 50 wealth clusters' code paths.

## Acceptance criteria mapping

| Criterion | How it's met |
|---|---|
| 25 rows in `cluster_completion_progress` with `tier='tier_1'` | Worker upserts on first build event, status flips via PROMPT 27 trigger |
| Zero published articles with income-claim language | `INCOME_PATTERNS` (now 11) scanned pre-publish; failures demoted to draft + flagged |
| BOFU links to `/contracting/intake` | Manifest already pins `moneyPageTarget` for all 25; whitelist enforced in `bulk-build-clusters` validation |
| IndexNow pinged once per completed cluster | New fire-and-forget call in worker `completionOk` branch |
| Dashboard shows 36 completed | 11 existing + 25 new, tracked via real cluster_ids and PROMPT 27 trigger |

## Out of scope

- No edits to wealth cluster code paths (compliance gate already excludes them).
- No spec-file ingestion script — the manifest already encodes everything from `everencewealth-25-recruiting-clusters.md`.
- No live billing until you reply "go live."
