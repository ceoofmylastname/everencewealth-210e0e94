

## Why article generation stalled at 4/6 and how to fix it

### What's happening
Cluster `3de11630-ac9e-4c05-b85f-d07c555412ba` has **4 of 6** English articles. The `generate-missing-articles` edge function ran twice in the last hour, generated the plan for article 5 (MOFU), then silently stopped before saving — no "Article saved" log, no error, no self-continue. The progress JSON still says "Generating article 5/6 (MOFU)..." and the chain is broken.

### Root causes

**1. Self-continue is fire-and-forget but the previous invocation already returned 202.**
When the Claude content call takes 60–90 seconds, the parent function ends, `EdgeRuntime.waitUntil` is supposed to keep it alive, but in practice the chain is dying mid-content-generation without surfacing an error. The recent logs cut off right after "Plan: Roth Conversion Ladders…" with no content API attempt visible.

**2. There is no recovery mechanism.**
Nothing in the system detects "progress.in_progress=true but no heartbeat for 5+ minutes" and re-kicks the function. The existing `check_stuck_cluster_jobs()` cron only fires after 20 min and only when `cluster_generations.status='generating' AND updated_at < NOW() - 20m`. But this function never updates `updated_at` on `cluster_generations` — only the `progress` JSON. So the sweeper never sees this job as stuck.

**3. Same hardcoded Unsplash bug as `complete-cluster`.**
Line 510: `featured_image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?...'` and there is **no post-loop trigger for `regenerate-cluster-images`**. Even if articles 5 and 6 generate, they will show the same generic house photo we just removed from `complete-cluster`.

### Fix

Apply three changes to `supabase/functions/generate-missing-articles/index.ts`:

**A. Stop using the hardcoded Unsplash placeholder.** Change line 510–511 to:
```ts
article.featured_image_url = null;
article.featured_image_alt = `${plan.headline} - Everence Wealth`;
```

**B. After the article is saved AND the cluster reaches 6/6, fire `regenerate-cluster-images` (same pattern we just added to `complete-cluster`).** Right before the `return` inside the `if (completeNow) { ... }` block at line ~611, add a fire-and-forget call to `regenerate-cluster-images` so all 6 articles get unique Kie.ai content-aware images.

**C. Bump `cluster_generations.updated_at` on every progress write so the 20-min stuck-job sweeper can recover failures.** In `updateProgress()` (line 91–112), include `updated_at: new Date().toISOString()` in the update payload. This makes `check_stuck_cluster_jobs()` automatically reset abandoned jobs after 20 min instead of leaving them frozen forever.

### Recover the current stuck cluster
After deploying the patched function, manually invoke `generate-missing-articles` once for cluster `3de11630-ac9e-4c05-b85f-d07c555412ba`. The function is idempotent — it will read state, see articles 1–4 exist, generate article 5 (MOFU), save it, and self-chain to article 6 (BOFU). When the count hits 6, it will fire `regenerate-cluster-images` to replace the Unsplash placeholder on article 4 (the one already saved with the bad URL) plus generate proper images for the new 5 and 6.

### Verification checklist
- `blog_articles` count for cluster `3de11630…` = 6 in `en`
- All 6 articles have `featured_image_url LIKE '%supabase.co/storage%'` (Kie AI generated)
- `cluster_generations.status` = `partial` (ready for translation)
- `progress.message` = "Source articles complete. Ready for translation."

### Files to change
- `supabase/functions/generate-missing-articles/index.ts` — three patches (placeholder, post-completion image trigger, heartbeat on `updated_at`)

### Out of scope
- No DB schema changes
- No prompt or model changes
- No UI changes
- The `complete-cluster` function (already fixed in the previous task) is unaffected
- The 6 articles in the already-completed cluster `738ff4bd…` are unaffected

