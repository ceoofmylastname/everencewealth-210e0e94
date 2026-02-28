

## Problem

The content generator assigns **the same generic Unsplash stock photo** to every article (`generate-cluster-chunk/index.ts`, line 397). A separate `regenerate-cluster-images` function exists that generates content-aware images by reading each article's actual content — but it is **never automatically called**. Users must manually trigger it after generation.

## Solution

Auto-trigger `regenerate-cluster-images` after the final chunk completes, so every newly generated cluster gets unique, article-specific AI images without manual intervention.

### Change: `supabase/functions/generate-cluster-chunk/index.ts`

After the job is finalized (around line 631, after the status update), add a fire-and-forget call to `regenerate-cluster-images`:

```typescript
// Auto-generate content-aware images for the completed cluster
if (finalStatus === 'completed') {
  console.log(`[Chunk] 🎨 Auto-triggering content-aware image generation...`);
  fetch(`${SUPABASE_URL}/functions/v1/regenerate-cluster-images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ clusterId: jobId }),
  }).catch(err => console.error('[Chunk] Image generation trigger error:', err));
}
```

This reuses the existing `regenerate-cluster-images` function which already:
- Reads each article's `detailed_content` and `headline`
- Uses AI to extract a hyper-specific image prompt from the actual article content
- Generates unique images via `google/gemini-3-pro-image-preview`
- Persists them to storage and updates the article record
- Shares the English image with Spanish translations (with localized alt text)

### Files changed
- `supabase/functions/generate-cluster-chunk/index.ts` — add auto-trigger after final chunk

