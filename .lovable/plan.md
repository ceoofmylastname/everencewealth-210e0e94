

# Manager-Approved Agent Onboarding (Remove Support Code)

## Problem
When a new agent applies and the `portal_users` record isn't found or created properly, the login page shows "Account setup incomplete. Please contact support with code: XXXXXXXX". There's no actual support interface to handle this code, and the flow is confusing.

## Solution
Replace the support-code flow with a **manager approval** system:
1. During intake, create `portal_users` with `is_active = false`
2. Notify the manager that a new recruit needs approval
3. Manager sees pending agents and clicks **Approve**
4. Approval sets `is_active = true`, agent can now log in
5. Login page shows a clear "pending approval" message instead of the cryptic code

## Changes

### 1. Update `contracting-intake` Edge Function
- Change `portal_users` insert to set `is_active: false` instead of `true`
- The agent's auth account is created, but they can't log in until approved

### 2. Update Login Page (`PortalLogin.tsx`)
- Replace the "Account setup incomplete" + support code error with two distinct messages:
  - **No portal_users record at all**: "No account found. If you recently applied, please wait for manager approval."
  - **portal_users exists but `is_active = false`**: "Your account is pending approval from your manager. You'll receive an email once approved."
- Query portal_users without the `is_active = true` filter to distinguish between these two states

### 3. Create `approve-agent` Edge Function
- Accepts `agent_id` (contracting_agents.id)
- Validates the caller is the agent's assigned manager (or admin/contracting role)
- Sets the agent's `portal_users.is_active = true`
- Sends an approval email to the agent via Resend: "Your account has been approved! You can now log in."
- Creates an activity log entry

### 4. Add Approve Button to Manager Dashboard
In `ContractingDashboard.tsx` (the manager/admin view), add an "Approve" button on agent cards/rows where `pipeline_stage = 'intake_submitted'` and the agent's portal_users record has `is_active = false`. Also surface pending approvals in `ContractingAgents.tsx`.

### 5. Add Notification to Manager
The intake edge function already notifies the manager. Update the notification message to explicitly say approval is needed: "New agent [Name] needs your approval to access the portal."

## Technical Details

### New Edge Function: `supabase/functions/approve-agent/index.ts`
- Receives `{ agent_id }` in POST body
- Uses service role to:
  1. Fetch contracting_agents row to get `manager_id` and `auth_user_id`
  2. Verify caller is the manager (compare `get_portal_user_id` from auth token) or has admin/contracting role
  3. Update `portal_users` set `is_active = true` where `auth_user_id` matches
  4. Send approval email via Resend
  5. Log activity in `contracting_activity_logs`

### Files Modified
| File | Change |
|---|---|
| `supabase/functions/contracting-intake/index.ts` | Set `is_active: false` on portal_users insert; update manager notification text |
| `src/pages/portal/PortalLogin.tsx` | Replace support code error with pending-approval message; query portal_users without `is_active` filter |
| `src/pages/portal/advisor/contracting/ContractingDashboard.tsx` | Add "Approve" button on pending agents for managers |
| `src/pages/portal/advisor/contracting/ContractingAgents.tsx` | Show approval status column and approve action |

### New Files
| File | Purpose |
|---|---|
| `supabase/functions/approve-agent/index.ts` | Edge function to approve agent and send notification |

### Flow After Implementation

```text
Agent applies (/apply)
        |
        v
Auth user created + portal_users (is_active=false) + contracting_agents
        |
        v
Manager gets notification: "[Name] needs your approval"
        |
        v
Agent tries to log in --> sees "Pending approval from your manager"
        |
        v
Manager clicks "Approve" on their dashboard
        |
        v
portal_users.is_active = true + approval email sent to agent
        |
        v
Agent can now log in and access onboarding dashboard
```

