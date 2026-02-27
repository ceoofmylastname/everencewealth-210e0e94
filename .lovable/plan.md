

## Plan: Fix Admin & Manager Messaging in Contracting

### Root Cause

David and Steven (portal admins) have **no `contracting_agents` row**. The auto-provisioning code in `ContractingMessages.tsx` is failing silently — likely a race condition between `useContractingAuth` loading state and the provision effect. Without a `contracting_agents` row, `myAgentId` is null → the send handler silently exits.

Additionally, **managers cannot initiate conversations** because the "+ New Message" button is gated behind `canManage`, which is only true for admin/contracting roles — not managers.

### Fix

**File: `src/pages/portal/advisor/contracting/ContractingMessages.tsx`**

1. **Make auto-provisioning more robust** — Move the provision logic to run immediately after auth loads, with explicit error logging and a retry mechanism. Use `session?.user` directly from `usePortalAuth` instead of calling `supabase.auth.getSession()` again (avoids race condition).

2. **Show "+ New Message" for managers too** — Change the condition from `canManage` to `canManage || isManagerOnly` so managers can initiate conversations with their assigned agents.

3. **Filter manager's agent options** — When a manager clicks "+ New Message", only show agents whose `manager_id` matches the manager's `portal_users.id` (not all agents).

4. **Add better error feedback** — If auto-provisioning fails, show a toast instead of just console.error.

5. **Seed missing admin rows now** — Run a one-time migration to insert `contracting_agents` rows for David and Steven so they don't have to wait for auto-provisioning.

### Database Migration

```sql
INSERT INTO contracting_agents (auth_user_id, first_name, last_name, email, contracting_role, pipeline_stage, status)
SELECT pu.auth_user_id, pu.first_name, pu.last_name, pu.email, 'admin', 'completed', 'active'
FROM portal_users pu
WHERE pu.role = 'admin' AND pu.auth_user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM contracting_agents ca WHERE ca.auth_user_id = pu.auth_user_id
);
```

### Files
- `src/pages/portal/advisor/contracting/ContractingMessages.tsx` — fix auto-provision timing, enable "+ New Message" for managers, filter agent options for managers
- Database migration — seed missing admin contracting_agents rows

