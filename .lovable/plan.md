
# Fix: Advisors Cannot Create Schedule Events

## The Problem

The `schedule_events` table has a gap in its security policies:

| Policy | Who | What |
|---|---|---|
| "Admins manage schedule events" | Admins only | SELECT, INSERT, UPDATE, DELETE |
| "Portal advisors can view schedule events" | Advisors | SELECT only |

**There is no INSERT policy for advisors.** When John Mel (advisor role) clicks "Create Event," the database rejects the insert with a permissions error — which the frontend catches and shows as "Failed to create event."

The advisor can *read* events just fine, but cannot *write* any.

## The Fix

Add two missing RLS policies to the `schedule_events` table:

1. **INSERT** — allow advisors to create new events (setting `created_by` to their own user ID)
2. **UPDATE / DELETE** — allow advisors to edit or delete only events *they created* (ownership check via `created_by = auth.uid()` cross-referenced against `portal_users`)

This follows the same pattern used elsewhere in the portal (e.g., advisors can manage their own client records).

## Database Migration

A single migration adds the two new policies:

```sql
-- Allow advisors to insert schedule events
CREATE POLICY "Portal advisors can create schedule events"
ON public.schedule_events
FOR INSERT
TO public
WITH CHECK (is_portal_advisor(auth.uid()) OR is_portal_admin(auth.uid()));

-- Allow advisors to update/delete events they created
CREATE POLICY "Portal advisors can manage own schedule events"
ON public.schedule_events
FOR ALL
TO public
USING (
  (is_portal_advisor(auth.uid()) OR is_portal_admin(auth.uid()))
  AND created_by IN (
    SELECT id FROM public.portal_users WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  (is_portal_advisor(auth.uid()) OR is_portal_admin(auth.uid()))
  AND created_by IN (
    SELECT id FROM public.portal_users WHERE auth_user_id = auth.uid()
  )
);
```

## No Code Changes Needed

The `SchedulePage.tsx` code is already correct — it properly passes `created_by: portalUser.id` on insert. The only missing piece is the database-level permission. Once the policy is added, event creation will work immediately.

## Files Changed

- **Database migration only** — two new RLS policies on `schedule_events`
- No frontend code changes required
