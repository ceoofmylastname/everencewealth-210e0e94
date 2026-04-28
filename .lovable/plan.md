# Flags 1-3: Answers + Revised Combined Ship Plan

## FLAG 1 — Speakable truncation: 800 chars is canonical, 250 was a typo

**Confirmed: 800 chars / 150 words is the rule.** No source ever changed this.

Authority chain (verified read-only):
- `supabase/functions/shared/aeoRules.ts` line 11–17: `MAX_WORDS=150, MAX_CHARS=800`
- `src/lib/aeoUtils.ts` line 13–20: `MAX_WORDS=150, MAX_CHARS=800, MIN_LENGTH=160`
- `supabase/functions/fix-aeo-compliance/index.ts` line 11: `AEO_MAX_CHARS=800, AEO_MAX_WORDS=150`

The "250" in the prior plan was a typo against `MIN_LENGTH=160` — it should have read 800. Earlier verification samples (913→652, 795 chars) align with the 800 ceiling and stay above the 160 floor. No new samples needed; the algorithm itself is correct, only the prior plan's number was wrong.

**Action:** Use `truncateForAEO(text, 800)` from `src/lib/aeoUtils.ts` everywhere; delete the duplicated truncation code in any caller that hardcodes a different number. No new constants.

---

## FLAG 2 — PROMPT 24 is intact. Roth Conversion failure was NOT a CHECK violation

### a) Fix A sanitization location
`supabase/functions/generate-cluster-chunk/index.ts` lines **145–200** (`sanitizeDetailedContent`) — strips `<head>`, `<html>`, `<body>`, downgrades `<h1>→<h2>`, removes `<meta>`, `rel="canonical|alternate"`, `application/ld+json`, `<style>`.

### b) Fix C pre-insert validator location
Same file, lines **205–230** (`validateNoForbiddenTags`) — throws `db:validate:fail pattern=…` before INSERT.

### c) Did PROMPT 24 ship?
Yes. Both functions are present in current `generate-cluster-chunk/index.ts` and the prompt updates (lines 412–474) explicitly forbid `<h1>/<head>/<meta>/<link>/<script>/<style>`.

### d) The Roth Conversion bodies are clean
Queried `blog_articles WHERE cluster_id='7eeebd5d…'`:
- 2 EN rows (status=`draft`), body lengths 26,974 and 38,046 chars
- 2 ES rows (status=`published`), body lengths 32,258 and 46,608 chars
- All 4 bodies start with `<div class='article-content'><div class="speakable-answer"…` — no `<h1>`, no `<head>`, no canonical link

**`cluster_step_logs` for this job (verified):**
- 06:14 `fired_generate` (article index 1)
- 06:15–06:27 14 minutes of `polled / generating / completed_languages: []` — chain stalled
- 06:28 `advanced_built` with `cluster_generations_status=completed`, `flagged_count=0`, `duration_sec=841`

**No CHECK constraint error fired.** PROMPT 24 sanitization is working. The actual failure was the chunk loop stopping after generating articles 1–2 (likely Gemini timeout / silent function shutdown — Deno boots are visible in `tick-cluster-batches` logs every ~40s) AND the orchestrator marking the job `completed` without verifying article count.

### Conclusion
My Wave 2.5 Fix #4 is **not duplicating PROMPT 24**. PROMPT 24 covers the *write path* (sanitize before INSERT). The bug is in the *control plane*:
1. `translate-cluster/index.ts:735` and `:1064` set `status='completed'` without counting `blog_articles` rows.
2. `build-cluster-step` (around `advanced_built` at line ~304 per earlier RCA) sets `cluster_generations_status='completed'` based on language flags only.
3. The chunk-chain has no resumer when a `generate-cluster-chunk` invocation dies mid-flight (no error, no retry, no log).

Wave 2.5 Fix #4 should add: **chain-health resumer** (re-fire missing funnel positions when `count(blog_articles WHERE cluster_id=X AND language='en') < 6`) — this is net-new, not a sanitization duplicate. The pre-insert sanitization line in the prior plan can be **removed**; PROMPT 24 already owns it.

---

## FLAG 3 — Hardcoded "12 articles" strings (verified locations)

```text
supabase/functions/translate-cluster/index.ts:735   message: '✅ All 12 articles generated and linked!'
supabase/functions/translate-cluster/index.ts:1064  message: '✅ All 12 articles generated and linked!'
supabase/functions/translate-cluster/index.ts:1072  completion_note: 'Bilingual cluster complete: 6 English articles + 6 Spanish translations (12 total)'
supabase/functions/translate-cluster/index.ts:746   generated_articles: 12, total_articles: 12   (literal)
supabase/functions/translate-cluster/index.ts:1067  total_articles: 12   (literal)
supabase/functions/complete-cluster/index.ts:92     message: 'Cluster is already complete (6 English articles)'
```

UI strings ("6 English articles" in `CreateClusterDialog.tsx`, `ClusterGenerator.tsx`, `ClusterManager.tsx`, `ImageSharingProgress.tsx`) are static copy describing the product — **leave those alone**, they're not lying about counts of a specific job.

**Replacement plan for the runtime strings:**
1. Before each `update({status:'completed', progress:{…}})`, query:
   ```ts
   const { count: enCount } = await supabase.from('blog_articles')
     .select('id', { count: 'exact', head: true })
     .eq('cluster_id', jobId).eq('language', 'en');
   const { count: esCount } = await supabase.from('blog_articles')
     .select('id', { count: 'exact', head: true })
     .eq('cluster_id', jobId).eq('language', 'es');
   const totalCount = (enCount ?? 0) + (esCount ?? 0);
   ```
2. Substitute into `progress.message`, `progress.generated_articles`, `progress.total_articles`, and `completion_note` using `enCount`, `esCount`, `totalCount`.
3. **Gate the `completed` status** on `enCount === 6 && esCount === 6`. If not, write `status='partial'` + insert a `cluster_step_logs` row `action_taken='count_mismatch'`, `detail={expected_en:6, actual_en:enCount, expected_es:6, actual_es:esCount}`. This is the same gate I described in Wave 2.5 Fix #3 — Flag 3 just enforces the message reflects truth.

---

## Revised Combined Ship Plan (after your ack on flags 1–3)

### A. Address consolidation
- Update `src/pages/PrivacyPolicy.tsx` and `src/pages/TermsOfService.tsx` to import `BUSINESS` from `src/config/business.ts` and replace the `101 Montgomery` string. SF stays.
- No changes to schema generators, i18n, or meta descriptions.

### B. Audit Steps 1–3
- Homepage canonical/hreflang fixes.
- Backfill `canonical_url` and `meta_description` on missing rows.
- Speakable truncation: route all callers through `truncateForAEO(text, 800)`. **Strip HTML tags before counting** (the existing function already does this on line ~70 of `aeoUtils.ts`; verify no caller bypasses it).

### C. Wave 2 (PROMPT 25)
- Fix 3: slug deduplication migration + generator fix.
- Fix 4: create `url_redirects` table, middleware lookup, language CHECK constraint.
  - **HARD STOP** at audit gate: paste suspected language-mismatch rows for review before any UPDATE.
- Fix 9: `/en/contact` canonical fix.

### D. Wave 2.5 (pipeline repair)
- **Drop** the body pre-validation work (PROMPT 24 already owns it).
- Tighten `translate-cluster` lines 735 and 1064 with row-count verification (Flag 3 logic above).
- Tighten `build-cluster-step` "built" gate (verify EN count == 6 before allowing `advanced_built`).
- Replace all 4 hardcoded "12" strings with derived counts.
- Add chunk-chain resumer: edge function (or `pg_cron` poll) that detects `cluster_generations.status='generating'` with `age > 5min` AND `count(blog_articles WHERE cluster_id=X AND language='en') < 6`, then re-fires `generate-cluster-chunk` for the missing funnel position.
- Decouple image generation via `pg_cron` (unchanged from prior plan).
- EN auto-publish (Option A) once `enCount===6 && esCount===6 && flagged_count===0`.

### E. Migrations (3 files)
1. Slug deduplication backfill.
2. `url_redirects` table + language CHECK on `blog_articles`.
3. Index on `blog_articles(cluster_id, language, status)` to speed the new count gates.

### F. Order of operations
1. **Now:** await your ack on flags 1, 2, 3 (this message — no code changes).
2. **On ack:** ship A + B + C + D + E in single deploy.
3. **Pause** at Wave 2 Fix 4 audit gate; paste rows.
4. **On audit ack:** apply the language-mismatch UPDATEs.
5. **Smoke test** `limit=10` against the manifest. Pass criteria:
   - Every **built** cluster has EN=6 + ES=6 + `featured_image_url IS NOT NULL` on all 12 rows + `status='published'` on both EN and ES + compliance scan ran on any recruiting cluster.
   - **Skipped** manifest entries return `ResultRow{status:'skipped', reason:...}` and require no article verification.
   - `build_count + skip_count + fail_count = 10`.
   - `fail_count = 0`.
   - `0` chunk-resumer firings on any built cluster (any firing = underlying instability still present → pause and diagnose).
   - No hardcoded "12" appears in any `progress` JSON; `flagged_articles` rows exist only where regex hit.
6. **If green:** approve overnight 65-cluster run.

### G. Migration notes for `cluster_step_logs.action_taken`
The Wave 2.5 work introduces four new `action_taken` enum/text values. The migration must document and (if the column is an enum) `ALTER TYPE … ADD VALUE` for:
- `count_mismatch` — emitted by `translate-cluster` / `build-cluster-step` when row counts don't equal 6/6.
- `resumer_fired` — emitted by the chunk-chain resumer when it re-fires a missing funnel position.
- `auto_published` — emitted when EN auto-publish (Option A) flips status to `published` after the 6/6/0-flag gate.
- `held_for_flag` — emitted when auto-publish is suppressed because `flagged_count > 0`.

If `action_taken` is a free-text column, no schema change is required, but the migration file must still include a comment block enumerating these four canonical values so future readers don't reinvent them.

### H. Hard-stop reminders (will be enforced at runtime)
- Wave 2 Fix #4: paste suspected language-mismatch rows for review **before** any `UPDATE blog_articles SET language=…` or `INSERT INTO url_redirects`. No writes until explicit ack.
- After deploy: post a single message with the file diff summary (file paths + lines added/removed) so the change surface is auditable.

---

## What I need from you
Ack on:
- **Flag 1:** 800 chars confirmed, 250 was a typo, no new samples needed.
- **Flag 2:** PROMPT 24 intact; Wave 2.5 drops the redundant pre-validation and adds the chain-resumer instead.
- **Flag 3:** 6 hardcoded strings replaced with derived counts; UI copy left as-is; status gated on real row counts.

No code changes until you ack.
