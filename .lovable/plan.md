

# Agent Client Password Management

## What Already Works
- Invitation email IS sent when "Create Invitation" is clicked -- it emails a branded link to `/portal/signup?token=...`
- Client creates their own password during signup
- Client can reset their password via `/portal/forgot-password` (already exists)
- Agent can change their own password at `/portal/advisor/settings` (already exists)

## What's Missing (To Build)

### 1. Agent Can Set a Client's Password
Create a new backend function and UI so agents can set/reset passwords for their own clients (not all clients -- only ones assigned to them).

**New file: `supabase/functions/update-portal-client-password/index.ts`**
- Accepts `portal_user_id` and `new_password`
- Verifies the caller is an advisor and the client belongs to them (via `advisor_id` match)
- Uses `admin.updateUserById()` to set the password

**UI Update: `src/pages/portal/advisor/ClientInvite.tsx`**
- Add a "Set Password" button next to each accepted invitation in the history list
- Opens a dialog (reuse the same pattern as `SetAgentPasswordDialog`) to enter a new password
- Only visible for invitations with status "accepted" (meaning the client already has an account)

### 2. New Component: `SetClientPasswordDialog.tsx`
- Modal with password + confirm fields
- Calls the new `update-portal-client-password` edge function
- Shows success/error feedback via toast

### 3. Fix "Advisor record not found" Issue
The screenshot shows a toast "Advisor record not found" -- this means the current portal user doesn't have a matching row in the `advisors` table. This is a data issue, not a code bug. However, we can improve the error message to be more helpful.

## Technical Details

### Files to Create
- `supabase/functions/update-portal-client-password/index.ts` -- backend function for advisor to set client password
- `src/components/portal/advisor/SetClientPasswordDialog.tsx` -- password dialog component

### Files to Modify
- `src/pages/portal/advisor/ClientInvite.tsx` -- add "Set Password" and "Resend" actions to invitation history items
- `supabase/config.toml` -- register new edge function

### Security
- The backend function verifies the caller is an advisor (via `portal_users` role check)
- It also verifies the target client's `advisor_id` matches the caller's advisor record, so agents can only set passwords for their own clients
- Password minimum 8 characters enforced server-side

