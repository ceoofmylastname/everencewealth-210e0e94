
## Fix: Agent Creation Foreign Key Error

### Problem
The "Add New Agent" form uses `crypto.randomUUID()` as a placeholder `auth_user_id` when inserting into `portal_users` and `advisors`. Both tables have a foreign key constraint referencing `auth.users(id)`, so the insert fails because that random UUID doesn't exist in auth.

### Solution
Create a backend function that handles the entire agent creation flow server-side using the admin API:

1. Creates a real auth user via `supabase.auth.admin.createUser()` (with a temporary password)
2. Inserts the `portal_users` record with the real auth user ID
3. Inserts the `advisors` record linked to the portal user
4. Sends a password reset email so the agent can set their own password (acts as the invitation)

Then update `AdminAgentNew.tsx` to call this edge function instead of doing direct inserts.

### Technical Details

**New file: `supabase/functions/create-agent/index.ts`**
- Accepts: first_name, last_name, email, phone, agency_id, license_number, specializations, send_invitation
- Verifies the caller is a portal admin
- Uses service role to create auth user with `auth.admin.createUser()`
- Inserts `portal_users` (role: advisor) and `advisors` records with the real auth user ID
- If send_invitation is true, sends a password reset email via `auth.admin.generateLink()` or Resend so the agent can set their password and log in
- Returns success/error

**Modified file: `src/pages/portal/admin/AdminAgentNew.tsx`**
- Replace the two direct `supabase.from().insert()` calls with a single `supabase.functions.invoke("create-agent", { body: form })`
- Handle success/error from the edge function response
