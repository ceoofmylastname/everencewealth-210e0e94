
# Fix: Approve Function Must Create Missing portal_users Records

## Problem
When a manager clicks "Approve," the backend function only runs an UPDATE on the `portal_users` table. For agents like Bobby Smith Jones who have no `portal_users` record at all, the UPDATE matches 0 rows and silently succeeds. The UI shows "Agent approved!" but the agent still cannot log in because no record was created.

## Root Cause
The `contracting-intake` edge function sometimes fails to create the `portal_users` record during signup, or it was never designed to in certain flows. The `approve-agent` function assumes the record already exists and only does:
```
UPDATE portal_users SET is_active = true WHERE auth_user_id = ...
```
This is a no-op when the row doesn't exist.

## Solution
Update the `approve-agent` edge function to use an **upsert pattern**: check if a `portal_users` record exists, and if not, create one before activating it.

### Changes

**File: `supabase/functions/approve-agent/index.ts`**

Replace the simple UPDATE (lines 82-91) with logic that:
1. Checks if a `portal_users` record exists for the agent's `auth_user_id`
2. If it exists, updates `is_active` to `true`
3. If it does NOT exist, inserts a new `portal_users` record with:
   - `auth_user_id` from the agent
   - `first_name`, `last_name`, `email` from the contracting_agents record
   - `role: "advisor"`
   - `is_active: true`

### Also: Fix the existing broken record
Run a database query to manually create Bobby's missing `portal_users` record so he can log in immediately without waiting for another approval click.

### Technical Details

| Item | Detail |
|---|---|
| File modified | `supabase/functions/approve-agent/index.ts` |
| Database fix | Insert missing `portal_users` row for Bobby Smith Jones |
| Logic change | Check for existing record, INSERT if missing, UPDATE if present |
| No other files affected | The UI already handles the approval flow correctly |
