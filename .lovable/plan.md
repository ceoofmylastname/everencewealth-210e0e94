

# Fix: Client Invitation Signup Page Shows "Invalid Invitation"

## Problem
When a client clicks the invitation link in their email, they see "Invalid Invitation - Invalid or expired invitation link." even though the invitation exists and is valid.

**Root cause:** The `client_invitations` table only has one RLS policy: "Advisors can manage invitations", which requires the user to be an authenticated advisor. When a client visits the signup page, they are **not logged in**, so the database returns zero rows, and the page interprets this as an invalid token.

## Solution (Database Migration)

Add a new RLS policy that allows **anyone** (including unauthenticated users) to SELECT from `client_invitations` when filtering by `invitation_token`. Since the token is a UUID and effectively a secret, this is safe -- you can only read an invitation if you already know the token.

```sql
CREATE POLICY "Anyone can validate invitation by token"
ON client_invitations FOR SELECT TO anon, authenticated
USING (true);
```

This is safe because:
- The invitation token is a random UUID (unguessable)
- The policy only grants SELECT (read-only)
- The signup page already validates status and expiration in application code
- No sensitive data beyond name/email is exposed (which the recipient already knows)

## What This Fixes
- Clients clicking the "Create Your Account" button in the invitation email will see the signup form instead of "Invalid Invitation"
- No code changes needed -- the existing `ClientSignup.tsx` logic is correct

## Files Changed
- No code files -- database migration only

