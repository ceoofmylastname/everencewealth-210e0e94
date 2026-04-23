
## Fix “Generate Missing” so the admin UI shows real progress and only flags real stalls

### What’s actually broken
The generator is no longer the main problem — the admin UI is.

The backend logs show `generate-missing-articles` did save articles 5 and 6, set the cluster to `partial`, and triggered image regeneration. But the Articles tab still uses a very shallow progress check:

- it treats “no new article count after ~48s” as “no progress detected”
- it only invalidates the per-cluster article query, not the parent cluster/job queries that drive the visible `4/6` warning and button state
- it does not display the backend `progress.message`, `last_heartbeat`, or `updated_at`
- the edge function still has several silent early-return paths that stop without writing `last_error`

So users can see “Generate Missing not working” even when the worker is actively running or already finished.

## Implementation plan

### 1. Make `generate-missing-articles` publish accurate job state
Update `supabase/functions/generate-missing-articles/index.ts` so the job row reflects active work from start to finish.

Changes:
- Set `cluster_generations.status = 'generating'` when missing-article generation starts.
- Keep the existing `updated_at` heartbeat behavior on every `updateProgress()` call.
- Add explicit `updateProgress(..., { in_progress: false, last_error, message })` before every current “silent return” path:
  - empty plan response
  - plan JSON parse failure
  - empty content response
  - content JSON parse failure
  - cluster/article read failures
- Keep the existing completion behavior:
  - `status = 'partial'` when 6/6 source articles exist
  - completion message = `Source articles complete. Ready for translation.`

Result:
- the UI can trust status + heartbeat
- real failures are visible instead of looking like a freeze

### 2. Replace count-only stall detection in the Articles tab
Update `src/components/admin/cluster-manager/ClusterArticlesTab.tsx` so “Generate Missing” watches real backend activity, not just article count.

Changes:
- Expand the local progress state to include:
  - `current`
  - `total`
  - `message`
  - `lastHeartbeat`
  - `jobUpdatedAt`
  - `status`
  - `lastError`
- Change polling to read both:
  - source-language article count from `blog_articles`
  - job state from `cluster_generations` (`status`, `progress`, `updated_at`, `error`)
- Reset the stall timer when **either** of these changes:
  - article count increases
  - `updated_at` advances
  - `progress.last_heartbeat` advances
  - `progress.message` changes
- Do not warn after 48s just because count is unchanged.
- Only show a “stalled” warning when the heartbeat itself is stale for a longer real threshold (for example 2–3 minutes), or when status/error explicitly indicates failure.
- If status becomes `partial` and source count is already 6, treat that as success immediately.

Result:
- long Claude/Kie steps won’t look broken
- users see ongoing work even while the count stays flat between saves

### 3. Refresh the actual queries that power the cluster card
The visible `4/6` warning comes from the parent cluster card, not the local per-tab query.

Update `src/components/admin/cluster-manager/ClusterArticlesTab.tsx` to invalidate:
- `["cluster-articles"]`
- `["cluster-jobs"]`
- `["cluster-articles", cluster.cluster_id]`

during polling and on completion/failure.

Why:
- `sourceInfo` is derived in `ClusterCard` from the parent `cluster` object built from the global `["cluster-articles"]` query
- right now the local tab can finish, but the header/warning/button can stay stale until a manual refresh

Result:
- the “Source language incomplete: 4/6” warning disappears as soon as the cluster is actually complete
- the “Generate Missing” button no longer lingers after completion

### 4. Surface real missing-article progress in the UI
Improve the Articles tab so users can see what the backend is doing.

In `src/components/admin/cluster-manager/ClusterArticlesTab.tsx`:
- add a compact progress panel near the Generate Missing button showing:
  - `Saved X/6 source articles`
  - current backend message
  - last activity timestamp / “Xs ago”
- update button copy from the current awkward formula to a direct format like:
  - `Generating 4/6...`
  - `Generating 5/6...`
- when a restart happens, show a neutral info state like:
  - `Resuming background generation...`

Result:
- users understand whether the system is planning, writing, saving, or completing
- “no progress detected” becomes rare and meaningful

### 5. Keep cluster-level status badges honest
Because the cluster card already displays `job_status`, make missing-article generation update that badge correctly.

Changes:
- while generating missing articles: show `Generating`
- when source completion reaches 6/6: return to `Partial`
- if a hard error occurs: show `Failed`

This uses the existing badge UI in `src/components/admin/cluster-manager/ClusterCard.tsx` without redesigning the card.

## Files to change
- `supabase/functions/generate-missing-articles/index.ts`
- `src/components/admin/cluster-manager/ClusterArticlesTab.tsx`
- `src/components/admin/cluster-manager/ClusterCard.tsx` (only if minor status/progress display wiring is needed)

## Verification
After implementation:

1. Start “Generate Missing” on a 4/6 cluster.
2. The card badge changes to `Generating`.
3. The Articles tab shows live backend progress text and heartbeat.
4. If no article is saved for a while but heartbeat/message keeps changing, no false stall warning appears.
5. When the 6th source article is saved:
   - source warning clears
   - Generate Missing button disappears
   - cluster job status becomes `Partial`
   - translation becomes available
6. If the worker truly fails, the tab shows the actual `last_error` instead of generic “no progress detected”.

## Out of scope
- No schema changes
- No prompt/model changes
- No translation flow rewrite
- No new backend tables or cron jobs
