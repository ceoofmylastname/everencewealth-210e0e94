# Bulk Cluster CLI — Execution Plan (Option B)

## Workflow

1. **Secret intake**: I prompt for `SUPABASE_SERVICE_ROLE_KEY` via `add_secret`. You paste it once. Stored encrypted in project secrets, never echoed.
2. **Dry-run** (`--dry-run --limit=5`): Validates manifest, builds dedupe index from production (`cluster_themes` / `cluster_generations` topic + primary_keyword), classifies first 5 entries as build/skip. No edge calls, no DB writes. ~5 sec runtime. I paste full stdout in chat.
3. **STOP for your go/no-go on live smoke test.**
4. **Live smoke test** (`--limit=5`): Real `generate-cluster` invocations on first 5 buildable entries. ~25–30 min. Sequential, polls every 15s, 30-min timeout per cluster. Compliance scan runs post-generation on recruiting clusters. I paste `cluster-generation-report.json` contents back.
5. **HARD STOP** — you review 5 generated clusters in production:
   - Article bodies match prompts
   - Images render (Fal/Nano Banana)
   - Internal links resolve
   - BOFU CTA points to whitelisted money page
   - No compliance flags slipped through to `published`
6. **On your explicit "go for overnight"**: Full 75-cluster batch (`--start-from=6` to skip the smoke-tested ones). ~6–7 hours. I report progress every ~10 clusters with elapsed time + any failures + flagged-article counts.
7. **Final report**: Paste complete `cluster-generation-report.json` when done.
8. **Key rotation**: You rotate the service-role key in the dashboard. My stored copy becomes a dead string.

## Guardrails I will respect

- **Never proceed past step 4 without your approval** — the smoke-test review gate is non-negotiable.
- **Never expose the service-role key** in chat, logs, or report artifacts.
- **Never re-run a successful cluster** — the CLI's dedupe index queries production each invocation, so already-built smoke-test clusters auto-skip on the overnight run even without `--start-from`.
- **No code changes during execution** — this run uses only the existing `scripts/bulkBuildClusters.ts` and `manifests/everencewealth-75-cluster-manifest.json`.

## What I'll surface at each checkpoint

| Step | Output |
|---|---|
| 2 (dry-run) | Full stdout, validation status, dedupe sizes (themes/topics/kws), 5 build/skip lines with reasons |
| 4 (smoke) | `cluster-generation-report.json` contents, per-cluster duration, flagged-article rows |
| 6 (progress pings) | `Built N/65 · Skipped M · Failed K · Flagged F · Elapsed Hh Mm` |
| 7 (final) | Complete report.json + flagged_articles summary + cluster_themes net-new count |

## Risks I'm watching for

- **Edge function timeout** on a single cluster (>30 min). CLI marks failed and moves to next. I'll surface in progress reports.
- **Service-role rate limits** on long polling (15s × ~150 polls/cluster × 65 clusters ≈ 10k requests). Well under PostgREST limits but worth monitoring.
- **Image generation Fal/Nano Banana queue depth** during 6.5hr run. If queue stalls, articles publish without images and surface in the post-run audit.
- **Compliance regex false positives** on recruiting articles (e.g., "$0 signing bonus" matches `INCOME_PATTERNS`). These get flagged + drafted, not lost — you triage in `/admin/compliance-review` after.

## What I need from you to start

Approve this plan. On approval I'll switch to build mode and immediately fire the `add_secret` prompt for `SUPABASE_SERVICE_ROLE_KEY`. Do **not** paste the key in chat — wait for the secret prompt.
