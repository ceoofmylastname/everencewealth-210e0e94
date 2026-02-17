

# Pending Agents Tab, Admin Password Set, and Agent Password Change

## Overview
Three features to add:
1. A "Pending" tab on the Admin Agents page showing agents who haven't logged in yet
2. Admin ability to set a password for any agent
3. Agents can change their own password from the advisor portal

## Implementation

### 1. Add Tabs to Admin Agents Page (`src/pages/portal/admin/AdminAgents.tsx`)
- Add Tabs component (All Agents / Pending Invitations)
- "All Agents" tab shows the current agent table
- "Pending Invitations" tab queries advisors and cross-references with `auth.users.last_sign_in_at` via a new edge function to identify agents who have never logged in
- Pending tab shows: name, email, date invited, with options to "Resend Invitation" and "Set Password"

### 2. Create Edge Function: `get-pending-agents` 
New backend function that:
- Queries all portal advisors
- Uses the service role key to check `auth.users.last_sign_in_at`
- Returns agents where `last_sign_in_at` is null (never logged in = pending)
- Only accessible by portal admins

### 3. Create Edge Function: `update-portal-agent-password`
New backend function that:
- Accepts `auth_user_id` and `new_password`
- Verifies the caller is a portal admin
- Uses `supabase.auth.admin.updateUserById()` to set the password
- Validates minimum 8 characters

### 4. Admin Set Password Dialog (`src/components/portal/admin/SetAgentPasswordDialog.tsx`)
- Modal dialog with password input and confirmation
- Calls the `update-portal-agent-password` edge function
- Shows success/error feedback

### 5. Resend Invitation
- Add a "Resend" button on pending agents that calls the existing `create-agent` function logic, or simply re-generates a recovery link and sends via Resend

### 6. Agent Change Password Page (`src/pages/portal/AdvisorSettings.tsx`)
- New "Settings" page under `/portal/advisor/settings`
- Contains a "Change Password" form (current password not required since we use `supabase.auth.updateUser`)
- Fields: New Password, Confirm Password
- Calls `supabase.auth.updateUser({ password })` directly (client-side, no edge function needed)

### 7. Add Settings nav item and route
- Add "Settings" to the `advisorNav` array in `PortalLayout.tsx`
- Add the route in `App.tsx` under the advisor routes

## Technical Details

### Files to Create
- `supabase/functions/get-pending-agents/index.ts` -- fetches agents with null `last_sign_in_at`
- `supabase/functions/update-portal-agent-password/index.ts` -- admin sets agent password
- `src/components/portal/admin/SetAgentPasswordDialog.tsx` -- password set dialog
- `src/pages/portal/AdvisorSettings.tsx` -- agent settings page with password change

### Files to Modify
- `src/pages/portal/admin/AdminAgents.tsx` -- add tabs (All / Pending), pending table, resend + set password actions
- `src/components/portal/PortalLayout.tsx` -- add "Settings" nav item
- `src/App.tsx` -- add `/portal/advisor/settings` route

### Edge Function: `get-pending-agents`
- Verifies caller is portal admin via `portal_users` table
- Queries `advisors` table joined with auth user data
- Returns list with: id, auth_user_id, first_name, last_name, email, created_at, has_logged_in (boolean)

### Edge Function: `update-portal-agent-password`
- Verifies caller is portal admin
- Looks up the advisor by `auth_user_id` in the `advisors` table
- Calls `supabase.auth.admin.updateUserById(auth_user_id, { password })`
- Returns success/failure

### Pending Agents Tab UI
- Table columns: Name, Email, Invited Date, Actions
- Actions: "Set Password" button (opens dialog), "Resend Invite" button
- Badge showing count of pending agents on the tab

### Agent Settings Page
- Simple form with New Password and Confirm Password fields
- Uses `supabase.auth.updateUser({ password: newPassword })` (works for the currently logged-in user)
- Success redirects or shows toast confirmation

