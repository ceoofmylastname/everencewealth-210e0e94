

## Client Notifications List Page

### Overview
Create a full-page notifications view at `/portal/client/notifications` that shows all notifications with filtering, mark-as-read, and delete capabilities. The existing `NotificationBell` popover will also get a "View all" link to this page.

### No Database Changes Required
The `portal_notifications` table already exists with the needed columns: `id`, `user_id`, `title`, `message`, `notification_type`, `link`, `read`, `created_at`. RLS policies are already in place. Delete operations will use the existing RLS rules.

### Files to Create

**1. `src/pages/portal/client/ClientNotifications.tsx`**

Full-page notification center with:

- **Header**: "Notifications" title with unread count badge, "Mark all as read" button
- **Filter bar**: Tabs or dropdown to filter by notification type (All, Policy Updates, Documents, Messages, System) -- mapped from `notification_type` column values
- **Notification list**: Each item shows:
  - Unread indicator dot
  - Title and message
  - Relative timestamp (using `formatDistanceToNow` from date-fns)
  - Click to navigate if `link` is set, and mark as read
  - Delete button (trash icon) per notification
- **Empty state**: Bell icon with "No notifications" message
- **Bulk actions**: "Mark all as read" and "Delete all read" buttons

Data fetching -- all notifications (no limit 20 like the bell):
```typescript
const { data } = await supabase
  .from("portal_notifications")
  .select("*")
  .eq("user_id", portalUser.id)
  .order("created_at", { ascending: false });
```

Delete uses:
```typescript
await supabase.from("portal_notifications").delete().eq("id", id);
```

### Files to Modify

**2. `src/App.tsx`**
- Add lazy import: `const ClientNotifications = lazy(() => import("./pages/portal/client/ClientNotifications"));`
- Add route inside client block (after line 351): `<Route path="notifications" element={<ClientNotifications />} />`

**3. `src/components/portal/NotificationBell.tsx`**
- Add a "View all notifications" link at the bottom of the popover that navigates to `/portal/client/notifications`

### Styling
- Follows existing portal patterns: Card components, muted foreground text, consistent spacing
- Responsive layout with proper mobile support
- Uses existing UI components (Button, Badge, Tabs)
