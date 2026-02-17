

# Fix: Infinite Recursion in Advisors RLS Policy

## Problem
The "Advisor record not found" error is misleading. The actual database error is:

```
infinite recursion detected in policy for relation "advisors"
```

This happens because the RLS policy **"Clients can view their advisor"** on the `advisors` table joins back to `portal_users`, and `portal_users` likely has policies that reference `advisors`, creating a circular dependency.

## Current Problematic Policy
```sql
-- "Clients can view their advisor" on advisors table:
(id IN (
  SELECT a.id FROM advisors a
    JOIN portal_users pu ON (pu.advisor_id = a.portal_user_id)
  WHERE pu.auth_user_id = auth.uid()
))
```

This self-references the `advisors` table inside its own SELECT policy, and the join to `portal_users` triggers that table's policies which may reference `advisors` again.

## Solution
Replace the recursive policy with a `SECURITY DEFINER` helper function (following the project's existing pattern like `get_my_advisor_id`).

### Step 1: Create a helper function
```sql
CREATE OR REPLACE FUNCTION public.get_my_advisor_id_from_portal(_auth_uid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT advisor_id FROM portal_users
  WHERE auth_user_id = _auth_uid AND is_active = true
  LIMIT 1;
$$;
```

### Step 2: Drop the recursive policy and recreate it
```sql
DROP POLICY IF EXISTS "Clients can view their advisor" ON advisors;

CREATE POLICY "Clients can view their advisor"
ON advisors FOR SELECT TO authenticated
USING (
  portal_user_id = get_my_advisor_id_from_portal(auth.uid())
);
```

This breaks the recursion because `SECURITY DEFINER` bypasses RLS when querying `portal_users`.

### Step 3: Also fix the "Advisors can view own profile" policy
The current policy uses `auth_user_id = auth.uid()` which is fine on its own, but combined with the recursive client policy it compounds the issue. No change needed here, but worth noting.

## Files Changed
- Database migration only (no code file changes needed)

## What This Fixes
- Advisors will be able to load the Invite Client page without errors
- Clients will still be able to view their advisor's profile
- The invitation flow (create + email) will work as expected
- No code changes needed -- the existing `ClientInvite.tsx` logic is correct

