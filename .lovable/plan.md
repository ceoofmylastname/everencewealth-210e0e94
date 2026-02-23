

# Grant Full Dashboard Access Toggle (Admin)

## Overview

Admins will see a new "Dashboard Access" toggle next to each agent on the Admin Agents page. When enabled, that agent gets full access to all portal tabs -- bypassing the contracting gate -- even if they haven't completed contracting.

## Changes

### 1. Database: Add `dashboard_access_granted` column

Add a new boolean column `dashboard_access_granted` (default `false`) to the `contracting_agents` table. This acts as the admin override flag.

### 2. Update `useContractingGate.ts`

- Include `dashboard_access_granted` in the select query
- Add an early return: if `dashboard_access_granted === true`, the agent is **not gated** (full access)
- This check happens right after confirming a contracting row exists, before any other gating logic

### 3. Update `AdminAgents.tsx`

- When fetching agents, also look up each agent's `contracting_agents` row (joined via `auth_user_id`) to get `dashboard_access_granted` and the contracting agent `id`
- Add a new "Dashboard Access" column to the table with a Switch toggle
- Toggling the switch updates `contracting_agents.dashboard_access_granted` directly
- Show a toast on success/failure
- Only agents who have a `contracting_agents` row will show the toggle; others show a dash or "N/A" (they're already ungated)

## Technical Details

### Database Migration
```sql
ALTER TABLE public.contracting_agents
ADD COLUMN dashboard_access_granted boolean NOT NULL DEFAULT false;
```

### Gate Logic Update (useContractingGate.ts)
The select becomes:
```
.select("id, contracting_role, pipeline_stage, is_licensed, dashboard_access_granted")
```

New early return after line 35 (after checking agent exists):
```
if (agent.dashboard_access_granted) {
  setIsGated(false);
  return;
}
```

### Admin UI (AdminAgents.tsx)
- New column header: "Dashboard"
- For each agent row, cross-reference `contracting_agents` by `auth_user_id` (fetched once on load)
- Render a Switch component that calls `supabase.from("contracting_agents").update({ dashboard_access_granted: value }).eq("auth_user_id", agent_auth_user_id)`
- Agents without a contracting record show "Full" badge (they're regular advisors, always ungated)

### Visual Layout
```text
| Name | Email | Status | Clients | Policies | Dashboard | Actions |
|------|-------|--------|---------|----------|-----------|---------|
| John | j@... | Active |    5    |    3     | [toggle]  | View    |
| Jane | ja@.. | Active |    2    |    1     |   Full    | View    |
```

- Toggle ON = green, agent has full access
- Toggle OFF = agent follows normal contracting gate rules
- "Full" badge = no contracting record, always has access
