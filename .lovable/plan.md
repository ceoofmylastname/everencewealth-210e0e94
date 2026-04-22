
## Diagnose and verify the 6-article failure

### What happened
The cluster did not fail at the setup stage. It failed after partial generation.

- Cluster job: `738ff4bd-31f2-4b36-b2a0-6653a39a9d5c`
- Expected articles: 6
- Actually saved: 3
- Failure point: article 4
- Recorded backend error: worker shutdown mid-chunk during background processing

### Why you saw billing without all 6 articles
The content generation calls were already in progress, but the chunk worker stopped before the remaining article pipeline completed. That means some paid generation work occurred, but the chained background flow did not survive long enough to finish all 6 articles.

### What to do next
1. **Treat this failed cluster as a partial run**
   - Keep the 3 already-saved draft articles as evidence the content pipeline worked.
   - Do not use this job as the benchmark for current behavior.

2. **Ensure the chunk-runtime fix is the active deployed version**
   - Confirm the live `generate-cluster-chunk` function is running the version that wraps `processChunk(...)` in `EdgeRuntime.waitUntil(...)`.
   - If needed, redeploy that function so the runtime uses the fixed worker lifecycle.

3. **Run one fresh test cluster**
   - Use the same topic pattern.
   - Watch whether article 4 completes instead of dying after `claude:fetch:start`.

4. **Verify end state**
   - Expect 6 saved English draft articles.
   - Expect cluster status to end as `completed` or `partial`, but not fail at article 4.
   - Confirm image generation only triggers after all articles are done.

### If the problem happens again
Inspect the live function logs for:
- `generate-cluster`
- `generate-cluster-chunk`

Specifically look for:
- chunk acceptance (`202`)
- article 4 start
- any missing follow-up after `claude:fetch:start`
- worker shutdown / silent termination before next chunk fire

### Technical note
The repo already contains the correct structural fix in `supabase/functions/generate-cluster-chunk/index.ts`:
- background work moved into `processChunk(...)`
- request handler returns `202`
- `EdgeRuntime.waitUntil(work)` keeps the worker alive

So this is best understood as a failed run caused by the older runtime behavior, not by your input data.
