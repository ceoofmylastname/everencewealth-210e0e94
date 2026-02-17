

# Fix: Drop Recursive RLS Policy on Advisors Table

## Problem
The database migration from the previous plan was never executed. The "Clients can view their advisor" policy on the `advisors` table still contains a self-referencing query that causes infinite recursion:

```sql
-- Current broken policy:
(id IN (
  SELECT a.id FROM advisors a
    JOIN portal_users pu ON (pu.advisor_id = a.portal_user_id)
  WHERE pu.auth_user_id = auth.uid()
))
```

This is why the "Advisor record not found" error keeps appearing -- the query to find the advisor record fails due to infinite recursion in the RLS policy evaluation.

## Solution (Database Migration Only)

Run a single migration that:

1. Creates a `SECURITY DEFINER` helper function `get_my_advisor_id_from_portal` that looks up the advisor_id from `portal_users` bypassing RLS
2. Drops the broken "Clients can view their advisor" policy
3. Recreates it using the helper function instead of a self-referencing join

```sql
CREATE OR REPLACE FUNCTION public.get_my_advisor_id_from_portal(_auth_uid uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT advisor_id FROM portal_users
  WHERE auth_user_id = _auth_uid AND is_active = true
  LIMIT 1;
$$;

DROP POLICY IF EXISTS "Clients can view their advisor" ON advisors;

CREATE POLICY "Clients can view their advisor"
ON advisors FOR SELECT TO authenticated
USING (
  portal_user_id = get_my_advisor_id_from_portal(auth.uid())
);
```

## What This Fixes
- The "Advisor record not found" error on the Invite Client page will be resolved
- Advisors will be able to create and send client invitations
- No application code changes are needed -- the existing code is correct

## Files Changed
- No code files changed -- database migration only

