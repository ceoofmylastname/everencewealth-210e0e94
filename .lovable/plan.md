## You're right — service-role secret intake was the wrong ask

Quick reality check on what I actually have:

- **Migration tool**: yes, I have it. That's how `flagged_articles` got created. It runs DDL through Lovable's managed channel, not via a key I hold.
- **`supabase--read_query`**: yes. Read-only SQL, also through a managed channel.
- **Sandbox shell env vars**: I do **not** auto-inherit `SUPABASE_SERVICE_ROLE_KEY`. The `compgen -e` list in my sandbox shows `VITE_*` and a few build-system vars, not the service-role key.
- **Edge functions**: every deployed function gets `SUPABASE_SERVICE_ROLE_KEY` injected by the platform at runtime (you can see this pattern in `generate-cluster-qas/index.ts` line ~36). No secret prompt needed.

So **Path B is strictly cleaner**: the key never leaves the runtime, no manual paste, and the existing orchestrator pattern (`generate-cluster-qas` → `generate-article-qas` self-chain) already proves the architecture works for long-running batch jobs inside the platform.

## Plan

### Refactor `scripts/bulkBuildClusters.ts` into an edge-function batch orchestrator

Same logic, three functions instead of one CLI:

```text
admin button / curl
        │
        ▼
┌─────────────────────────────┐
│ bulk-build-clusters         │  ← orchestrator (returns immediately)
│  - parse manifest           │
│  - build dedupe index       │
│  - classify build/skip      │
│  - create batch job row     │
│  - fire first cluster       │
└──────────┬──────────────────┘
           │ fire-and-forget
           ▼
┌─────────────────────────────┐
│ build-cluster-step          │  ← per-cluster worker
│  - invoke generate-cluster  │
│  - poll cluster_generations │
│  - run compliance scan      │
│  - flag draft if needed     │
│  - update batch job row     │
│  - fire NEXT cluster        │  ◄── self-continuation
└─────────────────────────────┘
```

Self-continuation = no single function ever runs longer than ~5 min (one cluster's poll loop), so timeouts don't apply. The chain runs unattended for ~6.5 hr.

### New table: `cluster_batch_jobs` (migration)

```text
id uuid pk
manifest_path text
mode text           -- 'dry_run' | 'live'
limit_count int
start_from int
status text         -- 'queued' | 'running' | 'paused' | 'completed' | 'failed'
total_entries int
build_count int
skip_count int
fail_count int
flagged_count int
current_index int
current_topic text
classifications jsonb   -- full build/skip list with reasons
results jsonb           -- per-cluster: {topic, status, duration_ms, flagged_terms}
started_at timestamptz
updated_at timestamptz
completed_at timestamptz
```

RLS: admin-only (uses existing `is_admin(auth.uid())`).

### New admin page: `/admin/bulk-cluster-batches`

- "Start Dry Run (limit 5)" → fires `bulk-build-clusters` with `mode=dry_run, limit=5`
- "Start Smoke Test (limit 5)" → `mode=live, limit=5`
- "Start Full Overnight Run" → `mode=live, start_from=6` (skips smoke-tested IDs)
- "Pause" / "Resume" buttons → flip `status` field; the worker checks before firing the next cluster
- Live progress: realtime subscription on `cluster_batch_jobs` row showing `current_index / total · build/skip/fail/flagged · elapsed time`
- Per-cluster results table populated from `results` jsonb as the run progresses
- Link to `/admin/compliance-review` for any flagged articles

### Existing CLI script

I'll keep `scripts/bulkBuildClusters.ts` in the repo (uncalled) as a backup execution path in case someone wants to run it from a workstation later. Won't touch it during this work.

## Execution sequence (matches your gates)

1. **I deploy** the migration + 2 edge functions + admin page. ~10 min of build work, no manifest runs yet.
2. **I trigger dry-run** via the admin page (`mode=dry_run, limit=5`). Edge function returns synchronously in ~5 sec since dry-run does no edge calls. I paste the full `classifications` JSON + dedupe index sizes in chat.
3. **HARD STOP for your go/no-go on smoke test.**
4. **On approval, I trigger smoke test** (`mode=live, limit=5`). I poll the `cluster_batch_jobs` row via `read_query` every ~5 min and report progress. Total ~25-30 min. When `status=completed` I paste the full `results` jsonb + flagged-article rows.
5. **HARD STOP — you review 5 generated clusters in production.** Article bodies, images, internal links, BOFU CTAs, no compliance leakage.
6. **On your explicit "go for overnight," I trigger** `mode=live, start_from=6` and walk away. Progress pings every ~10 clusters via `read_query` on the batch job row: `Built N/65 · Skipped M · Failed K · Flagged F · Elapsed Hh Mm`.
7. **Final report**: complete `results` jsonb, `flagged_articles` summary, net-new `cluster_themes` count.

## Guardrails

- **Pause is a real button.** If smoke test goes sideways or full run starts misbehaving, you flip `status='paused'` and the next cluster doesn't fire. In-flight cluster finishes naturally (~5 min).
- **Dedupe runs per-cluster**, not just at start. Each `build-cluster-step` invocation re-queries `cluster_themes` + `cluster_generations` before firing — so smoke-tested clusters auto-skip on the overnight run even without `start_from`.
- **No code changes between steps 4 and 6.** What you review in the smoke test is what runs overnight.
- **Compliance scan unchanged**: same `INCOME_PATTERNS` regex on recruiting articles, same auto-draft + `flagged_articles` insert.
- **Service-role key never surfaces** in chat, logs, the batch job row, or any artifact. The edge functions use `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` directly.

## Technical notes

- The `bulk-build-clusters` orchestrator does the manifest parse + dedupe classification synchronously (~5 sec for 75 entries against production), then for live mode fires `build-cluster-step` fire-and-forget with the batch job ID and index 0.
- `build-cluster-step` invokes the existing `generate-cluster` edge function with the entry's prompt payload, polls `cluster_generations` every 15s with a 30-min ceiling, runs the compliance regex on the resulting `blog_articles` rows for the cluster, inserts `flagged_articles` rows + flips status to `draft` for any matches, updates the batch job row, then checks the batch's `status` field. If `running`, it fires itself for index+1 with the next buildable entry. If `paused` or `completed`, it stops.
- Sequential by design — same as your CLI plan. No parallelism, no rate-limit risk on Fal/Nano Banana.

## What I need from you

Approve this plan. On approval I switch to build mode and ship the migration, two edge functions, and the admin page. Then I trigger the dry-run from the admin page and paste output. No secret prompt, no key handling.