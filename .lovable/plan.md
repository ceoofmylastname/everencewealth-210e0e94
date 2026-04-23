

## Why this article has no image

The blog index loads the 3 most recent published English articles. The newest one ("Tax-Free Retirement Income Implementation: Your 90-Day Action Plan") has `featured_image_url = NULL` in the database, which is why the card shows a blank gray area instead of an image.

## Root cause

This is residue from the bugs we just fixed, not a new one:

- Cluster `3de11630…` finished generating its 6th English article during the recent recovery, but the post-completion `regenerate-cluster-images` trigger we added didn't run for the final article (saved during a self-chained invocation that ended before reaching the trigger block).
- Cluster `738ff4bd…` reached 6/6 *before* we added the trigger at all, so it still has 2 articles using the old hardcoded Unsplash placeholder (`photo-1600596542815-ffad4c1539a9`).

Database confirms it:
- `3de11630…` → 6/6 articles, **1 NULL image**, 5 Kie.ai images
- `738ff4bd…` → 6/6 articles, **2 Unsplash placeholders**, 4 Kie.ai images

The `regenerate-cluster-images` edge function already handles both cases correctly (it skips only articles that already have a Supabase Storage URL). It just needs to be invoked once per affected cluster.

## Fix

Pure data backfill — no code changes needed.

1. Invoke `regenerate-cluster-images` for cluster `3de11630-ac9e-4c05-b85f-d07c555412ba` → fills the NULL on the BOFU article.
2. Invoke `regenerate-cluster-images` for cluster `738ff4bd-31f2-4b36-b2a0-6653a39a9d5c` → replaces the 2 Unsplash placeholders with content-aware Kie.ai images.

Each affected article also propagates its new image to its Spanish counterpart at the same cluster position (built-in behavior of the function).

## Out of scope

- No schema changes
- No edge function code changes (the trigger fix is already deployed for future clusters)
- The 9 articles that already have proper Kie.ai images are not touched (the function skips them)

## Verification

After running:
- Blog index card for "Tax-Free Retirement Income Implementation" shows a real image
- `SELECT COUNT(*) FROM blog_articles WHERE language='en' AND (featured_image_url IS NULL OR featured_image_url LIKE '%unsplash%')` returns 0 for both clusters
- All 12 English articles across both clusters show `featured_image_url LIKE '%supabase.co/storage%'`

