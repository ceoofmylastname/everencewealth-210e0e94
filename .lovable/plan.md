

# Fix: Let Managers Approve Their Agents

## Problem
The "Approve" button on the Contracting Dashboard and Agents page only shows for users with `canManage = true` (admin and contracting roles). Managers cannot see it, even though the backend `approve-agent` function already allows managers to approve their assigned agents.

## Root Cause
In `useContractingAuth.ts`:
- `canManage = effectiveRole === "contracting" || effectiveRole === "admin"`
- Managers are excluded from `canManage`

The dashboard's Actions column and the Agents page's Action column are both gated behind `canManage`, so managers never see the Approve button.

## Solution
Instead of changing `canManage` (which controls other admin-level features), add the Approve button visibility for managers too. Specifically:

### 1. ContractingDashboard.tsx
- Show the Actions column for managers as well (not just `canManage` users)
- The Approve button should appear when `portal_is_active === false` regardless of whether the user is a manager or admin/contracting

### 2. ContractingAgents.tsx
- Same fix: show the Action column and Approve button for managers, not just `canManage` users

### Technical Details

**Files Modified:**

| File | Change |
|---|---|
| `src/pages/portal/advisor/contracting/ContractingDashboard.tsx` | Change the Actions column gate from `canManage` to `canManage \|\| contractingRole === "manager"` so managers see the Approve button for their recruits |
| `src/pages/portal/advisor/contracting/ContractingAgents.tsx` | Same change: gate the Action column on `canManage \|\| contractingRole === "manager"` |

The backend (`approve-agent` edge function) already validates that the caller is the assigned manager or an admin/contracting role, so no backend changes are needed.

