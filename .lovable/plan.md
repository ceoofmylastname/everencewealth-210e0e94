

# Fix Phase 2 Q&A Translation Issues

## Problem
Two bugs prevent smooth Q&A translation:
1. The `date_published` trigger blocks Q&A updates when adopting existing records
2. Browser timeouts cause false failure reports

## Fix 1: Remove `date_published` from update path (Edge Function)

**File:** `supabase/functions/translate-qas-to-language/index.ts`

When building the `translatedQARecord` object (line 652-677), `date_published` is always included. When this record is used in the UPDATE path (adopting orphan Q&As, line 735), the database trigger `protect_qa_date_published` rejects it.

**Solution:** Remove `date_published` from the shared record and only include it in the INSERT path:
- Move `date_published` out of `translatedQARecord`
- Add it only in the `.insert()` call (line 757), not the `.update()` call (line 737)
- In the update path, only set `date_modified` to the current timestamp

## Fix 2: Fire-and-forget pattern to prevent timeouts (Frontend)

**File:** `src/components/admin/cluster-manager/ClusterQATab.tsx`

The current approach awaits the full edge function response. Since each batch takes 2-4 minutes, the browser connection drops.

**Solution:** After calling the function, immediately show a "translating..." status and poll the `qa_pages` table every 10 seconds to track progress, rather than waiting for the HTTP response. When the count reaches 24, mark as complete.

## Technical Details

### Edge Function Change
```
// BEFORE (line 652-677):
const translatedQARecord = {
  ...
  date_published: now,  // REMOVE THIS
  date_modified: now,
};

// AFTER:
const translatedQARecord = {
  ...
  date_modified: now,
  // date_published removed from shared object
};

// INSERT path (line 757) - add date_published only here:
.insert({
  ...translatedQARecord,
  date_published: now,  // Only on new inserts
  question_main: finalQuestion,
  title: finalQuestion,
})

// UPDATE path (line 737) - no date_published, just date_modified
```

### Frontend Polling Change
- After invoking the edge function, start a polling interval (every 10s)
- Query: `SELECT count(*) FROM qa_pages WHERE cluster_id = X AND language = 'es'`
- Update the UI progress counter in real-time (e.g., "5/24 -> 6/24 -> ...")
- Stop polling when count reaches 24 or after 5 minutes with no change
- Show success/partial toast based on final count

