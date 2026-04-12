

## Phase 3, Step 10: Publish New Articles & Generate Q&A Pages

### Current Status
All 3 cluster generation jobs completed successfully:
- **Tax-Free Retirement Income** (`42f27c00`): 6 EN + 6 ES articles ✓
- **Living Benefits & Protection** (`4d44cb1a`): 6 EN + 6 ES articles ✓  
- **Legacy Planning & Estate Strategy** (`747f2c84`): 6 EN + 6 ES articles ✓

**Problem:** All 36 new articles were created with `status: 'draft'`. The Q&A generation function requires `status = 'published'` to find articles.

### Step 1: Publish all draft articles

Create a database migration to set all new articles to published:

```sql
UPDATE blog_articles 
SET status = 'published' 
WHERE cluster_id IN (
  '42f27c00-4a50-46fd-b80e-39aa40527675',
  '4d44cb1a-fc3a-4a1a-aa01-7daa5df79fb7',
  '747f2c84-e762-4ee7-b12b-633f0bfe9d4b'
) AND status = 'draft';
```

### Step 2: Trigger Q&A generation for all 3 clusters

After publishing, invoke `generate-cluster-qas` for each cluster ID. Each cluster produces 24 Q&A pages (6 articles × 4 Q&A types), totaling 72 new Q&A pages.

### Step 3: Verify final counts

After completion, confirm totals:
- **Articles:** 36 EN + 36 ES = 72 total (previously 36, adding 36)
- **Q&A Pages:** 144 existing + 72 new = 216 total

### What this requires
- 1 database migration (UPDATE to set status = 'published')
- 3 edge function invocations (generate-cluster-qas)
- Polling to confirm Q&A generation completes

