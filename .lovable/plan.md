

# Fix Cluster Status Display

## Problem
The cluster "The Retirement Gap Crisis" shows a "Partial" badge even though all 6 English articles were saved successfully. The edge function overwrites the status to `partial` based on its own tracking, ignoring that all articles actually saved.

## Changes

### 1. Data Fix
Update the stalled job status in the database:
```sql
UPDATE cluster_generations 
SET status = 'completed', updated_at = NOW()
WHERE id = '47b892ac-046b-422b-97f4-2767bb228b18';
```

### 2. Edge Function Fix: `generate-cluster-chunk/index.ts`
At the end of the chunk processing, after all articles are attempted, check the actual saved count in the database. If 6 or more English articles exist for the cluster, set status to `completed` regardless of the internal tracking.

This prevents the mismatch where internal retry tracking says "partial" but the database actually has all articles saved.

### 3. Also fix the `generate-cluster/index.ts` orchestrator
The orchestrator sets the final status. Update the logic so that after all chunks finish, it queries the actual article count and sets `completed` if all 6 are present, rather than relying solely on chunk success/failure flags.

## Summary
- 1 database update (data fix)
- 2 edge function files updated (prevent recurrence)
- No frontend changes needed (the UI correctly reads the status field)

