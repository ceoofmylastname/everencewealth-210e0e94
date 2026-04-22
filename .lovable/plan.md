

## Why you're being billed but getting zero articles

Your last cluster job (`738ff4bd`) is still mid-flight (60s in, 240s timeout) so it hasn't crashed yet — but the **pattern** explains the bleed.

### Root cause: the quality validator I added is throwing away articles AFTER you've paid Claude for them

Last patch made `validateContentQuality` a **hard reject**: if Claude's HTML doesn't contain *exactly* `class="speakable-answer"` and `class="eeat-section"` in `<div>` elements, plus 6+ `<h2>` tags and 5+ FAQs, the article is discarded (`throw new Error(...)`, line 495).

Then the article retry loop runs up to **3 attempts per article**. So for one rejected article you pay Claude **3 times**, get nothing saved, and the chunk exits as failed. Multiply that by 6 articles in the cluster = up to 18 billable Claude calls for zero output.

The master content prompt in your settings (25,484 chars, last updated Feb 28) was written before those CSS class names existed. Claude follows the master prompt faithfully and produces valid AEO/E-E-A-T content — but with different markup (e.g. `<section class="speakable-answer-block">`, or just a styled `<p>` near the top). My regex doesn't match → reject → bill again → reject → fail.

### The fix (one focused patch — no DB, no master-prompt edit)

**File: `supabase/functions/generate-cluster-chunk/index.ts`**

1. **Demote the scaffolding checks from hard-reject to soft-warn.**
   Keep word-count (≥1,200) and FAQ presence (≥3) as hard gates. Make `.speakable-answer` div, `.eeat-section` div, and 6+ H2s into **score deductions only** — log the warning, save the article, move on. The article is still good content; we just lose a bonus point. No more throwing away paid output.

2. **Auto-inject the AEO/EEAT scaffolds when Claude omits the exact class names.**  
   If `validateContentQuality` reports a missing `.speakable-answer` div, wrap the first paragraph as the speakable answer. If `.eeat-section` is missing, append a fallback E-E-A-T block sourced from `article.author` + the existing reviewer credentials. Article saves with the correct markup, JSON-LD Speakable schema still works.

3. **Cut the per-article retry from 3 → 1 for word-count.**  
   If Claude returns 1,400 words on attempt 1 (just under 1,500), accept it. Only retry if under 1,000 words (genuinely broken output). Saves 2 wasted Claude calls per article.

4. **Log each Claude API charge with token count** so you can see the cost per article in the edge logs and stop guessing where money is going. Add `console.log('[BILLING] article=N input_tokens=X output_tokens=Y')` after each Claude response.

### Cleanup
- Mark stuck job `738ff4bd` as failed if it doesn't complete within 5 more minutes (a follow-up SQL, not part of the code fix).

### What this fixes
- Articles you've already paid for **get saved**, not discarded over a CSS class mismatch.
- Per-article cost drops from 3× Claude calls (worst case) to 1× (success case) or 2× (one retry).
- You'll have 6 articles in the cluster after the next test run instead of 0.

### Files touched
- **Edited:** `supabase/functions/generate-cluster-chunk/index.ts`
- **No DB changes**
- **No master-prompt changes** — your prompt is fine; the validator was wrong to require markup the prompt never asked for.

### Verification after patch
1. Run a new cluster with the same topic.
2. Watch logs for `[BILLING] article=1 input_tokens=...` — confirms one Claude call per success.
3. Confirm article saves even if speakable/eeat divs are auto-injected (look for `[Chunk] auto-injected speakable scaffold`).
4. Open finished article — JSON-LD Speakable + FAQPage schemas present, content reads well, Kie.ai image attached.

