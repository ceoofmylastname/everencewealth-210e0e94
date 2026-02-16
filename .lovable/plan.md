

# Phase 7.10: Enhanced Schedule/Events Calendar

## Overview
Rebuild the Schedule page with a Dialog-based event creation form, grouped event display by date, type-specific icons, and an improved empty state -- matching the pattern from the reference code.

## No Database Migration Needed
The `schedule_events` table already has all required columns: `title`, `description`, `event_date`, `event_time`, `event_type`, `created_by`, `is_recurring`, `recurrence_rule`.

## Changes

### Rebuild `src/pages/portal/advisor/SchedulePage.tsx`

**1. Header with Add Event Dialog:**
- Title "Schedule & Events" and subtitle (Playfair Display heading)
- "Add Event" button opening a Dialog with fields: Title, Description (Textarea), Date, Time (two-column row), and Type (select dropdown with meeting/training/webinar/call/other)
- On submit: look up `portal_user_id` via `usePortalAuth`, then find advisor record, insert into `schedule_events` with `created_by` set to portal user id
- Toast on success/failure, reset form, reload events

**2. Event Type Styling:**
- Icon mapping: training/webinar use Video, call uses Users, default uses Calendar
- Color mapping: training = blue, webinar = purple, call = green, meeting = yellow/amber, other = gray

**3. Grouped Event List:**
- Group events by `event_date` using reduce
- Each date group shows a formatted date heading (e.g., "Monday, February 16, 2026")
- Individual event cards with: type icon in a colored container, title, time with Clock icon, type Badge, and description

**4. Empty State:**
- Calendar icon with "No upcoming events" message and helper text

**5. Loading State:**
- Existing spinner pattern

## Technical Details

- **Auth**: Use `usePortalAuth` hook to get `portalUser`, use `portalUser.id` as `created_by` (schedule_events references portal_users)
- **New imports**: Add `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`; add `Textarea`; add `Video`, `Users`, `Plus` from lucide-react; add `usePortalAuth`; add `toast` from sonner
- **Remove**: date filter Input replaced by grouped display showing all upcoming events
- **State**: `events` array, `loading` boolean, `showAddDialog` boolean, `newEvent` form object
- **Data fetch**: Keep existing query pattern (gte today, order by date then time)
- **Event grouping**: Client-side reduce to group by `event_date`, then iterate `Object.entries` for rendering

