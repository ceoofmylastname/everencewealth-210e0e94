
# Role-Based Contracting Dashboard

## Summary
Split the Contracting Dashboard into two distinct views based on role: agents see only their personal onboarding progress, while admins/managers/contracting staff see the existing multi-agent overview with stats and pipeline breakdown.

## What Changes

### 1. Agent Dashboard View (new)
When the logged-in user has `contracting_role = 'agent'`, the dashboard shows:

- **Personal welcome header** with their name and current pipeline stage badge
- **Progress card** showing their overall checklist completion (X of Y steps done) with a progress bar
- **Current stage checklist** showing steps in their current pipeline stage with completion status
- **Personal info card** with their email, phone, role, and start date
- **Their recent activity feed** filtered to only their own activity logs
- No stat cards, no pipeline breakdown, no "Add Agent" or "View Pipeline" buttons

### 2. Admin/Manager/Contracting Dashboard View (existing, scoped)
When the user is admin, manager, or contracting role:

- Keep the existing layout: stat cards, pipeline breakdown, recent activity, action buttons
- **Managers**: the data query already respects RLS (managers only see agents assigned to them), so stat counts and activity logs will naturally scope to their agents
- **Admins/Contracting**: see all agents as before

### 3. Hook Enhancement
Add the agent's `contractingAgent` data to the dashboard component to determine which view to render. The `useContractingAuth` hook already returns `contractingAgent` and `contractingRole` -- just need to use them.

## Technical Details

### File: `src/pages/portal/advisor/contracting/ContractingDashboard.tsx`

The component will branch on `contractingRole`:

```text
if contractingRole === 'agent':
  - Fetch own agent record (already available from useContractingAuth)
  - Fetch own agent_steps from contracting_agent_steps (RLS scoped)
  - Fetch own activity_logs from contracting_activity_logs (RLS scoped)
  - Fetch master steps from contracting_steps
  - Render: Welcome header, progress bar, current stage checklist, personal info, own activity

else (manager/contracting/admin):
  - Keep existing fetchData() logic (stats, pipeline breakdown, all activities)
  - Render: Existing stat cards, pipeline chart, recent activity, action buttons
```

### Rendering Logic

**Agent view sections:**
1. Welcome banner: "Welcome back, {first_name}" with stage badge and status badge
2. Progress card: circular or bar progress showing completed/total steps
3. Current stage steps: grouped checklist for their active pipeline_stage only (read-only toggles since agents cannot manage)
4. Upcoming stages: collapsed list of remaining stages with step counts
5. Personal details card: email, phone, start date
6. My activity feed: last 10 activity logs for their agent_id

**Manager/Admin view:** unchanged from current implementation.

### No database changes needed
RLS policies already scope data correctly per role. The dashboard just needs to render different UI based on the role.
