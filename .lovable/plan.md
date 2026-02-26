

## Plan: Add "Make Manager" Toggle to Contracting Dashboard

### Problem
Admins can only designate agents as managers from the Portal Admin → Agents page. They need to do it from the Contracting Dashboard too, so manager names appear on the public application form.

### How It Works Today
- `portal_users.is_manager` boolean controls manager status
- The `/apply` form calls `list-contracting-managers` edge function which returns users where `role=admin OR is_manager=true`
- The toggle currently lives only in `AdminAgents.tsx`

### Implementation

**File: `src/pages/portal/advisor/contracting/ContractingDashboard.tsx`**

1. **Fetch `is_manager` status** — When loading agents, also fetch each agent's `portal_users.is_manager` via their `auth_user_id` (already fetched for portal active status). Store in a `managerStatusMap`.

2. **Add "Manager" column to spreadsheet table** — Next to the existing "Status" column, add a column with a Switch toggle (admin-only) that shows/sets `is_manager` on the agent's `portal_users` record.

3. **Add "Manager" badge to Kanban cards** — Show a small "Manager" badge on board view cards for agents flagged as managers.

4. **Toggle handler** — `handleToggleManager(agentAuthUserId, newValue)` updates `portal_users.is_manager` where `auth_user_id = agentAuthUserId`, with a success toast confirming the agent will/won't appear on the application form.

### Technical Details

- The `portal_users` query at line ~587 already fetches by `auth_user_id` — extend the select to include `is_manager, id` 
- The toggle updates `portal_users` directly (same pattern as `AdminAgents.tsx` line 216-219)
- Only visible when `canManage` is true (admin/contracting role)
- No database migration needed — `is_manager` column and the edge function already exist

