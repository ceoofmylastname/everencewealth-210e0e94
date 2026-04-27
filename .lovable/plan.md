## Three Confirmations (as requested)

### 1. DB Constraint Definitions

There are **TWO** sibling check constraints on `blog_articles.detailed_content` — the sanitizer must satisfy both:

```
blog_articles_body_no_head_h1:
  CHECK (detailed_content IS NULL OR (
    detailed_content !~* '<head[[:space:]>]'
    AND detailed_content !~* '<h1[[:space:]>]'
  ))

blog_articles_body_no_head_or_canonical:
  CHECK (detailed_content IS NULL OR (
    detailed_content NOT ILIKE '%<head>%'
    AND detailed_content NOT ILIKE '%</head>%'
    AND detailed_content NOT ILIKE '%rel="canonical"%'
    AND detailed_content NOT ILIKE '%rel=''canonical''%'
    AND detailed_content NOT ILIKE '%rel="alternate"%'
    AND detailed_content NOT ILIKE '%rel=''alternate''%'
    AND detailed_content NOT ILIKE '%application/ld+json%'
  ))
```

The original report missed the canonical/alternate/JSON-LD constraint. The sanitizer must handle ALL of: `<head…>`, `</head>`, `<h1…>`, `rel="canonical"`, `rel='canonical'`, `rel="alternate"`, `rel='alternate'`, `application/ld+json`.

Other constraints worth noting (not body-related): `meta_title` ≤ 70 chars, `meta_description` ≤ 160 chars, `funnel_stage` ∈ {TOFU, MOFU, BOFU}, `language` ∈ allowlist, `status` ∈ {draft, published, archived}.

### 2. Current LLM Prompt — HTML Structure Guidance

The `master_content_prompt` (25,484 chars in `content_settings`) is the base. It is then wrapped in `generate-cluster-chunk/index.ts` lines 290–315 with a JSON envelope. Today's instructions about HTML structure say only:

```
"detailed_content": "<div class='article-content'>...full HTML article content...</div>"

MANDATORY STRUCTURE inside detailed_content:
- A <div class="speakable-answer">…40-60 word direct answer…</div> near the top
- An <div class="eeat-section">…200-300 word expert E-E-A-T block…</div>
- At least 6 <h2> headings, each followed by 2+ detailed paragraphs
```

**Confirmed gap:** The prompt is silent on `<h1>`, `<head>`, `<html>`, `<body>`, `<meta>`, `<link rel="canonical">`, `<link rel="alternate">`, `<script type="application/ld+json">`, `<style>`. Claude is filling in a "full document" mental model. This explains the Roth Conversion failure and the 7–12h historical zombie generations — same root cause, never identified.

### 3. `completed_with_errors` Downstream Compatibility

`cluster_generations.status` has **no DB check constraint** (verified: only PK + FK on user_id), so adding a new value is structurally safe.

**However**, `build-cluster-step/index.ts:300` does a strict equality check:
```ts
const completionOk = g.status === "completed" && /* + lang completeness */;
```

A new value `completed_with_errors` would NOT advance the batch worker → cluster gets stuck again. **Decision: do NOT introduce a new status value.** Instead:
- Keep `status = 'completed'` on partial success (so the worker advances)
- Surface partial-failure signal via `progress.partial_failures` JSONB array
- The worker (`build-cluster-step`) reads `progress.partial_failures` and writes `status: 'flagged'` to `cluster_step_logs` + `cluster_batch_jobs.results` so partial clusters are visible in the batch report without breaking the orchestrator

This satisfies the partial-credit requirement without an enum/check change and without modifying the strict equality check.

---

## Implementation Plan: Fixes A + B + C + D

### FIX D — LLM Prompt Hardening (PRIMARY DEFENSE)

**File:** `supabase/functions/generate-cluster-chunk/index.ts` (lines 289–315)

Insert a new "OUTPUT FORMAT RULES" block into the JSON-envelope wrapper that wraps `masterPrompt`. Explicit constraints:

```
OUTPUT FORMAT RULES for detailed_content (ENFORCED — violations cause REJECTION):
- Output the article BODY ONLY as a single <div class="article-content">…</div> wrapper
- Do NOT emit <html>, <head>, <body>, or <h1> tags anywhere
- The article title belongs in the "headline" field, NOT as <h1> in the body
- Section headings start at <h2>; subsections use <h3>
- Do NOT include <meta>, <link>, <script>, <style>, or any document-level tags
- Do NOT include rel="canonical", rel="alternate", or application/ld+json blocks
  (those are injected separately by the publishing pipeline)
- Do NOT wrap content in any document-level tags
```

Add the same rules to all three `systemPrompt` variants (initial + retry attempts 2 + 3) so retries don't lose the constraint.

### FIX A — Sanitization Safety Net

**File:** `supabase/functions/generate-cluster-chunk/index.ts` (new helper before `processChunk`, called between line 462 and the DB insert)

```ts
function sanitizeDetailedContent(html: string): { cleaned: string; removed: string[] } {
  const removed: string[] = [];
  let cleaned = html;

  // Strip <head>...</head> blocks entirely
  if (/<head[\s>]/i.test(cleaned)) {
    cleaned = cleaned.replace(/<head[\s\S]*?<\/head>/gi, '');
    removed.push('head_block');
  }

  // Strip stray opening/closing head tags
  cleaned = cleaned.replace(/<\/?head[^>]*>/gi, '');

  // Strip <html> and <body> wrappers (keep inner content)
  cleaned = cleaned.replace(/<\/?html[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/?body[^>]*>/gi, '');

  // Downgrade <h1>...</h1> to <h2>...</h2>
  if (/<h1[\s>]/i.test(cleaned)) {
    cleaned = cleaned.replace(/<h1([\s>])/gi, '<h2$1').replace(/<\/h1>/gi, '</h2>');
    removed.push('h1_downgraded');
  }

  // Strip <meta>, <link rel="canonical|alternate">, <script type="application/ld+json">, <style>
  cleaned = cleaned.replace(/<meta\b[^>]*>/gi, '');
  cleaned = cleaned.replace(/<link\b[^>]*rel=["']?(canonical|alternate)["']?[^>]*>/gi, '');
  cleaned = cleaned.replace(/<script\b[^>]*type=["']?application\/ld\+json["']?[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[\s\S]*?<\/style>/gi, '');

  return { cleaned, removed };
}
```

Apply after `article.detailed_content = ...` (line 462) and log removals via `heartbeat()` so we can monitor whether the prompt fix is working.

### FIX C — Pre-insert Validation Mirror

Add `validateNoForbiddenTags(html)` call right before `supabase.from('blog_articles').insert(...)`. If any forbidden pattern remains after sanitization, throw a descriptive error (`db:validate:fail pattern=<x>`) so the gen fails fast with a clear cause rather than getting a generic Postgres CHECK violation. This catches sanitizer regression early.

### FIX B — Error Propagation + Partial Failure Handling

**File:** `supabase/functions/generate-cluster-chunk/index.ts` (chunk-loop tail) and `supabase/functions/generate-cluster/index.ts` (cluster-completion tail)

In `generate-cluster-chunk` after the per-article loop completes:

```
saved   = articles successfully inserted
errors  = [{article_index, error_message, attempt_count}]

if saved === 0 && errors.length > 0:
  UPDATE cluster_generations SET status='failed',
    error='All articles failed: ' + first_error,
    progress = progress || {partial_failures: errors}
  // gen ends, orchestrator sees 'failed' and advances current_index

if saved > 0 && errors.length > 0:
  UPDATE cluster_generations SET
    progress = progress || {partial_failures: errors, partial: true}
  // continue to translation phase with the saved subset
  // status stays 'generating' until translation also finishes

if saved === expected:
  // happy path, no progress.partial_failures key
```

In `generate-cluster` (cluster-completion tail, around line 808/833/883 where status flips to 'completed'):

```
After ALL chunks + translation finish:
  if total_saved < total_expected:
    UPDATE cluster_generations SET status='completed'  -- still completed (worker advances)
       progress = progress || {partial: true, total_saved, total_expected}
  else:
    UPDATE cluster_generations SET status='completed'
```

**Worker side (`build-cluster-step/index.ts` ~line 345):** When polling sees `g.status === 'completed'`, also read `g.progress`. If `progress.partial === true`, still mark the entry "built" (so the batch advances) but tag it `flagged` in `cluster_step_logs` and include the `partial_failures` array in the batch `results` JSONB. This gives a partial-credit cluster instead of a stuck one, with full visibility in the admin batch report.

---

## Deploy & Smoke Test

1. Deploy `generate-cluster-chunk`, `generate-cluster`, and `build-cluster-step` in a single deploy.
2. Resume batch `9e9eed7b-5cff-4401-9676-e826f9aba220` via `admin-batch-ops {op:'resume_batch', batch_id:'9e9eed7b…', reset_current_job_id:true}` to clear the failed gen reference, starting from `current_index=1` (Roth Conversion).
3. Heartbeat the smoke test:
   - First article should commit to `blog_articles` within ~3.5 min (matches historical baseline).
   - Watch `progress.partial_failures` — empty array = prompt fix is working; populated = sanitizer is catching residual issues (still acceptable, just means prompt needs further tightening).
   - Abort triggers unchanged: 3 consecutive `lock_held`, `gen_stale_min > 5` for 3+ ticks, any `error` action, `current_index` stuck > 25 min.
4. **HARD STOP** after smoke-test report. No overnight run. No `start_from=6` shortcut.

## Files Touched

- `supabase/functions/generate-cluster-chunk/index.ts` — Fix D (prompt), Fix A (sanitizer), Fix C (validation), Fix B (chunk-loop error propagation)
- `supabase/functions/generate-cluster/index.ts` — Fix B (cluster-level partial flag in `progress` JSONB)
- `supabase/functions/build-cluster-step/index.ts` — Fix B (read `progress.partial`, flag in step logs without blocking advancement)

No DB migration required. No new status enum value. No frontend changes.