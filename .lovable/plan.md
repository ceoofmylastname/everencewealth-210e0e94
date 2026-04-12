

## Fix Q&A Spanish Translation for 3 Clusters

### Problem Summary
- 2 clusters (Tax-Free, Living Benefits) have no Spanish articles — Q&A translation can't work without them
- 1 cluster (Legacy Planning) has Spanish articles + fixed hreflang, but Q&A translation timed out on API calls
- Target: 72 Spanish Q&As (24 per cluster)

### Step 1: Translate articles to Spanish for Tax-Free and Living Benefits
Invoke `translate-cluster-to-language` for:
- `42f27c00-4a50-46fd-b80e-39aa40527675` (Tax-Free Retirement Income)
- `4d44cb1a-fc3a-4a1a-aa01-7daa5df79fb7` (Living Benefits & Protection)

Then process the translation queue to create 12 Spanish articles (6 per cluster).

### Step 2: Repair hreflang links for both clusters
Invoke `repair-cluster-article-hreflang` for Tax-Free and Living Benefits clusters so EN↔ES articles are properly linked.

### Step 3: Fix Q&A translation timeout issue
Update `repair-missing-qas` (or `translate-qas-to-language`) to increase the fetch timeout from 15s to 45s, and reduce batch size to avoid edge function time limits.

### Step 4: Translate Q&As to Spanish for all 3 clusters
Invoke Q&A translation for all 3 clusters. Legacy Planning already has the prerequisites met; the other two will be ready after Steps 1-2.

### Step 5: Verify final counts
Confirm each cluster has 24 EN + 24 ES Q&As = 48 per cluster, 144 total new Spanish Q&As across all 3.

### Technical details
- Correct cluster IDs: `42f27c00-4a50-46fd-b80e-39aa40527675`, `4d44cb1a-fc3a-4a1a-aa01-7daa5df79fb7`, `747f2c84-e762-4ee7-b12b-633f0bfe9d4b`
- The previously used cluster IDs (`42f27c00-1b5e...`, `4d44cb1a-3e7f...`) were incorrect — those don't exist in the database
- Edge function `repair-missing-qas/index.ts` needs timeout increase from 15000ms to 45000ms

