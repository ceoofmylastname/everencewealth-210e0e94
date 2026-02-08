
# Fix: Agent Deletion vs. Re-creation Conflict

## Problem Summary

The agent with email `info@delsolprimehomes.com` still exists in the database with `is_active: false`. The current "delete" function only performs a **soft delete**, but the "create" function blocks any email that already exists, regardless of active status.

---

## Solution

Update the `create-crm-agent` edge function to handle inactive agents properly. Two options:

### Option A: Allow Reactivation of Inactive Agents (Recommended)

When creating an agent with an email that exists but is inactive, **reactivate** the existing record instead of blocking.

| File | Change |
|------|--------|
| `supabase/functions/create-crm-agent/index.ts` | Update duplicate check to only block **active** agents, and reactivate inactive ones |

**Logic:**
```typescript
// Check if agent record already exists
const { data: existingAgent } = await supabaseAdmin
  .from("crm_agents")
  .select("id, is_active")
  .eq("email", body.email)
  .single();

if (existingAgent) {
  if (existingAgent.is_active) {
    // Block if already active
    return error "An agent with this email already exists"
  } else {
    // Reactivate the inactive agent with new data
    UPDATE the existing record with new values and set is_active: true
    // Optionally update their auth password
  }
}
```

### Option B: Hard Delete Inactive Agents First

Before checking for duplicates, delete any inactive agent with the same email.

---

## Implementation Details

**Changes to `create-crm-agent/index.ts`:**

1. Modify the existing agent check to include `is_active` in the select
2. If an agent exists but is inactive:
   - Update the existing record with new details (name, phone, role, etc.)
   - Set `is_active: true`
   - Update or create auth user with new password
   - Send welcome email
3. If an agent exists and is active: block as before

---

## Immediate Fix (Optional)

For the current `info@delsolprimehomes.com` issue, I can also run a database query to hard-delete the inactive record so you can create a fresh agent.

---

## Files to Modify

| File | Action |
|------|--------|
| `supabase/functions/create-crm-agent/index.ts` | Update to handle inactive agents |
