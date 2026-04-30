## Cluster 51 v4 — Three-Diff Package

### Forensics (deliverable 1) — corrected

v4 generation `94707123-9359-4ad6-b2ec-552c6876a790` failed at the 35-min worker watchdog. Confirmed against database:

- **Cluster 51 actual theme:** "Becoming an Insurance Broker — Career Overview" (`primary_keyword='how to become insurance broker'`, `target_audience='Career Changer'`). **Not Roth Conversions.** The Roth articles visible in the dashboard screenshot belong to a different cluster — the dashboard view scope was misleading. Claude was generating the correct topic.
- **Failure mode:** All 3 EN article attempts failed with identical parser error: `Failed to parse content JSON: Could not extract valid JSON from response. First 300 chars: ` ```json {...` ``. Each article exhausted its 3 retries.
- **Stop reason:** Cannot be read — the parser threw before we ever inspected `stop_reason`. The diagnostic data Diff 1 was supposed to surface is structurally unreachable with buffered POST.
- **Bug 4 confirmed live:** `cluster_batch_jobs.status='completed'` with `build_count=0, fail_count=1`. Dashboard reports success on a fully-failed run.
- **`cluster_completion_progress` clean:** `articles_completed=0, status='not_started'` — the hard-reset migration worked correctly. There are no v4 orphans to clean up.
- **No `cluster_id` column on `cluster_generations`:** the orchestrator joins through `cluster_batch_jobs.results[].job_id` instead. Bug 3 mis-keying audit deferred — irrelevant since 0 articles were created.

The parser snippet (` ```json { "detailed_content": "<div class='article-content'>... `) shows Claude's response opens with a markdown fence followed by valid JSON. The extractor at `generate-cluster-chunk/index.ts:6-56` handles closed fences and unclosed-leading-fence cases, but the responses are still failing all 5 strategies. Either the response is being truncated mid-string at a point that breaks the fallback brace-slice (likely — 12k tokens × 3 articles in one chunk × Sonnet's verbose HTML ≈ ceiling), or there is a content character (unescaped quote/newline inside `detailed_content`) that defeats `JSON.parse`. Buffered fetch cannot tell us which without SSE visibility.

### Diff 1 — SSE streaming for Claude (the real fix)

Convert the Claude call in `generate-cluster-chunk/index.ts` from buffered POST to Server-Sent Events.

- Set request body `stream: true`. Anthropic returns `event: content_block_delta` chunks with `delta.text` increments and a terminal `event: message_stop` with `stop_reason`.
- Consume the stream with `ReadableStreamDefaultReader`, accumulating `delta.text` into a buffer.
- After each delta, write a heartbeat to `cluster_generations.progress` with `{chars_received, last_delta_at, stop_reason: null}` so the UI shows real progress instead of an 8-minute black box.
- On `message_stop`, capture `stop_reason` (`end_turn`, `max_tokens`, `stop_sequence`, `tool_use`) and persist to `progress.stop_reason`. This is the diagnostic data we have been unable to read for three test cycles.
- Run the same `extractJsonFromResponse` parser on the accumulated buffer. If `stop_reason='max_tokens'`, the parser will see truncated JSON — log explicitly that truncation occurred so we stop blaming the parser.
- Replace the single 8-minute `AbortController` with an inactivity-based timeout (60s with no delta = abort). A streaming response that keeps emitting tokens never trips it; a stalled response dies fast.

This gives us three things we have never had: real-time progress, a confirmed `stop_reason`, and the ability to distinguish "Claude truncated" from "parser broke."

### Diff 2 — Atomic cluster completion gate

New SQL function and table column, wired into the orchestrator.

```sql
ALTER TABLE cluster_completion_progress
  ADD COLUMN missing_components jsonb DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION verify_cluster_complete(_cluster_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  en_blogs int; es_blogs int; en_qas int; es_qas int;
  orphan_en_blogs int; orphan_en_qas int;
  blogs_without_citations int;
  result jsonb;
BEGIN
  SELECT count(*) FILTER (WHERE language='en' AND status='published'),
         count(*) FILTER (WHERE language='es' AND status='published')
    INTO en_blogs, es_blogs
    FROM blog_articles WHERE cluster_id = _cluster_id;

  SELECT count(*) FILTER (WHERE language='en' AND status='published'),
         count(*) FILTER (WHERE language='es' AND status='published')
    INTO en_qas, es_qas
    FROM qa_pages WHERE cluster_id = _cluster_id;

  SELECT count(*) INTO orphan_en_blogs FROM blog_articles en
    WHERE en.cluster_id=_cluster_id AND en.language='en'
      AND NOT EXISTS (SELECT 1 FROM blog_articles es
        WHERE es.hreflang_group_id=en.hreflang_group_id AND es.language='es');

  SELECT count(*) INTO orphan_en_qas FROM qa_pages en
    WHERE en.cluster_id=_cluster_id AND en.language='en'
      AND NOT EXISTS (SELECT 1 FROM qa_pages es
        WHERE es.hreflang_group_id=en.hreflang_group_id AND es.language='es');

  SELECT count(*) INTO blogs_without_citations FROM blog_articles
    WHERE cluster_id=_cluster_id
      AND (external_citations IS NULL OR jsonb_array_length(external_citations) < 1);

  result := jsonb_build_object(
    'passed', (en_blogs=6 AND es_blogs=6 AND en_qas=24 AND es_qas=24
               AND orphan_en_blogs=0 AND orphan_en_qas=0 AND blogs_without_citations=0),
    'en_blogs', en_blogs, 'es_blogs', es_blogs,
    'en_qas', en_qas, 'es_qas', es_qas,
    'orphan_en_blogs', orphan_en_blogs, 'orphan_en_qas', orphan_en_qas,
    'blogs_without_citations', blogs_without_citations
  );
  RETURN result;
END $$;
```

Wiring:

- In `build-cluster-step` cluster-finalization branch: call `verify_cluster_complete(cluster_id)`. If `passed=true` → `status='completed'`. Otherwise → `status='flagged'`, write the result to `missing_components`, and emit a `results[]` entry with the gap detail.
- Orchestrator's per-entry advance: when an entry finishes, only increment `current_index` if the gate passed OR the entry exhausted its retry budget (preventing infinite loops). Flagged clusters surface in the batch results without poisoning the next entry.
- Tighten Bug 4: in the same `completed_batch` branch, compute terminal status from the entries:
  - all entries `passed` → `'completed'`
  - some passed → `'halted_partial'`
  - none passed → `'failed'`
  - never `'completed'` when `build_count=0`

### Diff 3 — Forensics-grade observability + Bug 3 deferred-fix prep

Small additions that pay back the next time something breaks.

- In `generate-cluster-chunk`, log the resolved prompt context at chunk start: `cluster_id`, `topic`, `primary_keyword`, `target_audience`, `language`, `chunk_index/total`. One line, structured, so we can confirm prompt-routing in logs without DB joins.
- On parser failure, persist the **full** Claude response (not just first 300 chars) to a new `cluster_generation_failures` table keyed by `(generation_id, article_index, attempt)`. Today the truncated 300-char snippet is all we have; the full payload tells us if it was truncation or escape-character corruption.
- Add a `cluster_id` column to `cluster_generations` (currently missing — confirmed via `information_schema`). Backfill via the orchestrator's `current_job_id`/`results[].job_id` mapping. This unblocks Bug 3's eventual fix and lets the dashboard query progress without joining through `cluster_batch_jobs.results`.

### Order of operations on approval

1. Ship Diff 3's logging additions first (smallest, lowest risk, immediately useful for the v5 retest).
2. Ship Diff 2's migration + verifier wiring (database-only change, doesn't affect generation).
3. Ship Diff 1's SSE streaming refactor (largest behavior change).
4. Hard-reset Cluster 51 once more (`cluster_completion_progress` is already clean, only the `cluster_batch_jobs` row needs status fixed).
5. Trigger v5. Two-strike rule fully spent on v4 — if v5 fails, we stop and review root cause before any further code changes.

### Holds

- No 25-cluster batch under any state until you say "go live."
- v5 is a single-cluster retest. Verification package on terminal state will include the `stop_reason` audit (now actually readable) and the `verify_cluster_complete` JSON for Cluster 51.
- Bug 3 mis-keying full repair stays deferred — Diff 3 only adds the column and backfill, not the codebase sweep.
