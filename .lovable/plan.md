## Root Cause Analysis — Batch f2fb9e87

Verified against code + DB. Both bugs are real, but Bug B's actual cause differs from the hypothesis.

### Batch outcome (ground truth)

| Status   | Clusters | Notes |
|----------|----------|-------|
| built    | 3        | Recruiting names, but only 2 articles each, all wealth-flavored |
| flagged  | 11       | Compliance scan caught $-amount patterns; articles set to `draft` |
| timeout  | 11       | Hit the 20-min worker timeout; most have 0 articles |
| **Q&A jobs created** | **0 of 25** | `qa_generation_jobs` is empty for every cluster |

So 21 "flagged-as-draft" articles = the 11 flagged clusters' worth of articles whose status was demoted by the compliance scanner in `build-cluster-step` (lines 358–390). They were never recruiting articles to begin with.

---

### Bug A — Recruiting prompt is not actually a recruiting prompt

**Root cause:** `generate-cluster` has no recruiting branch at all.

Evidence:
- `build-cluster-step` carries `c.compliance_class === 'recruiting_no_income_claims'` (line 265, 358), but when it fires `generate-cluster` (lines 219–228) it only forwards `topic`, `language`, `targetAudience`, `primaryKeyword`. **`compliance_class` is never sent.**
- `generate-cluster/index.ts`:
  - Hard-coded structure prompt (line 655): *"You are an expert SEO content strategist for an independent insurance and wealth management firm…"* — no recruiting variant.
  - Master article prompt is fetched once from `app_settings.master_content_prompt` (line 622–629). That single row is the wealth corpus prompt with Social Security / RMD / IUL / $1M-portfolio examples.
  - `rg compliance_class supabase/functions/generate-cluster*/` → 0 matches.
- Result: every recruiting cluster received the wealth master prompt verbatim. Claude obediently wrote about $1,800/month Social Security on a "Health Insurance License Path" topic. The compliance scanner then caught the dollar patterns and demoted those articles to draft — which is why the 21 "flagged" articles all read like wealth content.

The Branded/everencewealth-25-recruiting-clusters.md spec was used to seed the classifications (topic / primary_keyword / target_audience), but its constraints never reach Claude.

---

### Bug B — Orchestrator doesn't have a Q&A phase at all (not a timeout)

**Root cause hypothesis was wrong.** The 150-sec edge timeout is irrelevant, and `tick-cluster-batches` is not "advancing past Q&A." The Q&A phase simply does not exist in the batch pipeline.

Evidence:
- `rg "generate-cluster-qas|generate-article-qas" supabase/functions/{build-cluster-step,generate-cluster,bulk-build-clusters,tick-cluster-batches}/` → 0 matches.
- `build-cluster-step` completion gate (lines 339–342) is purely:
  ```
  cluster_generations.status === 'completed'
  AND (en + es present, or single-lang)
  ```
  When that flips true, it scans for compliance, writes the result row, increments `current_index`, and moves on. No Q&A trigger anywhere.
- DB confirms: for all 25 clusters, `qa_generation_jobs` count = 0. `qa_pages` count = 0. `qa_generation_errors` is empty because nothing ever ran to fail.
- `generate-cluster-qas` (the orchestrator that creates `qa_generation_jobs` and chains `generate-article-qas`) is invoked manually from the admin UI / `batch-complete-clusters` — never from `build-cluster-step`.
- Side effect: the `articles_completed` counter in the dashboard reflects English+ES blog rows only, which is why the 11 "completed" clusters show 0–6 articles (most lost half their articles to the compliance demotion to `draft`).

Secondary observation on the 11 timeouts: 8 of them have `blog_count = 0` and `completed_languages = []`, and `cluster_generations.status='failed'` was set by the WORKER_TIMEOUT_MIN (20 min) path. `generate-cluster` itself is dying or stalling on those topics before producing any English article — likely Claude refusal/loop on the "no income claims" topics being fed the wealth prompt. Same root cause as Bug A.

---

### Why this happened together

Bug A is the upstream defect. Because the wealth prompt was used:
1. Topics like "Insurance Exam Preparation Strategies" caused Claude to either (a) generate off-topic wealth content (flagged → draft) or (b) refuse / loop / produce malformed JSON until the 20-min worker timeout fired (the 11 timeouts).
2. Even on clusters that "succeeded," the missing Q&A phase meant zero Q&A pages — but that would have been true for wealth clusters in this batch too. The recruiting batch just made it visible because the user expected QAs.

---

### Fix plan (do not execute yet — sending RCA only, per instructions)

**Bug A — make compliance_class actually constrain the prompt**
1. `build-cluster-step` line ~227: forward `compliance_class: c.compliance_class` and `cluster_name: c.name` in the `generate-cluster` POST body.
2. `generate-cluster`:
   - Read `compliance_class` from request and persist on `cluster_generations` row.
   - Branch the structure prompt: when `recruiting_no_income_claims`, swap "wealth management firm" for "insurance career and broker recruitment" and inject explicit forbidden topics (Social Security amounts, AUM, RMD, policy loans, retirement income figures) plus required topics (licensing path, mentorship, exam prep, agency models, day-in-the-life — non-monetary).
   - For the article body prompt: do not use `app_settings.master_content_prompt` when recruiting. Either (a) load a separate `master_recruiting_prompt` row, or (b) wrap the master prompt with a hard override block listing the forbidden patterns from `INCOME_PATTERNS` in `build-cluster-step` and pointing at the recruiting-clusters spec.
3. Tighten the output: instruct Claude to never include numeric currency, never mention client portfolios, frame everything from the agent's perspective.

**Bug B — wire Q&A into the cluster lifecycle**
Two viable options; recommend option 2.

- *Option 1 (minimal):* extend the completion gate in `build-cluster-step` (line 342) to also fire `generate-cluster-qas` (fire-and-forget) before advancing, and accept that Q&A runs after `current_index` advances. Pro: tiny diff. Con: still no visibility — same failure mode could recur silently.

- *Option 2 (recommended):* add a sub-state machine to the entry. New `current_phase` column on `cluster_batch_jobs` (`'blog'` | `'qa'`). When blog completes:
  1. Fire `generate-cluster-qas` for the cluster, store returned `jobId` on the batch row.
  2. Set `current_phase='qa'`. Do NOT advance `current_index` yet.
  3. On subsequent ticks, poll `qa_generation_jobs.status` for that jobId. When `completed` (or `failed` after retry budget), record qa_count / qa_failed in the result row, then advance `current_index`, reset `current_phase='blog'`.
  4. Add a separate phase timeout (~30 min) so a stuck Q&A job can't block the whole batch.

**Verification before re-running**
- Unit-trigger `generate-cluster` with `compliance_class='recruiting_no_income_claims'` on one recruiting topic and grep the generated articles for `INCOME_PATTERNS` + check `flagged_articles` stays at 0.
- Run a 1-cluster batch end-to-end and confirm `qa_pages` rows appear before `current_index` advances.
- Then re-run the 25-cluster bulk.

I have not changed any code yet. Approve this plan and I'll switch to build mode and implement the fix.