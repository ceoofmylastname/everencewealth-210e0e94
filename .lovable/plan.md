

## Fix: Add Missing DELETE Policy on portal_notifications

### Problem
The `ClientNotifications.tsx` page has delete functionality (individual delete and "Delete read" bulk action), but the `portal_notifications` table has no DELETE RLS policy. This causes all delete operations to silently fail.

### Current Policies on `portal_notifications`
- SELECT: `user_id = get_portal_user_id(auth.uid())` -- users see own notifications
- UPDATE: `user_id = get_portal_user_id(auth.uid())` -- users update own notifications
- INSERT: authenticated users can insert
- **DELETE: MISSING**

### Fix
Run a single database migration to add the missing DELETE policy:

```sql
CREATE POLICY "Users delete own notifications"
ON public.portal_notifications
FOR DELETE
TO authenticated
USING (user_id = get_portal_user_id(auth.uid()));
```

### No Code Changes Needed
The frontend code in `ClientNotifications.tsx` already calls `.delete()` correctly -- only the database policy is missing.

