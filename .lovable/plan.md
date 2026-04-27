# Smoke Test Execution Plan — limit=10 live run

## What I'll do (no new code)

1. **Trigger the smoke test** by invoking the existing `bulk-build-clusters` edge function with:
   ```json
   { "mode": "live", "limit": 10, "manifest_path": "manifests/everencewealth-75-cluster-manifest.json" }
   ```
   Expected: ~5 actual builds (the dry-run already showed 3 of the first 10 will be deduped/skipped). Returns a `batch_job_id` synchronously and fires `build-cluster-step` index 0 fire-and-forget.

2. **Poll `cluster_batch_jobs` row** every ~3 min via `read_query`. Report progress checkpoints in chat: `current_index/total · build/skip/fail/flagged · elapsed`. Total expected runtime: ~25-30 min for 5 builds.

3. **On `status='completed'`, gather and report:**
   - **Headline counts**: `build_count / skip_count / fail_count / flagged_count` from the batch row
   - **Full `results` jsonb dump**: per-cluster `{topic, status, duration_ms, flagged_terms, cluster_id}`
   - **Compliance hits** from `flagged_articles` for any article in the smoke-test cluster set:
     ```sql
     SELECT article_id, matched_pattern, excerpt, flagged_at, status
     FROM flagged_articles
     WHERE article_id IN (SELECT id FROM blog_articles WHERE cluster_id = ANY($built_cluster_ids))
     ```
   - **Per-cluster QA grid** for each of the ~5 built clusters:
     - Article count (expect 6: TOFU/MOFU×2/BOFU×2/Recruiting per cluster pattern)
     - Image count (unique `featured_image_url` count, expect 6 unique per `get_cluster_image_health`)
     - Translation status: EN article count + ES article count via `cluster_completion_progress` and `blog_articles.language`
     - BOFU CTA URL extracted from the BOFU article's `detailed_content` (regex for `/contact|/book|/socorro|/strategies/`)
     - Cluster permalink for live review

4. **HARD STOP.** No further runs. I wait for your explicit approval before triggering `start_from=6` overnight batch.

## Execution sequence

```text
t+0      curl bulk-build-clusters (mode=live, limit=10) → batch_job_id
t+0      paste batch_job_id + initial classifications in chat
t+3min   poll #1: read_query cluster_batch_jobs row → progress ping
t+6min   poll #2: progress ping
t+...    continue every ~3min
t+~28min status='completed' → gather full report
t+~30min paste full report in chat → STOP
```

## Reporting format

When complete, I'll paste in chat:

```text
=== SMOKE TEST RESULT ===
Batch ID: <uuid>
Mode: live · Limit: 10 · Elapsed: XXm
Built: N · Skipped: M · Failed: K · Flagged: F

=== PER-CLUSTER QA ===
1. <topic>
   Cluster ID: <uuid>
   Articles: 6 · Images: 6/6 unique
   EN: 6/6 · ES: 6/6
   BOFU CTA: <url>
   Live: https://everencewealth.lovable.app/en/blog/<slug>
   Flagged: none
2. ...

=== FLAGGED ARTICLES (if any) ===
Article: <headline>
Pattern: <regex>
Excerpt: "...<matched text>..."
Status: draft

=== FULL results JSONB ===
[ ... complete dump ... ]

=== HOLDING FOR YOUR REVIEW ===
```

## Guardrails

- **No code changes.** Only edge-function invocation + read-only `read_query` polling.
- **No second batch fired.** Worker self-continuation stops naturally when `current_index >= entries.length`. I will NOT manually fire `start_from=6` until you say go.
- **Service-role key never surfaces.** Edge functions use `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` internally.
- **If a build fails or anything looks wrong mid-run**, I pause the batch (`UPDATE cluster_batch_jobs SET status='paused'`) via migration tool and report immediately rather than letting it churn.

## What I need from you

Approve this plan. On approval I switch to default mode, fire the curl, and start polling. First progress ping in chat within ~3 min of trigger.
