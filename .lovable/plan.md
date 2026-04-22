
## Fix the new cluster-completion failure

### What’s actually failing
This is a different failure path than the earlier 6-article generation bug.

The current break is in `generate-missing-articles`:

- The function generates and saves **one missing article per request**
- It does that work **synchronously over a long-lived HTTP connection**
- Your logs show the article was successfully saved, then the function hit:

```text
Http: connection closed before message completed
```

That means:
1. Claude/content generation already ran
2. The article insert already happened
3. The browser/function client lost the response before it finished
4. The frontend treated that as a hard failure and stopped
5. The next missing article was never triggered

So you get charged, sometimes get a saved article, but the cluster still stalls short of 6/6.

### Evidence from the current logs
`generate-missing-articles` logs show:

- Missing slots: `[5, 6]`
- It generated article 5
- It saved article `27545dd0-a08c-4da6-9159-7df9be493682`
- Final source-language count became `5`
- Immediately after: `Http: connection closed before message completed`

That is the signature of a **completed write + failed HTTP response**, not a bad prompt or bad insert.

---

## Implementation plan

### 1. Refactor `generate-missing-articles` to background execution
**File:** `supabase/functions/generate-missing-articles/index.ts`

Convert it to the same pattern already used successfully in `generate-cluster-chunk`:

- Move the real article-generation logic into a background worker function
- Return `202 Accepted` immediately from the HTTP entrypoint
- Wrap the work in `EdgeRuntime.waitUntil(...)`

This prevents the worker from being torn down just because the client connection closes.

### 2. Let the function self-continue until the cluster reaches 6 source articles
Still in `generate-missing-articles/index.ts`:

After saving one article:

- re-count current source-language articles
- if count is still `< 6`, trigger `generate-missing-articles` again internally using service auth
- if count reaches `6`, mark the cluster source side complete and stop chaining

This removes the fragile dependency on the browser having to successfully wait for, parse, and then re-trigger article 6.

### 3. Make the function idempotent and duplicate-safe
Add defensive checks in `generate-missing-articles/index.ts` so retries or overlapping triggers do not create duplicates:

- re-read used `cluster_number` values before insert
- only fill the next open slot
- before insert, check whether that exact `cluster_number` already exists for the cluster/language
- if it exists, skip insert and continue to the next missing slot

This ensures background retries cannot over-generate.

### 4. Persist useful progress into `cluster_generations.progress`
Update the job record throughout the missing-article flow with fields like:

- `current_article`
- `saved_articles`
- `message`
- `last_heartbeat`
- `source_complete`

This lets the admin UI reflect the real backend state even if the original browser request was interrupted.

### 5. Make the frontend treat connection drops as “check state first,” not “fail immediately”
**File:** `src/components/admin/cluster-manager/ClusterArticlesTab.tsx`

Update `handleGenerateMissing` so that if `supabase.functions.invoke('generate-missing-articles')` throws a fetch/connection interruption:

- do **not** assume generation failed
- wait briefly
- refetch cluster articles
- recompute missing count from the database
- if progress was made, continue polling / triggering until source count reaches 6
- only show a true error when the DB count does not advance and the job status/progress indicates failure

This matches the actual backend behavior and avoids abandoning the process after a response-level disconnect.

### 6. Add a lightweight “in progress” state for missing article completion
In the same UI area:

- show “Completing source articles in background...”
- derive progress from actual article count (`4/6`, `5/6`, `6/6`)
- keep the button disabled while background completion is active
- auto-refresh after each attempt / interruption

This makes the flow resilient instead of brittle.

### 7. Clean up the currently stuck cluster state
After the code fix, run a one-time backend cleanup for the affected cluster:

- verify current English article count
- if it is 5/6, trigger the repaired missing-article flow once
- if the cluster status/progress is stale, update it to reflect the real source count before resuming

This finishes the user’s current cluster instead of requiring a brand-new one.

---

## Expected outcome after the patch

When you click **Generate Missing (2)** or **Generate Missing (1)**:

- the request will return immediately
- the backend will keep running even if the browser response closes
- article 5 and article 6 will continue automatically in the backend
- the UI will refresh based on real DB count
- the cluster will end at **6/6 source articles**
- translation can proceed normally

---

## Files to change
- `supabase/functions/generate-missing-articles/index.ts`
- `src/components/admin/cluster-manager/ClusterArticlesTab.tsx`

### Optional verification target
- current affected cluster: `738ff4bd-31f2-4b36-b2a0-6653a39a9d5c`

---

## Technical notes
- Root cause is **HTTP lifecycle / client disconnect handling**, not prompt quality
- The log line `Http: connection closed before message completed` happened **after** the article save
- `generate-missing-articles` currently lacks the robust background pattern already present in `generate-cluster-chunk`
- The safest fix is:
  1. background execution with `EdgeRuntime.waitUntil`
  2. backend self-continuation
  3. frontend recovery on interrupted responses
