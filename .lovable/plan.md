# Three Failures, One Consolidated Fix

## What's actually broken right now

Forensics on the live database confirmed three independent failures stacked on top of each other. The "no backend activity" symptom is the visible tip; underneath, three different code paths are silently dying.

### Bug 5 (NEW, blocking missing-articles backfill)
At 21:54Z, `generate-missing-articles` produced a high-quality 3,168-word Roth Conversions article, then Postgres rejected the INSERT:

```
new row violates check constraint "blog_articles_body_no_head_h1"
```

The constraint forbids `<head>` or `<h1>` tags inside `detailed_content`. Claude is emitting one of them, the function has no sanitizer, every attempt fails. Net articles saved this run: zero.

### Bug B confirmed (v4 cluster generation died exactly as predicted)
Cluster 51 v4 (`cluster_generations.id = 94707123`) terminal state:
- `status: failed`, `error: aborted: 35min worker timeout`
- All 3 EN article attempts failed with: `"Could not extract valid JSON from response. First 300 chars: ```json {...`
- The SSE streaming refactor (Diff 1) was scaffolded last turn but **never wired into the main `fetchClaudeWithTimeout` call site**. v4 ran on the old buffered parser and died the same way v3 did.

### Bug 6 (observability gap)
`cluster_generations.cluster_id` is `NULL` on the v4 row. The column was added by Diff 3 schema, but no code writes to it. Forensics joins remain impossible.

Two-strike rule is now in force. No more Option 1 retries on Cluster 51.

---

## The fix — one diff, three changes

### Change A: H1/head sanitizer in `generate-missing-articles`
Before insert, strip `<h1>...</h1>` and `<head>...</head>` blocks (or downgrade `<h1>` to `<h2>`, since the constraint also rejects `<h1 …>`). Add the same sanitizer to `generate-cluster-chunk` so the same crash can't reappear in cluster mode.

```ts
function sanitizeForBlogConstraint(html: string): string {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<h1\b[^>]*>/gi, '<h2>')
    .replace(/<\/h1>/gi, '</h2>');
}
```

Also: the article in question was 3,168 words vs the 2,500 cap. The function logged the warning but proceeded to insert anyway. Add a hard truncate or regenerate-with-shorter-prompt step.

### Change B: Wire SSE + cluster_id + recordGenerationFailure into the live path
Last turn's diff added `streamClaude()`, `recordGenerationFailure()`, and the `cluster_id` column but left them dormant. Wire them in:

1. Replace the buffered `fetchClaudeWithTimeout(...)` call (~line 519-579 of `generate-cluster-chunk/index.ts`) with `streamClaude()`.
2. On parse failure or timeout, call `recordGenerationFailure(generationId, clusterId, rawResponse, stopReason, promptContext)`.
3. At the top of the orchestrator's INSERT into `cluster_generations`, populate the new `cluster_id` column.
4. Tolerate ` ```json ` fences in the parser: strip leading ` ```json\n? ` and trailing ` ``` ` before `JSON.parse`. This alone would have saved v4.

### Change C: Activate the atomic completion gate
The `verify_cluster_complete(_cluster_id)` RPC and `missing_components` jsonb column already exist. Wire them into `build-cluster-step`:

- After each article insert, call `verify_cluster_complete()`.
- If it returns false, write the missing component list to `cluster_completion_progress.missing_components` and **do not advance `current_index`**.
- Only when it returns true (60-piece gate passes) does the cluster transition to `status='completed'`.
- Tighten the batch terminal logic so a batch can only mark `completed` when every member cluster passes the gate. (Closes Bug 4.)

### Change D (deferred — explicit non-goal this round)
Do **not** re-trigger Cluster 51 v5 in this round. Two-strike rule. Once A/B/C land and pass a single-cluster smoke test on a fresh cluster, then plan the streaming-escalation re-run as a separate approval.

---

## Files touched

- `supabase/functions/generate-missing-articles/index.ts` — add sanitizer + word-cap enforcement
- `supabase/functions/generate-cluster-chunk/index.ts` — wire `streamClaude`, fence-tolerant parser, sanitizer, `recordGenerationFailure` calls, populate `cluster_id` on insert
- `supabase/functions/build-cluster-step/index.ts` — call `verify_cluster_complete`, gate `current_index` advance, gate batch completion
- `Branded/log.md` — append v4 forensics + Bug 5/6 entries

No new migrations needed — schema from last turn already supports all of this.

---

## Smoke test before any production batch

After deploy:
1. Pick one fresh cluster (NOT 51), trigger single-cluster generation manually.
2. Watch `cluster_generations.progress.chars_received` heartbeat in real time.
3. On completion, query `verify_cluster_complete(<id>)` — must return true.
4. Query `cluster_completion_progress.missing_components` — must be `[]` or null.
5. Confirm `cluster_generations.cluster_id` is populated and joinable.

If any of those five fail, stop and escalate before touching Cluster 51.
