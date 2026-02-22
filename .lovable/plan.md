

# Fix Notification 404 Errors

## Problem
When a manager clicks on a notification (e.g., "New Agent Assigned to You"), they get a 404 because:

1. The notification `link` is set to `/portal/advisor/contracting/dashboard` in the intake edge function, but that route does not exist. The actual route is `/portal/advisor/contracting` (no `/dashboard` suffix).
2. The "View all notifications" button at the bottom of the notification popover links to `/portal/client/notifications`, which also does not exist as a route.

## Changes

### 1. Fix notification link in the intake edge function
**File:** `supabase/functions/contracting-intake/index.ts`

Change the notification link from `/portal/advisor/contracting/dashboard` to `/portal/advisor/contracting` so it lands on the actual Contracting Dashboard page.

### 2. Fix "View all notifications" link in NotificationBell
**File:** `src/components/portal/NotificationBell.tsx`

Change the "View all notifications" button from navigating to `/portal/client/notifications` (non-existent) to `/portal/advisor/contracting` for now, since there is no dedicated notifications page. Alternatively, remove the link or route it to a sensible existing page.

### 3. Update existing notifications in the database
Run a quick database migration to fix any already-stored notifications that have the wrong link, updating `/portal/advisor/contracting/dashboard` to `/portal/advisor/contracting`.

## Technical Details

| File | Change |
|---|---|
| `supabase/functions/contracting-intake/index.ts` | Change link value from `/portal/advisor/contracting/dashboard` to `/portal/advisor/contracting` |
| `src/components/portal/NotificationBell.tsx` | Change "View all notifications" route from `/portal/client/notifications` to `/portal/advisor/contracting` |
| Database migration | `UPDATE portal_notifications SET link = '/portal/advisor/contracting' WHERE link = '/portal/advisor/contracting/dashboard';` |

