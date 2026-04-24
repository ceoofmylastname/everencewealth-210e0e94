

## Fix the failing image regeneration

Three connected bugs are killing the "Regenerate" button on Spanish (and any cluster with multiple articles in the same funnel stage). Here is what to fix.

### Root cause

From the edge function logs for article `6ff02a39…` (the Spanish "La Brecha de Jubilación"):

```text
🖼️ Starting image regeneration
📝 Article: "La Brecha de Jubilación..." (es)
🔗 Non-English article detected - checking for English primary image...
⚠️ No English primary found - will generate new image
🧠 Generating content-based image prompt...
ERROR: Failed to generate image prompt   ← OpenAI call returned non-200
```

Two compounding problems:

1. **English primary lookup uses `.maybeSingle()`** — but this MOFU cluster has TWO English articles (and two Spanish translations). `maybeSingle()` returns `null` whenever more than one row matches, so the Spanish article can't borrow its English sibling's image and falls into the fresh-generation path.
2. **Fresh-generation path calls OpenAI `gpt-4o-mini`** for both the image prompt and the alt-text/caption. OpenAI is the **only** part of this function still on OpenAI — every other AI call in the project uses the Lovable AI Gateway. The OpenAI key returned an error (most likely expired / out of credits / rate-limited), and the function throws instead of falling back, so the Kie.ai image step is never even reached.

### What I'll change in `regenerate-article-image/index.ts`

**1. Fix the English-primary lookup**
- Replace `.eq('funnel_stage', X).eq('language','en').maybeSingle()` with a slug-based match: find the English sibling whose `translations` JSON points back at this Spanish article (or vice versa). That gives a 1-to-1 pairing instead of a funnel-stage bucket.
- Fallback: order by `created_at` and take the first result so `maybeSingle()` never collides.

**2. Migrate prompt generation off OpenAI → Lovable AI Gateway**
- Switch the prompt-generation call from `https://api.openai.com/v1/chat/completions` (gpt-4o-mini) to `https://ai.gateway.lovable.dev/v1/chat/completions` (`google/gemini-2.5-flash`).
- Use `LOVABLE_API_KEY` (already managed, no key rotation needed).
- Same change for `generateLocalizedMetadata()` — alt text + caption.

**3. Add a hardcoded fallback prompt**
- If the AI prompt-generation step fails for any reason, fall through to a high-quality default prompt based on `funnel_stage` + `cluster_theme` instead of throwing. The image still gets regenerated; we just lose the bespoke prompt.

**4. Better error logging**
- Log the actual HTTP status + body when the gateway call fails so the next failure tells us *why* (429 vs 402 vs 400) instead of a generic "Failed to generate image prompt".
- Surface 429 (rate limit) and 402 (no credits) as user-visible toast messages in the dashboard.

**5. Remove the `OPENAI_API_KEY` requirement**
- Drop the `if (!openaiKey) throw…` guard so the function boots cleanly without OpenAI at all. (`KIE_API_KEY` is still required for the actual image generation.)

### What stays the same

- Kie.ai Nano Banana 2 still does the image generation.
- Logo verification + retry loop (added in the last migration) is untouched.
- Storage upload, old-image cleanup, alt/caption persistence — all unchanged.
- Image sharing across EN/ES translations remains the preferred path; we're just making the lookup actually work.

### Verifying the fix

After the change I'll re-run the failed regenerate against article `6ff02a39…` and confirm:
- Logs show "Found English primary image - sharing" (the lookup now finds the match).
- The Spanish article gets the same image as its English sibling.
- A second test on a Spanish article *without* an English sibling proves the fresh-generation path works end-to-end via Lovable AI + Kie.ai, with no OpenAI dependency.

### Out of scope

- No UI changes to the dashboard.
- No schema changes.
- No changes to scan / detection logic — only the regenerate function.

