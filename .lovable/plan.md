

## Why your blog images don't match the content

There are **two separate sources** generating articles, and they behave differently:

### Source 1 — `generate-cluster` (the proper flow) ✅
Used when you create a new cluster from scratch via the wizard. It calls `generate-cluster-chunk` which:
- Sets `featured_image_url = null` on insert (correct — placeholder)
- After all articles are generated, auto-fires `regenerate-cluster-images`
- That function reads each article's full `detailed_content`, asks Lovable AI to extract a content-specific image prompt, then calls **Kie.ai Nano Banana 2** to generate a unique 16:9 image and upload it to Supabase Storage

This is why your older April 18 cluster (the 401(k) tax cluster) has perfect content-matching images — they live at `supabase.co/storage/v1/object/public/article-images/...`

### Source 2 — `complete-cluster` (the broken flow) ❌
Used when you click **"Complete Cluster"** to fill in missing articles in an existing cluster (which is what was used on April 22 to generate every article currently showing the wrong image). Looking at `supabase/functions/complete-cluster/index.ts` line 331:

```ts
featured_image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?...'
```

It hardcodes a single Unsplash stock photo as a placeholder **and never triggers image generation afterward**. That stock photo URL must have expired or changed routing on Unsplash's side, so now the CDN is returning a stock house photo instead — which is exactly what you're seeing.

The 6 articles still showing the database default OG image (no `featured_image_url` at all) come from the same code path on a slightly different version that left the field null instead of inserting Unsplash.

### The result in your database (15 most recent EN articles)

| Source | Image | Count |
|---|---|---|
| `generate-cluster` (Kie AI, content-aware) | Supabase Storage URLs | 6 (the 401(k) cluster — these are correct) |
| `complete-cluster` (hardcoded Unsplash) | Same `photo-1600596542815...` URL repeated | 3 |
| `complete-cluster` newer variant | NULL (falls back to OG image) | 6 |

## Fix

### 1. Patch `complete-cluster/index.ts` to match the proper flow
- Stop hardcoding the Unsplash URL on line 331. Set `featured_image_url: null` and `featured_image_alt: \`${plan.headline} - Everence Wealth\`` instead — same as `generate-cluster-chunk` does.
- After the article loop finishes (after the existing internal-links + hreflang steps around line 394), fire-and-forget a call to `regenerate-cluster-images` for the cluster so Kie.ai Nano Banana 2 generates a unique content-aware image per article. This is the same pattern `generate-cluster-chunk` already uses on line 724.

### 2. Backfill the 9 broken articles
Trigger `regenerate-cluster-images` once for each of the two affected clusters so every article gets a real Kie AI image generated from its actual content:
- Cluster `738ff4bd-31f2-4b36-b2a0-6653a39a9d5c` (Retirement Savings Gap — 6 articles, all missing real images)
- Cluster `3de11630-ac9e-4c05-b85f-d07c555412ba` (High Earner Tax — 3 articles, all missing real images)

`regenerate-cluster-images` already has the right logic: it skips articles that already have a `supabase.co/storage` image, so the 6 good 401(k) articles are safe and won't be touched. It will only generate for the 9 broken ones.

### 3. Verify after run
- Re-query `blog_articles` and confirm all 15 recent articles have `featured_image_url LIKE '%supabase.co/storage%'`
- Spot-check the blog index — every card should now show a unique image that matches its headline (retirement gap chart, tax buckets, calculator, etc.) instead of the same house photo or the OG fallback

## Files to change
- `supabase/functions/complete-cluster/index.ts` — remove hardcoded Unsplash URL, add post-loop trigger for `regenerate-cluster-images`

## Database action (no schema changes)
- Invoke `regenerate-cluster-images` twice (once per affected cluster) to backfill the 9 broken images

## Out of scope
- No UI changes, no prompt changes, no Kie AI configuration changes
- The 6 good April 18 articles will not be touched
- Spanish translations: `regenerate-cluster-images` already shares the English image to its Spanish counterpart in the same position, so translations are handled automatically

