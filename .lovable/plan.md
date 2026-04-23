

## Why the translation failed and how to fix it

### What's happening
Cluster `3de11630-ac9e-4c05-b85f-d07c555412ba` has 6 English + 3 Spanish articles. The translate-cluster function processed articles 1, 2 and 3 then the function instance shut down mid-run and never wrote a `partial` status. The job row is still pinned at `status='generating'` with `progress.message='Translating Spanish: article 3/6'` and `updated_at` over 6 minutes stale, so:

- The admin UI's polling loop sees `status='generating' + recent updated_at` (when it started) and just keeps polling instead of re-invoking
- After the user navigates away, nothing resumes the job
- The existing `check_stuck_cluster_jobs()` cron only marks stuck jobs as **failed** after 20 min — it never **resumes** them
- Result: "Translation fail" — articles 4, 5, 6 will never be created without manual intervention

### Root causes

**1. Silent shutdown without writing partial state.** When the Deno isolate is recycled mid-loop (between articles), neither the `MAX_RUNTIME` early-exit nor the `try/catch` fires, so `cluster_generations` is left in `generating` with no heartbeat update. The 50s `MAX_RUNTIME` check only runs at the top of each iteration — if Claude takes 35s and the runtime sweeper kills the function 5s later, no partial flush happens.

**2. No auto-resume mechanism.** Translation jobs have no equivalent of `auto-resume-qa-jobs`. They rely 100% on the admin keeping the browser tab open and the UI loop re-invoking. The moment the tab closes or the loop times out at 30 min, the job is dead.

**3. UI polling treats stale `generating` as "still running".** `STUCK_THRESHOLD_MS = 2 minutes`, but the job is older than that and the UI was no longer running when the staleness crossed the threshold. There's no server-side recovery.

### The fix

**A. Patch `supabase/functions/translate-cluster/index.ts`** to make stalls recoverable:
- At the very start of the handler (after fetching the job), if `status='generating'` AND `updated_at` is older than 3 minutes, treat it as a recoverable stall: log it, reset `status='partial'`, and proceed. Today the code refuses to start because another instance "owns" it.
- Add a final `try/finally` around the article loop so that ANY exit path (including thrown errors and unexpected returns) flushes a `partial` status with current progress and a fresh `updated_at` heartbeat. This guarantees the job never gets stuck in `generating`.
- Bump `updated_at` more aggressively: write a heartbeat right before each Claude call, not only after a successful save. This way the 3-min staleness check is reliable.

**B. Create a new edge function `auto-resume-translation-jobs`** mirroring the existing `auto-resume-qa-jobs` pattern:
- Query `cluster_generations` for rows where `status IN ('generating','partial')` AND `updated_at < NOW() - INTERVAL '5 minutes'` AND the article count for the current language is below `expectedCount`.
- For each stalled job, invoke `translate-cluster` with `{ jobId }` (fire-and-forget).
- Schedule it via `pg_cron` to run every 2 minutes.

**C. Recover the current stuck cluster.** After deploying the patches, manually invoke `translate-cluster` once for `3de11630-ac9e-4c05-b85f-d07c555412ba`. The function is idempotent (skips already-translated articles by `cluster_number`), so it will resume at article 4 and continue through 5 and 6, then mark Spanish complete.

### Files to change
- `supabase/functions/translate-cluster/index.ts` — stall detection at entry, try/finally heartbeat flush, pre-Claude heartbeat write
- `supabase/functions/auto-resume-translation-jobs/index.ts` — new function (mirror of `auto-resume-qa-jobs`)
- New migration: `pg_cron` job invoking `auto-resume-translation-jobs` every 2 minutes

### Verification
- Cluster `3de11630…` reaches 6/6 Spanish articles; `cluster_generations.status='completed'`
- Killing a translate-cluster invocation mid-loop leaves `status='partial'` (never `generating`) within 3 min
- New cron logs show `[AutoResumeTranslate] Resuming N stalled jobs` when relevant; otherwise `No stalled jobs`

### Out of scope
- No prompt changes, no model changes, no translation logic changes
- No UI changes (the existing polling loop already handles `partial` correctly; once auto-resume runs server-side, the user no longer needs to keep the tab open)
- No schema changes to `cluster_generations` or `blog_articles`

