

## Root Cause (confirmed)

The error is **not** about the UPDATE policy itself. The UPDATE policy is correct and `get_advisor_id_for_auth` returns the right value for your account.

The real issue is a PostgreSQL RLS behavior: **when both SELECT and UPDATE policies exist on a table, PostgreSQL requires the NEW row (after the update) to also satisfy the SELECT policy.**

The only SELECT policy on `advisor_slugs` is:
```sql
"Public read active slugs" → USING (is_active = true)
```

When you click "Delete URL", the code runs:
```sql
UPDATE advisor_slugs SET is_active = false WHERE ...
```

The **new row** now has `is_active = false`, which **fails the SELECT policy check** (`is_active = true`). PostgreSQL blocks the update with the "new row violates row-level security policy" error.

In other words: the SELECT policy is inadvertently acting as a constraint that prevents anyone from ever setting `is_active = false`.

## Fix

Add a second SELECT policy that lets authenticated advisors see their own slugs regardless of `is_active` status. This way, the new row (with `is_active = false`) will still satisfy at least one SELECT policy.

### Database migration

```sql
-- Allow advisors to read their own slugs (active or inactive)
-- This is required so UPDATE operations that set is_active=false
-- don't fail the implicit SELECT WITH CHECK in PostgreSQL RLS.
CREATE POLICY "Advisors can read own slugs"
ON public.advisor_slugs
FOR SELECT
TO authenticated
USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));
```

No frontend changes needed. The existing code is correct.

### Why previous fixes failed

All three prior migrations targeted the UPDATE and INSERT policies, which were already correct. The root cause was always the SELECT policy blocking the new row state, which is a subtle PostgreSQL RLS behavior.

