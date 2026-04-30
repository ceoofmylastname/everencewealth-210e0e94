## Execution Plan — Recruiting Pipeline Fix + Cluster 51 Verification

### Step 1 — Patch the approved recruiting prompt with the BLS carve-out

Add to **Section 5 (Forbidden Content → MONEY / INCOME block)**:

> **BLS Pay-Tab carve-out:** The Bureau of Labor Statistics Occupational Outlook Handbook is APPROVED for citation, but ONLY for non-pay content: job description, working conditions, education and licensing requirements, employment outlook trends, day-to-day duties. The "Pay" tab, median wage tables, percentile wage ranges, and any dollar figures from BLS pages are explicitly OFF-LIMITS for citation, paraphrase, or summary. Reason: the BLS "Insurance Sales Agents" page displays median pay prominently at the top — citing it will trip the `dollar_per_period` regex and demote the article.

Add to **Section 10 (Output Format → Citations line)**:

> Citations (footnoted, approved sources only — DOI, state insurance department sites, NAIC, and BLS Occupational Outlook Handbook pages are fine; **when citing BLS, quote only non-pay sections — never the median wage, wage ranges, or any pay-tab data**; NEVER cite earnings tables from any source).

Save final approved prompt to `/mnt/documents/master_content_prompt_recruiting_v2.txt` for the record.

### Step 2 — Seed `content_settings.master_content_prompt_recruiting`

`INSERT` (or upsert) one row in `content_settings` with `setting_key='master_content_prompt_recruiting'` and the patched prompt as `setting_value`. Verify with a length check that matches the file.

### Step 3 — Bug A fix (forward `compliance_class` + branch prompt selection)

- `build-cluster-step/index.ts` (~line 219–228): when invoking `generate-cluster`, include `compliance_class: c.compliance_class` and `cluster_name: c.name` in the POST body.
- `generate-cluster/index.ts` and `generate-cluster-chunk/index.ts`:
  - Read `compliance_class` from request, persist on `cluster_generations` (add column if missing via migration).
  - Branch master prompt fetch: `setting_key = 'master_content_prompt_recruiting'` when `compliance_class === 'recruiting_no_income_claims'`, else the existing `master_content_prompt`.
  - Branch the structure prompt: when recruiting, swap "wealth management firm" framing for "independent broker / insurance career mentor" and inject the forbidden-topic list.

### Step 4 — Bug B fix (QA phase state machine + flag-handling policy)

Migration:
- Add `current_phase TEXT DEFAULT 'blog' CHECK (current_phase IN ('blog','qa'))` to `cluster_batch_jobs`.
- Add `qa_job_id UUID NULL`, `qa_phase_started_at TIMESTAMPTZ NULL` to `cluster_batch_jobs`.

`build-cluster-step/index.ts`:
- When blog completion gate flips true:
  - Run compliance scan as today.
  - Count flagged articles in this cluster.
    - **0 flags:** fire `generate-cluster-qas` for the cluster, store returned `jobId` in `qa_job_id`, set `current_phase='qa'`, `qa_phase_started_at=now()`. Do NOT advance `current_index`.
    - **1 flag:** demote that article to draft, log to `flagged_articles` with cluster_theme/slug/matched_pattern/excerpt, fire `generate-cluster-qas` for the surviving 5 published articles, set `current_phase='qa'`. Do NOT advance.
    - **≥2 flags:** demote all flagged articles, log each to `flagged_articles`, mark cluster `status='flagged'`, **skip QA phase entirely**, advance `current_index` immediately.
- On subsequent ticks when `current_phase='qa'`:
  - Poll `qa_generation_jobs` row for `qa_job_id`.
  - If `status='completed'` (or `failed` after retry budget): record `qa_count` / `qa_failed` on the result row, advance `current_index`, reset `current_phase='blog'`, clear `qa_job_id`.
  - If `qa_phase_started_at < now() - 30 min`: log phase timeout separately, mark cluster `status='qa_timeout'`, advance.
- Blog phase keeps existing 20-min `WORKER_TIMEOUT_MIN`. QA phase uses independent 30-min budget. Log phase timeouts separately for diagnosis.

### Step 5 — Cleanup verification

Re-confirm pre-test database state (already executed):
- `blog_articles` count for the 25 recruiting cluster IDs = 0
- `flagged_articles` count = 0
- `cluster_completion_progress` for all 25 = `articles_completed=0`, `english_articles=0`, `translations_completed=0`, `status='not_started'`, `completed_at=NULL`
- `qa_generation_jobs` count for these clusters = 0

### Step 6 — Recalculate cost estimate (token math)

Per cluster:
- 6 blog generations × ~2,500 output tokens = 15,000 output tokens (Claude Sonnet 4.5)
- 24 QA generations (6 articles × 4 QAs) × ~600 output tokens = 14,400 output tokens (Claude Sonnet 4.5)
- Spanish translation × 30 items via Gemini 2.5 Flash

× 25 clusters → input + output token math at current Sonnet 4.5 + Gemini Flash rates. Send the dollar figure with the verification package.

### Step 7 — Cluster 51 single-cluster test

- Trigger `bulk-build-clusters` scoped to Cluster 51 only (`Becoming an Insurance Broker — Career Overview`, compliance_class `recruiting_no_income_claims`).
- Poll until `cluster_completion_progress.status = 'completed'` for cluster 51.
- Capture: `articles_completed`, blog count by language, QA count by language, flagged count.

### Step 8 — Four-condition verification package

Send before any 25-cluster retry:

1. **`articles_completed = 60`** for Cluster 51 (6 EN blog + 6 ES blog + 24 EN QA + 24 ES QA).
2. **Sample EN blog body** (full text of one TOFU and one BOFU) demonstrating: recruiting topic, no dollar signs, no wealth-vertical drift, no BLS pay-tab data, CTA points to `/contracting/intake`.
3. **QA-phase execution proof**: `qa_generation_jobs` row for cluster 51 with `status='completed'`, plus `build-cluster-step` log lines showing `current_phase='qa'` transition and post-QA advance.
4. **Recalculated 25-cluster cost estimate** from Step 6.

### Hold gate

Wait for written "go live" before triggering the 25-cluster retry. Cleanup, prompt seed, and code fixes will not be re-run; only the bulk batch trigger.

### Technical Details

**Files to edit:**
- `supabase/functions/build-cluster-step/index.ts` — forward compliance_class, add current_phase state machine, flag-handling branch.
- `supabase/functions/generate-cluster/index.ts` — read compliance_class, branch prompt fetch + structure prompt.
- `supabase/functions/generate-cluster-chunk/index.ts` — same prompt-fetch branch.

**Migrations:**
- `cluster_batch_jobs`: add `current_phase`, `qa_job_id`, `qa_phase_started_at`.
- `cluster_generations`: add `compliance_class TEXT NULL` for traceability (optional but recommended).

**Data inserts (via insert tool, not migration):**
- Upsert `content_settings` row with `setting_key='master_content_prompt_recruiting'`.

**No schema changes to:** `qa_generation_jobs`, `qa_pages`, `blog_articles`, `flagged_articles`, `cluster_completion_progress`.
