# Engineering Log — Known Issues & Deferred Migrations

## Bug 3 — Project-wide cluster_id mis-keying (DEFERRED)

**Status:** Known issue, deferred from Cluster 51 retest cycle (PROMPT 28).

**Symptom:** `blog_articles.cluster_id` stores the `cluster_generations.id`
(the generation job UUID), NOT the true cluster UUID from `cluster_assignments`.
The same mis-keying applies to `qa_pages.cluster_id`.

**Why it works in production:** All consumers (compliance scanner, IndexNow
pinger, admin dashboards, completion-progress sync trigger) use the same
wrong key, so the mismatch is internally consistent and invisible to end
users. The bug only surfaces when an external query attempts to join
`blog_articles` against the canonical cluster identifier.

**Origin:** `supabase/functions/generate-cluster-chunk/index.ts` line ~756
passes `jobId` (the generation_id) into the `cluster_id` column on
blog_articles inserts. This was intentional at the time to keep the chunk
worker stateless; the cluster UUID was never threaded through.

**Fix scope (when scheduled):**
1. One-time data migration to remap historical `blog_articles.cluster_id`
   and `qa_pages.cluster_id` from generation_id → true cluster UUID via
   `cluster_generations.cluster_id` lookup.
2. Codebase sweep of every site that queries `where cluster_id = g.id`
   (orchestrator, compliance, IndexNow, dashboards, RLS predicates).
3. Change `generate-cluster-chunk/index.ts` line ~756 from `jobId` to
   `job.cluster_id` (requires plumbing cluster_id through chunk payload).
4. Verify `sync_cluster_progress` trigger still increments correctly
   under the new key.
5. Ship as a dedicated migration with rollback plan and pre/post row
   counts per cluster as the verification gate.

**Risk if shipped without #1:** Existing dashboards and the cluster
completion progress trigger break for all historical clusters.

**Logged:** PROMPT 28 retest cycle, after Cluster 51 v2 (gen
02c64b31-b0bc-4368-94cf-c1facbcdabaa) showed verified_count=2 but
`blog_articles WHERE cluster_id='<true cluster UUID>'` returned 0 rows.

---

## Bug 4 — Batch status='completed' when all entries timed out (DEFERRED)

**Status:** Known issue, deferred from Cluster 51 v3 retest cycle.

**Symptom:** `cluster_batch_jobs.status` is set to `'completed'` even when
every entry in the batch failed via timeout. Example: batch
`c2f7618f-6c1b-40c2-86a0-265cb9f6b19f` reported `status='completed'`,
`build_count=0`, `fail_count=1`, with `results[0].status='timeout'` and
`error='>20min no progress'`. Dashboards and downstream automation read
this as a successful run.

**Root cause:** `tick-cluster-batches` (and the `completed_batch` action
in `build-cluster-step`) treats "no more entries to process" as terminal
success regardless of per-entry outcome. There is no aggregate check of
`fail_count`, `flagged_count`, or `results[*].status` before flipping
the batch to `'completed'`.

**Why P2 (halt-on-partial) does NOT cover this:** P2 only fires when a
generation job returns `partial_failures` in its progress payload — i.e.
some articles succeeded and some failed within the same job. A full-job
timeout never reaches the partial-failures branch; the job is marked
`failed` and the orchestrator advances to the next entry as if nothing
happened, then declares success at end-of-list.

**Fix scope (when scheduled):**
1. In `build-cluster-step` `completed_batch` branch, compute terminal
   status from results: if `fail_count > 0 && build_count === 0` → `failed`;
   if `fail_count > 0 && build_count > 0` → `halted_partial`; if
   `flagged_count > 0` → `halted_partial`; else → `completed`.
2. Mirror the same logic in any `tick-cluster-batches` finalization path.
3. Backfill: optional one-shot script to recompute status on existing
   batches whose `results` array contradicts their `status` column.
4. Add a dashboard guard so `'completed'` batches with `build_count=0`
   raise a visible warning regardless of stored status.

**Risk if not fixed:** Operator trusts dashboard, kicks off a 25-cluster
batch on top of a silently-failed test, discovers the issue only when
60-article counts never appear. Operational risk, not data corruption.

**Logged:** Cluster 51 v3 (batch c2f7618f, gen 63d056f2) — both Claude
fetches aborted at the 4-min CLAUDE_TIMEOUT_MS, worker watchdog killed
the gen at 20 min, batch reported success with zero articles.

---

## PROMPT 27 — Soft 404 Sweep + Slug-Suffix Dedup (2026-05-03)

**Pre-deploy GSC counts (baseline for 2-6 week recovery measurement):**
- Soft 404: 49 URLs
- Discovered, currently not indexed: 602 URLs
- Duplicate without user-selected canonical: 20 URLs

**Shipped:**
- 21 literal soft-404 URLs added to `gone_urls` (defense-in-depth alongside `STRUCTURAL_410_PATTERNS`)
- 5 REDIRECT_MAP changes (careers→team, contact/fna→assessment, /es/acerca, /es/contacto), removed broken `/en/calculator`→`/en/` and `/es/calculator`→`/es/`
- Calculator hub pages: SSR via `scripts/generateStaticCalculatorPage.ts` + React `Calculator.tsx` route
- 60 `qa_pages` rows with `-process-XX-XXXXXXXX` suffix consolidated via `slug_dedup_log` (renamed where canonical missing, merged + 410 where canonical existed)
- Sitemap generator gained `assertNoDuplicateLocs` build-time guard

**Manual post-deploy actions:**
- Resubmit `sitemap-index.xml` in GSC + Bing Webmaster Tools
- Run `bun run scripts/indexnowBulkSubmit.ts`
- Request GSC validation for "Soft 404" + "Duplicate without user-selected canonical" categories
