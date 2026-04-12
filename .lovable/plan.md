

## Reset Password for Admin Account

The account `jrmenterprisegroup@gmail.com` already exists and has full admin access (confirmed in `user_roles` and `admin_email_whitelist`). The login failures are because the stored password doesn't match `Password123!`.

### What I'll do

1. **Create a small edge function** (`reset-admin-password`) that uses the Supabase Admin API to update the user's password to `Password123!`
2. **Invoke it once** to reset the password
3. **Delete the edge function** immediately after — it should not persist

This is the only way to programmatically reset a password in Lovable Cloud without going through the email recovery flow.

### After completion
You'll be able to sign in at `/auth` with:
- **Email:** jrmenterprisegroup@gmail.com
- **Password:** Password123!

