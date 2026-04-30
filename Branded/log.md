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
