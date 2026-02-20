

# Filter Schedule Events by Creator Role

## Problem
Currently, both the **Schedule Page** and the **Advisor Dashboard** show ALL events (admin + agent) to every user. The desired behavior is:

- **Admin-created events** = global, visible to all users
- **Agent-created events** = private, visible only on that agent's own dashboard/schedule

## Changes

### 1. `src/pages/portal/advisor/SchedulePage.tsx` (Schedule page)
Update the `loadEvents` query to only fetch:
- All events where the creator's role is `admin` (global)
- Events created by the current logged-in user (their own agent events)

After fetching, filter client-side using the already-joined `creator.role` data:
```
events where creator.role === 'admin' OR created_by === portalUser.id
```

Since the Supabase JS client doesn't support OR conditions across a join easily, the simplest approach is to keep fetching all events (RLS already scopes this) and filter in JS after the query returns.

### 2. `src/pages/portal/advisor/AdvisorDashboard.tsx` (Dashboard widget)
Apply the same filtering logic to the "Upcoming Events" widget -- only show admin-created events (global) plus the current agent's own events.

### 3. Admin pages remain unchanged
The admin schedule page (`AdminSchedule.tsx`) already shows all events, which is correct since admins need full visibility.

## Technical Details

In both files, after the query returns data, filter with:
```typescript
const filtered = (data ?? []).filter(
  (e: any) => e.creator?.role === 'admin' || e.created_by === portalUser?.id
);
```

This ensures agents see all company-wide admin announcements plus only their own personal events, while keeping the color-coded badges (amber for Admin, emerald for Agent) intact.

