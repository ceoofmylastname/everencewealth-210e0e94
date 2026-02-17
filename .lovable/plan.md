

# Fix: Execute the Advisors RLS Migration (For Real This Time)

## The Problem
The "Advisor record not found" error keeps appearing because the database migration was never executed. The broken RLS policy on the `advisors` table is still causing infinite recursion.

**Current broken policy** (confirmed still active):
```text
Clients can view their advisor:
  id IN (SELECT a.id FROM advisors a JOIN portal_users pu ON pu.advisor_id = a.portal_user_id WHERE pu.auth_user_id = auth.uid())
```
This references the `advisors` table inside its own SELECT policy, causing an infinite loop.

## The Fix (Database Migration)

Run this SQL migration:

```sql
-- 1. Create helper function that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_my_advisor_id_from_portal(_auth_uid uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT advisor_id FROM portal_users
  WHERE auth_user_id = _auth_uid AND is_active = true
  LIMIT 1;
$$;

-- 2. Drop the broken recursive policy
DROP POLICY IF EXISTS "Clients can view their advisor" ON advisors;

-- 3. Recreate without recursion
CREATE POLICY "Clients can view their advisor"
ON advisors FOR SELECT TO authenticated
USING (
  portal_user_id = get_my_advisor_id_from_portal(auth.uid())
);
```

## What This Fixes
- The "Advisor record not found" error will disappear
- Advisors will be able to create and send client invitations
- No application code changes needed

## Files Changed
- No code files -- database migration only

