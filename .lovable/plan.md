

## Problem

`jrmenterprisegroup@gmail.com` is a portal admin with **no row in `contracting_agents`**. The `useContractingAuth` hook correctly grants them `effectiveRole = 'admin'` via the portal role fallback, so contracting nav items are visible. However, contracting sub-pages (Messages, Pipeline, etc.) rely on `contractingAgent.id` for queries — which is `null` — causing empty/broken views.

## Solution

Two-part fix:

### 1. Create a `contracting_agents` row for this admin
Insert a record with `contracting_role = 'admin'` so all contracting pages can resolve their identity.

**Database change:**
```sql
INSERT INTO contracting_agents (auth_user_id, first_name, last_name, email, contracting_role, pipeline_stage, status, is_licensed)
SELECT 
  '431e15bd-29b2-46cb-a037-83c9162ae1b5',
  pu.first_name,
  pu.last_name,
  pu.email,
  'admin',
  'completed',
  'active',
  true
FROM portal_users pu
WHERE pu.auth_user_id = '431e15bd-29b2-46cb-a037-83c9162ae1b5'
ON CONFLICT DO NOTHING;
```

### 2. Harden contracting pages for admin users without a `contracting_agents` row
Update `ContractingMessages.tsx` (and similar pages) to handle `contractingAgent = null` gracefully when the user has admin-level `canViewAll` access — querying all threads instead of filtering by a missing agent ID. This prevents the issue from recurring for future admin accounts.

**Files to update:**
- `src/pages/portal/advisor/contracting/ContractingMessages.tsx` — use `canViewAll` flag to fetch all threads when `contractingAgent` is null
- Audit other contracting pages for same null-guard pattern

