

# CNA "Reviewed" Tracking -- Auto-Track Client Views

## Summary
When a client opens a CNA from their dashboard, the system will automatically record the date/time and update the status to "reviewed." The advisor's dashboard will then show the review timestamp so they know exactly when their client viewed the analysis.

## Changes

### 1. Database Migration -- Add `reviewed_at` column
Add a `reviewed_at` timestamp column to the `client_needs_analysis` table:
```sql
ALTER TABLE client_needs_analysis
ADD COLUMN reviewed_at timestamptz DEFAULT NULL;
```
No new RLS policies needed -- existing policies already cover SELECT and UPDATE for advisors, and clients have SELECT access.

### 2. Client CNA View -- Auto-mark as reviewed on open
In `src/pages/portal/client/ClientCNAView.tsx`:
- After the CNA is fetched, check if `status` is not already `'reviewed'` and `reviewed_at` is null
- If so, fire a single UPDATE to set `status = 'reviewed'` and `reviewed_at = NOW()`
- This runs once on first view; subsequent views skip the update since the status is already set

### 3. Advisor CNA Dashboard -- Show "Reviewed" timestamp
In `src/pages/portal/advisor/CNADashboard.tsx`:
- For CNAs with status `'reviewed'`, display the `reviewed_at` date/time next to the "Shared" badge
- Format: "Viewed Jan 15, 2026 at 3:42 PM"
- The "Reviewed" filter tab already exists and will now show CNAs that clients have actually opened

## Technical Details

**Auto-review logic (ClientCNAView.tsx):**
```typescript
// After fetching CNA data, mark as reviewed if not already
useEffect(() => {
  if (cna && !cna.reviewed_at && cna.client_id) {
    supabase
      .from("client_needs_analysis")
      .update({ status: "reviewed", reviewed_at: new Date().toISOString() })
      .eq("id", cna.id)
      .then(() => {});
  }
}, [cna]);
```

**Dashboard display (CNADashboard.tsx):**
- Next to the existing "Shared" badge, add a "Viewed" badge with the formatted timestamp when `reviewed_at` is present
- Example: a small eye icon with "Viewed 2/15/26 3:42 PM"

**Files to modify:**
- Database migration (add `reviewed_at` column)
- `src/pages/portal/client/ClientCNAView.tsx` -- add auto-review on open
- `src/pages/portal/advisor/CNADashboard.tsx` -- show reviewed timestamp

