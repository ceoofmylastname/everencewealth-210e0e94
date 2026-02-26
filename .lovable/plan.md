

## Analysis

The system partially supports admin access for approve/delete operations, but there's an inconsistency in the `approve-agent` edge function that prevents contracting admins from approving agents they don't manage.

### Current State
- **Frontend**: Already correctly shows approve/delete buttons for all users with `canApprove` (admins, contracting admins, managers)
- **`delete-contracting-agent` edge function**: Already checks both `portal_users.role = 'admin'` AND `contracting_agents.contracting_role = 'admin'` — works correctly
- **`approve-agent` edge function**: Only checks `portal_users.role` for admin/contracting. Does NOT check `contracting_agents.contracting_role = 'admin'`. This means a user who is a contracting admin but has portal role "advisor" can only approve agents they directly manage, not all agents.

### Changes Required

**File: `supabase/functions/approve-agent/index.ts` (lines 63-79)**

Add a check for the caller's `contracting_role` in the `contracting_agents` table, matching the pattern already used in `delete-contracting-agent`:

```typescript
// Verify caller is manager, admin, or contracting role
const { data: callerPortalUser } = await adminClient
  .from("portal_users")
  .select("id, role")
  .eq("auth_user_id", callerUser.id)
  .maybeSingle();

// Also check contracting_agents for contracting admin role
const { data: callerContracting } = await adminClient
  .from("contracting_agents")
  .select("contracting_role")
  .eq("auth_user_id", callerUser.id)
  .maybeSingle();

const isManager = callerPortalUser && agent.manager_id === callerPortalUser.id;
const isPortalAdmin = callerPortalUser?.role === "admin";
const isContractingAdmin = callerContracting?.contracting_role === "admin";

if (!isManager && !isPortalAdmin && !isContractingAdmin) {
  return new Response(JSON.stringify({ error: "You are not authorized to approve this agent" }), {
    status: 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

### Summary
| What | Where | Status |
|------|-------|--------|
| Delete permission for all admins | `delete-contracting-agent` edge function | Already working |
| Approve permission for all admins | `approve-agent` edge function | Needs fix — add contracting_agents role check |
| Frontend button visibility | `ContractingAgents.tsx` | Already working |

One edge function change. No frontend changes needed.

