

## Enhanced Client Notifications Page

### What Already Exists
The page at `src/pages/portal/client/ClientNotifications.tsx` is already routed at `/portal/client/notifications` and has basic functionality: fetching, filtering by type, mark as read, mark all read, delete, and empty state. The `NotificationBell` component already links to this page.

### Enhancements to `src/pages/portal/client/ClientNotifications.tsx`

**1. Add Realtime Subscription**
- Subscribe to `postgres_changes` on `portal_notifications` for `INSERT` events filtered by the client's `user_id`
- New notifications appear instantly at the top of the list
- Clean up channel on unmount (same pattern as `NotificationBell`)

**2. Add Type-Based Icons**
- `document` type: FileText icon
- `message` type: MessageSquare icon
- `policy` type: Shield icon
- `system` type: Settings icon
- Default: Bell icon
- Each icon gets a colored background circle for visual distinction

**3. Add "Unread" Filter Tab**
- Update TYPE_FILTERS to include `{ value: "unread", label: "Unread" }` between "All" and "Documents"
- Filter logic: when "unread" is selected, show only notifications where `read === false`

**4. Add Date Grouping**
- Group notifications by: Today, Yesterday, This Week, Older
- Each group gets a sticky date header label
- Uses `isToday`, `isYesterday`, `isThisWeek` from date-fns

**5. Add Pagination (Load More)**
- Initial fetch limited to 20 notifications
- "Load More" button at bottom fetches next 20 using `.range()` offset
- Button hidden when all notifications are loaded
- Track `hasMore` state based on whether the fetch returned a full page

**6. Apply Everence Brand Styling**
- Page background: Cream (#F0F2F1) via wrapper div
- Unread notifications: Light evergreen background (#E8F2EF) instead of generic `bg-primary/5`
- Read notifications: White background
- Hover state: border highlight with `hover:border-[#1A4D3E]/20`
- Page title color: Evergreen (#1A4D3E)
- Empty state icon: CheckCircle instead of Bell, with "You're all caught up!" message

### No Changes Needed
- **NotificationBell**: Already links to `/portal/client/notifications` -- no modifications required
- **Routing**: Already registered in `App.tsx`
- **Database**: No schema or RLS changes needed

### Technical Details
- Imports added: `FileText`, `MessageSquare`, `Shield`, `Settings`, `CheckCircle` from lucide-react
- Imports added: `isToday`, `isYesterday`, `isThisWeek` from date-fns
- Realtime channel name: `"client-notifications-page"` (distinct from the bell's channel)
- Pagination uses Supabase `.range(offset, offset + 19)` for cursor-based loading

