

## Fix Infinite Recursion in Advisors RLS Policy

### Problem
The policy "Clients can view their advisor" on the `advisors` table contains this subquery:

```sql
SELECT a.id FROM advisors a JOIN portal_users pu ON (pu.advisor_id = a.portal_user_id)
WHERE pu.auth_user_id = auth.uid()
```

This references the `advisors` table from within its own RLS policy, triggering infinite recursion.

### Solution

1. **Create a SECURITY DEFINER function** that retrieves the current user's advisor ID from `portal_users` without going through `advisors`:

```sql
CREATE OR REPLACE FUNCTION public.get_my_advisor_id(_auth_uid uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT advisor_id FROM portal_users
  WHERE auth_user_id = _auth_uid AND role = 'client'
  LIMIT 1;
$$;
```

2. **Replace the recursive policy** with one that uses the new function:

```sql
DROP POLICY "Clients can view their advisor" ON public.advisors;

CREATE POLICY "Clients can view their advisor" ON public.advisors
FOR SELECT USING (
  portal_user_id = public.get_my_advisor_id(auth.uid())
);
```

This eliminates the self-referencing subquery while preserving the same access logic: clients can only see the advisor assigned to them.

