
## Fix: Summary Cards Showing 0 Despite Q&As Existing

### Problem

The summary cards at the top of the Q&A tab (Total Q&As, Published, Draft, Complete%) all show **0**, even though:
- English Q&As: 24/24 (green checkmark)
- The database confirms 48 Q&As exist

### Root Cause

The summary cards read from `cluster.total_qa_pages` and `cluster.total_qa_published`, which are computed in the **parent component** (`ClusterManager.tsx`) using a cached RPC call (`get_cluster_qa_counts`). This data is stale -- it was fetched before the Q&As were generated and hasn't been refetched.

Meanwhile, the per-language counts (the "24/24" tiles) are fetched independently inside `ClusterQATab.tsx` via direct queries, so they show correct data.

### Fix

**File: `src/components/admin/cluster-manager/ClusterQATab.tsx`**

Replace the summary card values with the locally-computed values that are already available:

1. **Total Q&As**: Change `cluster.total_qa_pages` to `totalQAsCreated` (already computed on line 1111 from `englishQACount + languageQACounts`)
2. **Published**: Change `cluster.total_qa_published` to the sum of `languagePublishedCounts` values (already tracked in state)
3. **Draft**: Derive from `totalQAsCreated - totalPublished`
4. **Completion %**: Derive from `totalQAsCreated / totalExpectedQAs`
5. **Progress bar**: Same fix for the progress text on line 1140

This ensures the summary cards use the same real-time data source as the per-language tiles, rather than depending on the parent's cached RPC data.

### Technical Details

Lines to update in `ClusterQATab.tsx`:

- **Line ~1009-1014**: Recompute `completionPercent` and `draftQAsCount` using local state
- **Line 1118**: `cluster.total_qa_pages` -> `totalQAsCreated`  
- **Line 1123**: `cluster.total_qa_published` -> locally computed published total
- **Line 1127**: `draftQAsCount` -> `totalQAsCreated - totalPublished`
- **Line 1140**: Progress bar text uses `totalQAsCreated` instead of `cluster.total_qa_pages`

Additionally, add the English published count to `languagePublishedCounts` (same pattern as the previous fix for `languageQACounts`).
