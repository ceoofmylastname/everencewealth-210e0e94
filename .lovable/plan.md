

## Fix: Link Admin Auth Account to Portal

### Problem
The email `jrmenterprisegroup@gmail.com` has an authentication account (ID: `431e15bd-...`), but no matching record in the `portal_users` table. The login flow checks `portal_users` for role and access -- without a record, login is denied with "no-portal-account."

### Fix
Run a single database migration to insert the admin portal_users record:

```sql
INSERT INTO public.portal_users (auth_user_id, role, email, first_name, last_name, is_active)
VALUES (
  '431e15bd-29b2-46cb-a037-83c9162ae1b5',
  'admin',
  'jrmenterprisegroup@gmail.com',
  'Admin',
  'User',
  true
);
```

### After This Fix
1. Go to `/portal/login`
2. Sign in with `jrmenterprisegroup@gmail.com` and your password
3. You will be redirected to `/portal/advisor/dashboard` (admins are routed through the advisor/admin check)
4. You will have access to `/portal/admin/agents`, `/portal/admin/clients`, and all admin pages

### Note
- The first and last name are set to "Admin User" as placeholders -- these can be updated later from the admin profile
- No code changes are needed; only the database record is missing

