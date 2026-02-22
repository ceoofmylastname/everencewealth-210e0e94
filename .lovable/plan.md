

# Fix: Allow Agent Agreement to Sign and Save

## Problem
When an agent signs the agreement and clicks submit, they get: **"new row violates row-level security policy for table contracting_agent_steps"**

The INSERT policy on `contracting_agent_steps` only allows `contracting` and `admin` roles. Agents cannot mark their own steps as completed.

## Solution

### 1. Update RLS Policy on `contracting_agent_steps`
Add a new INSERT policy (or modify the existing one) to allow agents to insert rows for their own `agent_id`:

```sql
-- Allow agents to insert their own step records
CREATE POLICY "agents_can_insert_own_steps"
ON public.contracting_agent_steps
FOR INSERT TO authenticated
WITH CHECK (agent_id = get_contracting_agent_id(auth.uid()));
```

This is safe because:
- Agents can only insert rows where `agent_id` matches their own ID
- The existing UPDATE policy already allows agents to update their own rows
- The `auto_advance_pipeline_stage` trigger handles the pipeline progression server-side

### 2. No Code Changes Needed
The `AgentAgreementForm` component code is already correct. Once the RLS policy is fixed, the existing sign-and-submit flow will work end-to-end.

## Technical Details

| Item | Detail |
|---|---|
| Root cause | INSERT policy on `contracting_agent_steps` excludes agent role |
| Fix | Add new INSERT policy allowing agents to insert own rows |
| Risk | Low -- agents already have UPDATE on own rows; INSERT is consistent |
| Files changed | Database migration only (no code changes) |

