

# Fix: Auto-invalidate QA badge counts after translation

## Problem
After Q&A translations complete, the language badges on cluster cards show stale counts (e.g., "22P/22T" instead of "24P/24T") because the `cluster-qa-counts` query is never invalidated.

## Solution
Add `queryClient.invalidateQueries({ queryKey: ["cluster-qa-counts"] })` in two places inside `ClusterQATab.tsx`:

1. **During polling** (line 485 area): After each successful poll that detects progress, also invalidate `cluster-qa-counts` so badges update in near-real-time as Q&As are created.

2. **After polling completes** (line 520-523 area): Add invalidation of `cluster-qa-counts` alongside the existing `cluster-qa-pages` and `cluster-generations` invalidations.

## Technical Details

**File:** `src/components/admin/cluster-manager/ClusterQATab.tsx`

After line 485 (`await fetchQACounts()`), add:
```typescript
queryClient.invalidateQueries({ queryKey: ["cluster-qa-counts"] });
```

After line 523 (`await queryClient.invalidateQueries(...)`), add:
```typescript
await queryClient.invalidateQueries({ queryKey: ["cluster-qa-counts"] });
```

This ensures the parent `ClusterManager.tsx` component (which owns the `cluster-qa-counts` query at line 109) re-fetches the server-side aggregated counts, and the badge UI updates automatically.

Two lines of code, no new files, no schema changes.
