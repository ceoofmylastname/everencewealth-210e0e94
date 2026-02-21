
# Enhanced Manager/Admin Contracting Dashboard

## Overview
Replace the current simple `ManagerDashboard` with a comprehensive command center featuring stat cards (including "stuck agents"), a pipeline board view, and a full spreadsheet table view with the requested columns. Checkboxes in the table will trigger step completion automations.

## What Changes

### 1. Stat Cards (4 cards)
- **Total Agents** -- count of all agents (filtered by manager if role=manager)
- **Active Onboarding** -- agents with `status = 'in_progress'`
- **Completed** -- agents with `status = 'completed'`
- **Stuck Agents** -- agents whose `updated_at` is older than 7 days AND status is `in_progress` (no recent activity = stuck)

### 2. Pipeline Board View
Reuse the existing Kanban board pattern from `ContractingPipeline.tsx` -- columns per pipeline stage, agent cards with avatar, progress bar, and days-in-stage indicator. Embedded directly in the dashboard (no separate page needed for quick glance).

### 3. Spreadsheet Table View
Columns:
| Column | Source |
|--------|--------|
| Agent | `contracting_agents.first_name + last_name` |
| Manager | Join `portal_users` via `manager_id` for name |
| Stage | `pipeline_stage` rendered as colored badge |
| Progress | `progress_pct` or computed from steps |
| Bundle | Join `contracting_carrier_selections` to `contracting_bundles.name` (distinct per agent) |
| Carriers | Count of `contracting_carrier_selections` per agent |
| Contracting Status | `status` field (in_progress, completed, on_hold) |
| Last Activity | Most recent `contracting_activity_logs.created_at` per agent |
| Days Stuck | `differenceInDays(now, updated_at)` -- highlighted red when > 7 |
| Checkbox | Toggle current stage step completion (triggers `auto_advance_pipeline_stage`) |

### 4. Checkbox Automations
Each agent row shows a checkbox for their current stage's required step. Clicking it:
1. Updates `contracting_agent_steps` status to `completed`, sets `completed_by` and `completed_at`
2. The existing `auto_advance_pipeline_stage` trigger fires automatically
3. Logs an activity entry
4. UI refreshes via data refetch

Only visible to users with `canManage` permission (contracting/admin roles).

### 5. View Toggle
Board/Table toggle (already exists in Pipeline page pattern) -- reused with the same icon buttons.

## Technical Details

### File Modified
`src/pages/portal/advisor/contracting/ContractingDashboard.tsx` -- the `ManagerDashboard` component (lines 376-546) will be replaced.

### Data Fetching
The component will run parallel queries:
- `contracting_agents` (all columns, filtered by manager_id if manager-only)
- `portal_users` (id, first_name, last_name) for manager name resolution
- `contracting_carrier_selections` (agent_id, bundle_id, carrier_id, status) with bundle name join
- `contracting_bundles` (id, name) for bundle name lookup
- `contracting_steps` (all) for step definitions
- `contracting_agent_steps` (agent_id, step_id, status) for progress and checkbox state
- `contracting_activity_logs` (agent_id, created_at) for last activity per agent

### Stuck Logic
An agent is "stuck" when:
- `status = 'in_progress'`
- `updated_at < now() - 7 days`

Stat card will show count and use a red/warning color. In the table, the "Days Stuck" column highlights in red when > 7.

### Checkbox Step Completion
For each agent row, find the current stage's step from `contracting_steps`, check its status in `contracting_agent_steps`:
- If pending, show unchecked checkbox
- If completed, show checked (disabled)
- On check: `UPDATE contracting_agent_steps SET status='completed', completed_at=now()` then insert activity log, then refetch

### No Database Changes Required
All required tables, triggers, and columns already exist. The `auto_advance_pipeline_stage` trigger handles pipeline advancement automatically when steps are marked complete.
