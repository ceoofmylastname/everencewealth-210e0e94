

## Stabilize cluster generation: fix build + clear stuck jobs

Three independent problems to address in one pass.

### Problem 1 — Build is broken (blocks the kill button from shipping)

TypeScript errors in files unrelated to the Option C patch:
- **Recharts components** (`Pie`, `Tooltip`, `XAxis`, `YAxis`, `Bar`, `YouTube`) failing as JSX — points to a React 18 vs `@types/react` 19 mismatch, OR Recharts upgraded to a version with incompatible types.
- **Zod schemas** (`AuthorDialog`, `ApartmentsLeadFormModal`, `AddAgentModal`, etc.) failing with `Type 'ZodObject' is missing properties _zod, def, type, toJSONSchema` — this is the **Zod v4 type signature**. The project is on Zod v3 schemas but `@hookform/resolvers` or `zod` itself bumped to v4.
- **`chart.tsx`** — internal Recharts `Tooltip` typing broken.

**Fix:** Pin `zod` to `^3.23.0` and `@types/react` to `^18.3.0` in `package.json`. If Recharts is the culprit, pin `recharts` to `^2.15.0`. Run install, rebuild, confirm dev server stays up.

### Problem 2 — Verify the new heartbeat/timeout actually works on job `e7f8100a`

Wait 60s, then re-query `cluster_generations` for `e7f8100a`:
- If `last_heartbeat` advanced past `claude:fetch:start` → working as designed, just slow Sonnet.
- If still stuck on `claude:fetch:start` after 120s → the `AbortSignal.timeout(120_000)` should have fired. Check logs for `claude_timeout` warning and attempt 2/3.
- If neither happened → the timeout wiring has a bug; investigate `_shared/claudeClient.ts` import in `generate-cluster-chunk`.

### Problem 3 — Clear the orphaned job `0744ca68`

It's been hung since 21:40 UTC (predates the patch, no heartbeats possible). Two options:
- **A.** Use the new "Kill stuck job" button in the UI once the build is fixed.
- **B.** Direct DB update now via migration: `UPDATE cluster_generations SET status='failed', error='killed_pre_patch', timeout_at=now() WHERE id='0744ca68-b23a-4a35-bedf-69d7d4747489'`.

Recommend **B** so we don't depend on the broken build.

### Execution order
1. Pin `zod` (and `@types/react` / `recharts` if needed) — restore build.
2. Migration to mark `0744ca68` as failed.
3. Wait 90s, re-check `e7f8100a` heartbeat progression and report findings.
4. If `e7f8100a` also hangs past 120s without a `claude_timeout` log, file a follow-up to debug the abort wiring.

### Files touched
- `package.json` (version pins)
- One DB migration (mark `0744ca68` failed)
- No edge function or frontend code changes

### Out of scope
- No changes to the heartbeat/kill-button code from the prior patch — it's correct, just blocked by the unrelated build break.

