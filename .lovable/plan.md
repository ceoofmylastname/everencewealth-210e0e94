

## Problem

The Q&A translation from English to Spanish is working but extremely slow — each Q&A takes ~30 seconds because the function generates a unique AI image via `fal-ai/nano-banana-pro` for every single Q&A page. With a ~60s edge function timeout, only 1-2 Q&As complete per invocation, requiring 12+ manual re-triggers to finish 24 Q&As.

The hreflang linking issue is now resolved (the repair ran successfully). The translation function is working but needs to be called repeatedly.

## Solution

Two changes to make Q&A translation fast and reliable:

### 1. Skip per-Q&A image generation in `translate-qas-to-language/index.ts`

Instead of generating a unique AI image for each Q&A (~25s overhead per Q&A), reuse the source article's featured image (same approach used by `repair-missing-qas`). Q&A pages are supplementary content — they don't need unique images.

**Lines ~626-650**: Replace the `generateUniqueImage` + `uploadToStorage` block with:
```typescript
// Reuse the source article's image (fast, no AI call needed)
const generatedImageUrl = targetArticle.featured_image_url || 
  englishQA.featured_image_url || 
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200';
```

Also update the `targetArticles` query (line ~439) to include `featured_image_url`:
```typescript
.select('id, hreflang_group_id, featured_image_alt, featured_image_url, slug')
```

### 2. Increase batch size from 6 to 24

Without image generation, each Q&A takes only ~4-5 seconds (just AI translation). So 24 Q&As can complete in ~2 minutes. But edge functions timeout at ~60s, so set batch to 12 to safely fit within the limit.

**Line 581**: Change `BATCH_SIZE = 6` to `BATCH_SIZE = 12`.

### 3. Re-trigger the translation

After deploying, call `translate-qas-to-language` twice (12 Q&As per call × 2 = 24 total, minus the 2 already done = ~22 remaining).

### Files changed
- `supabase/functions/translate-qas-to-language/index.ts` — remove per-Q&A image gen, increase batch size, add `featured_image_url` to article query

