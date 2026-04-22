

## Fix: Allow null featured_image_url so Kie.ai can populate post-save

The previous patch correctly removed the hardcoded Unsplash URL but didn't update the database column. Result: every article fails to save with a NOT NULL violation. Job `007ecf30` is stalled at 0/6 saved.

### Fix (two changes)

**1. Database migration — make `featured_image_url` nullable**
```sql
ALTER TABLE public.blog_articles 
  ALTER COLUMN featured_image_url DROP NOT NULL;
```
This is the right model: the article row is created first, then `regenerate-cluster-images` populates the Kie.ai URL afterward. The frontend already handles null images (falls back to a placeholder).

**2. Mark stuck job `007ecf30` as failed**
```sql
UPDATE cluster_generations 
SET status = 'failed', 
    error = 'featured_image_url NOT NULL constraint violation - fixed in next migration'
WHERE id = '007ecf30-7466-43e5-a5e2-cea3800ae5a3';
```

### No code changes needed
- `generate-cluster-chunk/index.ts` is already correct (sets `featured_image_url = null`)
- `regenerate-cluster-images/index.ts` is already correct (uses Kie.ai)
- The frontend article renderer already handles null `featured_image_url`

### Verification after patch
1. Create a new test cluster with the same topic.
2. Watch logs: article 1 should save successfully (no NOT NULL error).
3. Confirm `regenerate-cluster-images` fires automatically and populates Kie.ai URLs.
4. Open finished article → verify Kie.ai 16:9 image renders.

### Files touched
- **New migration:** 1 SQL file (drop NOT NULL + mark stuck job failed)
- **No edge function changes**
- **No frontend changes**

### Why this happened
Bug 2 in the prior plan ("remove hardcoded Unsplash URL") needed a paired schema change. I shipped the code half but not the schema half. This patch closes the loop.

