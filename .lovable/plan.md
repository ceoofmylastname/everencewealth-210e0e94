
# Fix: Improve Cluster Image Fix Resilience and Error Handling

## Problem Summary
The "Fix Images" action in Cluster Manager is reporting failure despite 59/60 articles being successfully processed. The issue is:
1. **Network transience**: One Finnish translation failed due to a connection reset
2. **No retry logic**: Failed requests aren't retried
3. **Poor error messaging**: UI shows generic failure instead of partial success

## Solution

### 1. Add Retry Logic to Edge Function

**File: `supabase/functions/regenerate-cluster-images/index.ts`**

Add a retry wrapper function for database updates:

```typescript
async function retryableUpdate(
  supabase: any,
  id: string,
  updates: Record<string, any>,
  maxRetries: number = 3
): Promise<{ success: boolean; error?: any }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await supabase
        .from('blog_articles')
        .update(updates)
        .eq('id', id);
      
      if (!error) {
        return { success: true };
      }
      
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 500ms, 1s, 2s
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
      }
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} threw:`, err);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
      }
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}
```

Replace direct `supabase.from().update()` calls with this retryable version.

### 2. Improve UI Error Handling

**File: `src/pages/admin/ClusterManager.tsx`**

Update the mutation's `onError` handler to distinguish between:
- Complete failure (0 successes)
- Partial success (some succeeded)
- Network timeout (connection closed)

```typescript
onError: (error) => {
  if (imageFixIntervalRef.current) {
    clearInterval(imageFixIntervalRef.current);
    imageFixIntervalRef.current = null;
  }
  
  // Check if this is a partial success disguised as error
  const errorMsg = error.message || '';
  if (errorMsg.includes('connection closed') || errorMsg.includes('connection reset')) {
    toast.warning('Connection interrupted - some images may have been fixed. Refreshing data...');
    queryClient.invalidateQueries({ queryKey: ["cluster-image-health"] });
  } else {
    toast.error(`Failed to fix images: ${error.message}`);
  }
  
  setImageFixProgress(null);
  setClusterToFixImages(null);
}
```

### 3. Add Partial Success Messaging

Update `onSuccess` handler to show more detail:

```typescript
onSuccess: (data) => {
  if (imageFixIntervalRef.current) {
    clearInterval(imageFixIntervalRef.current);
    imageFixIntervalRef.current = null;
  }
  
  if (data.failCount > 0) {
    toast.warning(
      `Partially complete: ${data.successCount}/${data.totalArticles} updated. ` +
      `${data.failCount} failed - you can retry.`
    );
  } else {
    toast.success(`✅ Fixed! ${data.imagesPreserved || 6} preserved, ${data.imagesShared || 54} shared`);
  }
  
  queryClient.invalidateQueries({ queryKey: ["cluster-image-health"] });
  queryClient.invalidateQueries({ queryKey: ["cluster-articles"] });
  
  setTimeout(() => {
    setImageFixProgress(null);
    setClusterToFixImages(null);
  }, 1500);
}
```

### 4. Add "Retry Failed" Capability (Optional Enhancement)

Track failed article IDs in the response and add a "Retry Failed" button:

```typescript
// In edge function response, include:
failedArticleIds: results.filter(r => !r.success).map(r => r.id)

// In UI, when failCount > 0, show:
<Button onClick={() => retryFailed(data.failedArticleIds)}>
  Retry {data.failCount} Failed
</Button>
```

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/regenerate-cluster-images/index.ts` | Add retry wrapper with exponential backoff |
| `src/pages/admin/ClusterManager.tsx` | Improve error/success messaging for partial success |

---

## Expected Results

| Scenario | Before | After |
|----------|--------|-------|
| 59/60 success | "Failed to fix images" | "Partially complete: 59/60 updated. 1 failed - you can retry" |
| Connection timeout | Generic error | "Connection interrupted - some images may have been fixed" |
| All success | Works | Works (unchanged) |

---

## Technical Notes

1. **Retry Logic**: Uses exponential backoff (500ms → 1s → 2s) to handle transient network issues
2. **Idempotency**: Image updates are idempotent, so retries are safe
3. **No Data Loss**: The 59 successful updates are already committed to the database
4. **Timeout Handling**: Edge function timeout (60s) should be sufficient with 3 retries per article
