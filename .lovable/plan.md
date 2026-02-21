

# Fix: Manager Can't See Their Recruits on Contracting Dashboard

## Root Cause

The issue is a **mismatch in the database security policy** (RLS). Here's what's happening:

1. When Mike Ross submitted the intake form, his record was saved with `manager_id` pointing to John Mel's **portal user ID** (the correct value after our earlier fix).

2. However, the database security rule that controls who can see which agents still checks `manager_id` against `get_contracting_agent_id()` -- which looks up a **contracting agent ID** (a different table entirely).

3. Since John Mel is an advisor (not a contracting agent himself), `get_contracting_agent_id()` returns nothing for him, so the security rule blocks him from seeing any recruits.

Additionally, the `useContractingAuth` hook doesn't recognize John Mel as a "manager" role because he has no row in `contracting_agents`. This means the dashboard doesn't apply the manager filter and shows generic content.

## Fix (2 changes)

### 1. Update the database security policy

Change the RLS SELECT policy on `contracting_agents` to compare `manager_id` against `get_portal_user_id(auth.uid())` instead of `get_contracting_agent_id(auth.uid())`.

**Before:** `manager_id = get_contracting_agent_id(auth.uid())`
**After:** `manager_id = get_portal_user_id(auth.uid())`

This matches the actual data relationship: `manager_id` references `portal_users.id`.

### 2. Update `useContractingAuth` to detect managers automatically

Modify the hook so that advisors who have recruits assigned to them (i.e., exist as a `manager_id` in `contracting_agents`) are automatically treated as having the "manager" role -- even without a `contracting_agents` row of their own.

**File:** `src/hooks/useContractingAuth.ts`

Add logic after the existing contracting agent lookup: if no contracting role was found and the user is an advisor, check if any `contracting_agents` rows have `manager_id` matching their `portal_users.id`. If so, set `effectiveRole` to `"manager"`.

## Expected Result

After these changes, when John Mel logs in and opens the Contracting Dashboard, the system will:
1. Recognize him as a "manager" via the auto-detection
2. The database security policy will allow him to see agents where `manager_id` matches his portal user ID
3. Mike Ross (and any future recruits who select John Mel) will appear on his dashboard, pipeline, and documents pages

