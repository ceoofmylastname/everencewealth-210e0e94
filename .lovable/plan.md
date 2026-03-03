

## Add Password Reset for Agents on Contracting Agents Page

### What this does
Adds a "Set Password" button on each agent row in the Contracting Agents page (`/portal/advisor/contracting/agents`), visible only to admins. Clicking it opens a dialog where the admin enters a new password. That password immediately replaces the agent's existing password via the backend — the agent must use the new password going forward.

### Technical approach
Reuse the existing `SetAgentPasswordDialog` component and `update-portal-agent-password` backend function — both already work correctly for this exact use case.

### Changes

#### 1. Update `src/pages/portal/advisor/contracting/ContractingAgents.tsx`
- Add `auth_user_id` to the `AgentRow` interface and populate it from the query data (already fetched on line 107)
- Import `SetAgentPasswordDialog` and `KeyRound` icon
- Add state: `passwordAgent` to track which agent's password dialog is open
- **Desktop table**: Add a key icon button in the Action column (next to Approve/Delete), visible only when `canManage` is true
- **Mobile card**: Add a "Set Password" button in the action area, visible only when `canManage` is true
- Render `SetAgentPasswordDialog` at the bottom, passing the selected agent's `auth_user_id`, name, and email

#### 2. No backend changes needed
The existing `update-portal-agent-password` edge function already:
- Verifies the caller is a portal admin
- Accepts `auth_user_id` + `new_password`
- Uses the service role to call `auth.admin.updateUserById`, which fully replaces the password

### Files to change
- `src/pages/portal/advisor/contracting/ContractingAgents.tsx` — add password button + dialog integration

