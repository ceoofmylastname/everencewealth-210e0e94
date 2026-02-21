

# RLS Security Hardening for Contracting Tables

## Current State Assessment

After reviewing all 10 contracting tables and their existing RLS policies, I found several issues:

### Issues Found

1. **`contracting_reminders`** -- RLS is enabled but has ZERO policies. This table is completely locked out from the client, meaning the analytics dashboard and cron job cannot read/write reminders properly from authenticated users.

2. **Incorrect manager check on 4 tables** -- The `manager_id` column in `contracting_agents` references `portal_users.id`, but several policies compare it against `get_contracting_agent_id(auth.uid())` (which returns a `contracting_agents.id`). This means manager-scoped access is currently broken on:
   - `contracting_activity_logs` (SELECT)
   - `contracting_agent_steps` (SELECT)
   - `contracting_documents` (SELECT)
   - `contracting_messages` (SELECT)

   These should use `get_portal_user_id(auth.uid())` instead.

3. **Missing manager access on some operations**:
   - `contracting_agent_steps` UPDATE -- managers cannot toggle steps for their agents
   - `contracting_documents` INSERT -- managers cannot upload docs for their agents
   - `contracting_carrier_selections` manager check also uses wrong function

4. **`contracting_carrier_selections`** -- Manager subquery compares `manager_id` to `get_contracting_agent_id` (wrong function).

### What Already Works Well

- All 10 tables have RLS enabled
- Agent self-access patterns are correct (using `get_contracting_agent_id`)
- Admin/contracting full-access patterns are consistent
- `portal_admin` fallback is present on all policies
- `contracting_steps` and `contracting_bundles` are correctly open for read (config data)

## Changes

### Database Migration (single SQL migration)

**1. Fix manager checks on `contracting_activity_logs`**
- DROP and recreate SELECT policy to use `get_portal_user_id(auth.uid())` in the manager subquery

**2. Fix manager checks on `contracting_agent_steps`**
- DROP and recreate SELECT policy with correct manager function
- DROP and recreate UPDATE policy to include manager access

**3. Fix manager checks on `contracting_documents`**
- DROP and recreate SELECT policy with correct manager function
- DROP and recreate INSERT policy to include manager uploads

**4. Fix manager checks on `contracting_messages`**
- DROP and recreate SELECT policy with correct manager function

**5. Fix manager checks on `contracting_carrier_selections`**
- DROP and recreate SELECT policy with correct manager subquery

**6. Add policies to `contracting_reminders`**
- SELECT: agent sees own, manager sees assigned agents', admin/contracting sees all
- INSERT: admin/contracting/portal_admin only (system-managed)
- UPDATE: admin/contracting/portal_admin only (system-managed)
- DELETE: admin/contracting/portal_admin only

### No Frontend Changes Needed

All frontend queries already go through Supabase client with the user's auth token, so RLS policies are the enforcement layer. The queries themselves don't need modification -- fixing the policies will automatically scope the data correctly.

## Technical Details

The corrected manager pattern for all policies will be:

```sql
-- Correct: manager_id references portal_users.id
EXISTS (
  SELECT 1 FROM contracting_agents ca
  WHERE ca.id = <table>.agent_id
  AND ca.manager_id = get_portal_user_id(auth.uid())
)

-- Wrong (current): get_contracting_agent_id returns contracting_agents.id
ca.manager_id = get_contracting_agent_id(auth.uid())
```

### Access Matrix After Fix

| Table | Agent (own) | Manager (assigned) | Contracting | Admin |
|---|---|---|---|---|
| contracting_agents | SELECT | SELECT | ALL | ALL |
| contracting_agent_steps | SELECT | SELECT, UPDATE | ALL | ALL |
| contracting_activity_logs | SELECT, INSERT | SELECT | ALL | ALL |
| contracting_documents | SELECT, INSERT | SELECT, INSERT | ALL | ALL |
| contracting_messages | SELECT, INSERT | SELECT | ALL | ALL |
| contracting_carrier_selections | SELECT | SELECT | ALL | ALL |
| contracting_notifications | SELECT, UPDATE, INSERT | -- | ALL | ALL |
| contracting_reminders | SELECT | SELECT | ALL | ALL |
| contracting_steps | SELECT | SELECT | ALL | ALL |
| contracting_bundles | SELECT | SELECT | ALL | ALL |

