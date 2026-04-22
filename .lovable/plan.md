

## Ship Option C — Claude timeout + heartbeats + kill button

Fast patch to make Claude hangs visible and recoverable. Hung job `0744ca68` is left alone per instructions.

### Changes

**1. `supabase/functions/_shared/claudeClient.ts`** — add timeout to `callClaude`
- Add optional `timeoutMs?: number` to `CallClaudeOptions` (default `120_000`)
- Wrap `fetch(ANTHROPIC_URL, ...)` with `signal: AbortSignal.timeout(timeoutMs)`
- On `AbortError`, throw `new Error("claude_timeout")` so callers can pattern-match
- ~5 lines

**2. `supabase/functions/generate-cluster-chunk/index.ts`** — heartbeats + progress writes + final failure tagging

Inside the per-article generation loop (article index `n`, attempt `m`):

```ts
async function heartbeat(jobId, msg) {
  console.log(`[heartbeat] ${msg}`);
  await supabase.from('cluster_generations')
    .update({ progress: { last_heartbeat: msg, ts: new Date().toISOString() }, updated_at: new Date().toISOString() })
    .eq('id', jobId);
}
```

Emit at exactly the requested points:
- `claude:fetch:start article=${n} attempt=${m}` — before `callClaude`
- `claude:fetch:response article=${n} attempt=${m} status=ok|error` — after
- `claude:parse:start article=${n}` — before `extractJsonFromResponse`
- `claude:db:save:start article=${n}` — before `blog_articles` insert
- `claude:db:save:complete article=${n} ms=${elapsed}` — after

Pass `timeoutMs: 120_000` to `callClaude`.

Catch logic inside the attempt loop:
```ts
catch (err) {
  if (err.message === 'claude_timeout') {
    console.warn(`[chunk] claude_timeout article=${n} attempt=${m}/3`);
    if (m === 3) {
      await supabase.from('cluster_generations').update({
        status: 'failed',
        error_message: 'claude_timeout',
        progress: { last_heartbeat: `claude_timeout article=${n} attempt=3/3`, ts: new Date().toISOString() }
      }).eq('id', jobId);
      return;
    }
    continue; // retry
  }
  throw err;
}
```

~15 lines net.

**3. New edge function `supabase/functions/kill-cluster-job/index.ts`** — admin-only abort

```ts
// POST { jobId: string }
// Validates JWT + is_admin (jrmenterprisegroup@gmail.com)
// UPDATE cluster_generations SET status='failed', error_message='killed_by_user',
//        timeout_at=now(), updated_at=now() WHERE id=jobId AND status IN ('pending','processing')
```
~30 lines including CORS/auth.

**4. Frontend — kill button in cluster generation dialog**

Locate the existing progress dialog (referenced at `/admin/clusters`) and:
- Display `progress.last_heartbeat` if present: *"Last activity: claude:fetch:start article=3 attempt=2"*
- Add a red "Kill stuck job" button (only visible when `status='processing'` and `updated_at > 60s ago`)
- Calls `supabase.functions.invoke('kill-cluster-job', { body: { jobId } })`
- On success: toast "Job killed" + refetch
- ~25 lines in one component file

### Out of scope (intentionally)
- No refactor of the orchestrator (`generate-cluster`)
- No retroactive fix for job `0744ca68` — let existing retry/watchdog handle it
- No changes to `regenerate-article`, `regenerate-section` — same pattern can be applied later if needed (the timeout in `claudeClient.ts` already protects them once they pass `timeoutMs`, but they don't need heartbeats)

### Files touched
- **Edited:** `supabase/functions/_shared/claudeClient.ts`, `supabase/functions/generate-cluster-chunk/index.ts`, frontend cluster dialog component (TBD via grep)
- **New:** `supabase/functions/kill-cluster-job/index.ts`

### Verification after deploy
1. Tail `generate-cluster-chunk` logs on next run — confirm heartbeats appear at all 5 checkpoints
2. Confirm `cluster_generations.progress.last_heartbeat` updates in DB
3. Confirm dialog shows live status text
4. Manually kill a test job via the button → confirm row flips to `failed`
5. If job `0744ca68` is still hung 5 min after deploy, user clicks kill button (no manual SQL needed)

