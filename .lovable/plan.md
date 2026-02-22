

# Real-Time Manager Dashboard Updates

## Problem
The Manager Dashboard fetches all data once when the page loads and never updates again. There are no real-time subscriptions, so when an agent signs their agreement, advances stages, clicks videos, or uploads screenshots, the manager sees nothing until they manually refresh the page.

## Solution
Add real-time database subscriptions to the Manager Dashboard so it automatically refreshes whenever agent data changes. Also enable realtime on the tables that don't have it yet.

## Changes

### 1. Database Migration: Enable Realtime on Missing Tables

Enable realtime on `contracting_agents` and `contracting_activity_logs` so changes to these tables can be broadcast to subscribed clients.

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracting_agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracting_activity_logs;
```

### 2. Add Real-Time Subscriptions to ManagerDashboard

In `ContractingDashboard.tsx`, inside the `ManagerDashboard` component, add a new `useEffect` that subscribes to three channels:

- **contracting_agents** (any UPDATE/INSERT) -- catches stage changes, progress updates, status changes
- **contracting_agent_steps** (any INSERT/UPDATE) -- catches step completions (agreement signed, SureLC uploaded, etc.)
- **contracting_activity_logs** (any INSERT) -- catches new activities (video clicks, uploads, logins)

When any of these events fire, the dashboard calls `fetchAll()` to refresh all data. A short debounce (500ms) prevents rapid-fire refetches when multiple changes happen at once (e.g., step completion triggers both a step update and a stage change).

The subscription cleans up on unmount.

### What the Manager Will See Update in Real Time

| Agent Action | What Updates on Dashboard |
|---|---|
| Signs in / logs in | Last Activity column updates |
| Signs Agent Agreement | Stage changes from "Intake Submitted" to "Agreement Pending", progress bar advances |
| Reaches SureLC Setup | Stage changes to "SureLC Setup" |
| Clicks video links | Last Activity updates (tracked in activity logs) |
| Uploads SureLC screenshot | Progress bar advances, step completion registered |
| Completes onboarding celebration | Stage advances, progress updates |
| Any stage/step change | Stats cards (Active, Completed, Stuck) update automatically |

### Technical Details

**File modified:** `src/pages/portal/advisor/contracting/ContractingDashboard.tsx`

The new `useEffect` will be added right after the existing `fetchAll` useEffect (around line 538):

```text
useEffect(() => {
  let debounceTimer: NodeJS.Timeout;
  const debouncedFetch = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchAll(), 500);
  };

  const channel = supabase
    .channel('manager-dashboard-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'contracting_agents' }, debouncedFetch)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'contracting_agent_steps' }, debouncedFetch)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contracting_activity_logs' }, debouncedFetch)
    .subscribe();

  return () => {
    clearTimeout(debounceTimer);
    supabase.removeChannel(channel);
  };
}, [portalUserId, isManagerOnly]);
```

No new dependencies, no new components. Just wiring up the existing `fetchAll()` to real-time events.
