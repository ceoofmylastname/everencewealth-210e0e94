

# Skip Email Verification for Client Signups

## Problem
When clients sign up via an invitation link, they must verify their email before logging in. Since these clients are already pre-verified through the invitation system (advisor sent them the link), this extra step is unnecessary friction.

## Solution
Two changes are needed:

### 1. Enable Auto-Confirm for Email Signups
Configure the authentication system to automatically confirm email addresses on signup. This means clients can log in immediately after setting their password -- no verification email required.

### 2. Update Client Signup Flow (Auto-Login After Signup)
**File:** `src/pages/portal/ClientSignup.tsx`

Instead of showing the "check your email" success screen after signup, the client will be automatically logged in and redirected to their dashboard. Changes:
- After successful `signUp`, immediately call `signInWithPassword` with the same credentials
- On successful sign-in, redirect to `/portal/client/dashboard`
- Remove the verification email success screen, resend button, and related state
- Remove `emailRedirectTo` option from the signup call (no longer needed)

### 3. Clean Up Login Page Error Message
**File:** `src/pages/portal/PortalLogin.tsx`

The "email not confirmed" error branch (line 37-38) will remain as a safety net but should rarely trigger after this change.

## What Won't Change
- The invitation token validation flow stays the same
- The `handle_new_portal_user` database trigger still fires on signup
- Admin/advisor signup flows are unaffected (they use different paths)
- Password requirements remain the same (min 8 characters)

## Technical Details

### Auth Configuration
Use the `configure-auth` tool to set `enable_signup: true` and `double_confirm_changes: false` with auto-confirm enabled.

### ClientSignup.tsx Changes
- Remove states: `resending`, `resent`, `resendCooldown`
- Remove `handleResend` callback
- Remove the entire success screen (lines 186-253)
- Replace the success flow in `handleSignup` with:
  1. After `signUp` succeeds, call `signInWithPassword({ email, password })`
  2. On success, navigate to `/portal/client/dashboard`
  3. On failure, show error and link to login page

