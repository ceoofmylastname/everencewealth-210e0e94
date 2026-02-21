

# Show Manager's Own Recruits on Contracting Dashboard & Pipeline

## Problem
When a new recruit selects a manager on the `/apply` form, the `manager_id` is saved to `contracting_agents`. However, the Contracting Dashboard and Pipeline pages do not filter by `manager_id` -- they either show all agents (for admin/contracting roles) or nothing. Managers cannot see which recruits selected them.

## Solution
Update the Dashboard and Pipeline queries so that **managers** only see agents where `manager_id` matches their own `portal_users.id`. Admins and contracting roles continue to see all agents.

## Changes

### 1. `src/pages/portal/advisor/contracting/ContractingDashboard.tsx`
- In the `ManagerDashboard` component's `fetchData()`, pass down the current user's portal user ID
- If the user's role is `manager` (not admin/contracting), add `.eq("manager_id", portalUserId)` to the `contracting_agents` query
- Same filter on the activity logs query (join through agent_id)

### 2. `src/pages/portal/advisor/contracting/ContractingPipeline.tsx`
- Same pattern: if role is `manager`, filter `contracting_agents` by `manager_id` matching the logged-in user's portal user ID
- Admins/contracting roles continue to see all agents

### 3. `src/pages/portal/advisor/contracting/ContractingDocuments.tsx`
- Apply the same manager-scoped filter when listing documents/agents

### 4. Pass portal user context
- The `useContractingAuth` hook already provides `portalUser` (which has the portal user's `id` and `role`)
- The Dashboard/Pipeline components will use `portalUser.id` as the manager filter value and `canManage` vs `canViewAll` to decide whether to scope

### How it works end-to-end

```text
Recruit fills /apply form
  --> selects "Boob S." (portal_users.id = abc123)
  --> contracting_agents row created with manager_id = abc123

Boob S. logs in, opens Contracting Dashboard
  --> query: SELECT * FROM contracting_agents WHERE manager_id = abc123
  --> sees only their recruits in stats + pipeline
```

No database changes needed -- `manager_id` already references `portal_users(id)` correctly.

