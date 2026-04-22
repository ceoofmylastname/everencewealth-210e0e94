

## Audit: Cluster generation pipeline — what's right, what's wrong

I traced the full flow from "Create Cluster" → 6 articles saved → images attached → schema rendered. Here's what I found.

### ✅ What's already correct

| Requirement | Status | Evidence |
|---|---|---|
| 6 articles, 3 TOFU / 2 MOFU / 1 BOFU | ✅ Hardcoded in `generate-cluster` structure prompt (line 664-667) |
| Master prompt loaded from settings | ✅ `generate-cluster-chunk` reads `master_content_prompt` and substitutes `{{headline}}`, `{{targetKeyword}}`, etc. |
| Master prompt contains all your rules | ✅ 25,484 chars covering TOFU/MOFU/BOFU word counts (2,000-2,500 / 1,500-2,000), AEO speakable answer (40-60 words), E-E-A-T section (200-300 words), 5 schemas including Article + FAQPage + SpeakableSpecification |
| FAQs generated | ✅ 5-8 Q&As saved to `qa_entities` per article |
| Speakable answer extracted | ✅ Saved to `speakable_answer` column |
| JSON-LD Article + Speakable + FAQPage rendered on page | ✅ `src/components/schema/ArticleSchema.tsx` injects all three at runtime from DB fields |
| Kie.ai (Nano Banana 2) wired in | ✅ `_shared/kieClient.ts` + 8 functions migrated |
| Heartbeats + 120s timeout + kill button | ✅ Working — proven by your screenshot showing kill succeeded |

### 🚨 Critical bugs blocking "perfect" output

**Bug 1 — Word count floor is wrong (800 vs 1,500).**  
`generate-cluster-chunk/index.ts` line 271 says *"MUST be between 800 and 2,500 words"* and line 433 hard-fails only below 600. Your master prompt demands 1,500-2,500. Result: articles can save at 800 words and pass. Doesn't match what you told the AI to do.

**Bug 2 — Featured image is a hardcoded Unsplash URL during generation.**  
Line 446: `article.featured_image_url = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?...'` — every newly-generated article saves with the same stock photo. The Kie.ai image only attaches *afterward* via `regenerate-cluster-images`, AND that function uses **`google/gemini-3-pro-image-preview` via Lovable AI gateway, not Kie.ai** (line 223). So the cluster auto-trigger bypasses Kie entirely.

**Bug 3 — Cluster keeps getting stuck on article 1, attempt 2.**  
Three jobs in a row (`e7f8100a`, `f866f289`, `c219de63`) all died at the exact same point: `claude:fetch:start article=1 attempt=2`. The 12,000-token Sonnet call for article 1 is consistently exceeding the 120s timeout. Cause: the master prompt is 25,484 chars + the article prompt + asking for 2,000+ words of HTML + 8 FAQs + JSON wrapping → Sonnet needs 150-200s to finish. Timeout fires before completion every time.

**Bug 4 — Quality scaffolding not enforced.**  
The prompt enforces structure via instructions, but nothing validates that the saved article actually has: ≥6 H2s, `.speakable-answer` div, `.eeat-section` div, comparison table for MOFU, expert E-E-A-T block. `validateContentQuality` exists (line 463) but only logs warnings — it doesn't reject bad output.

### Plan to fix (one focused patch)

**File 1: `supabase/functions/generate-cluster-chunk/index.ts`**
- Bump `CLAUDE_TIMEOUT_MS` from `120_000` → `240_000` (4 min). Sonnet legitimately needs this for 2,000-word articles + master prompt.
- Replace word-count floor: minimum **1,500** (matches master prompt), target 1,800, max 2,500. Hard-reject below 1,200.
- Remove the hardcoded Unsplash featured_image_url. Set `article.featured_image_url = null` so the post-generation Kie.ai image is unambiguous.
- Tighten `validateContentQuality` to actually fail the save if missing `.speakable-answer` div, missing `.eeat-section`, fewer than 6 H2s, or missing FAQ array.

**File 2: `supabase/functions/regenerate-cluster-images/index.ts`**
- Replace the Lovable AI Gateway image call (line 210-253) with `kieGenerateImage` from `_shared/kieClient.ts` so cluster images actually use Nano Banana 2 / KIE_API_KEY as you intended.
- Keep the existing per-article prompt extraction logic (it's good — pulls topic from `detailed_content`).

**File 3: `supabase/functions/generate-cluster/index.ts`** (structure step)
- No changes. Already correct.

**Cleanup**
- Mark stuck job `e7f8100a` as `failed` so the dashboard isn't misleading.

### Verification after patch

1. Create a test cluster with the same topic from your screenshot.
2. Watch heartbeats progress past `claude:fetch:start article=1 attempt=1` → `parse:start` → `db:save:complete` for all 6 articles.
3. Open one finished article — confirm: word count 1,500-2,500, `.speakable-answer` div present, `.eeat-section` present, 5-8 FAQs, Kie.ai image (not Unsplash, not Gemini), JSON-LD Article + FAQPage + Speakable schemas in `<head>`.

### Files touched
- **Edited:** `supabase/functions/generate-cluster-chunk/index.ts`, `supabase/functions/regenerate-cluster-images/index.ts`
- **DB:** mark `e7f8100a` failed
- **Untouched:** `generate-cluster/index.ts`, `_shared/kieClient.ts`, `ArticleSchema.tsx`, master prompt itself

