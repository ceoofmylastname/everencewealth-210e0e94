

## Email Verification Fix for Client Signup

### Overview
Two changes are needed: (1) add a "Resend Verification Email" button on the signup success screen, and (2) set the proper `emailRedirectTo` so the verification link brings the user back to the portal login.

### Changes

**1. `src/pages/portal/ClientSignup.tsx`**

- **Add `emailRedirectTo` to signup call** (line 93-96): Pass `options: { emailRedirectTo: window.location.origin + '/portal/login' }` so the verification email link redirects users to the portal login page after confirming.

- **Add "Resend Verification Email" button to the success screen** (lines 170-183):
  - Add state: `resending` (boolean) and `resent` (boolean)
  - Add a `handleResend` function that calls `supabase.auth.resend({ type: 'signup', email: invitation.email })`
  - Show a "Resend Verification Email" button below the existing "Go to Login" button
  - After resending, show a confirmation message ("Verification email sent!") and disable the button for 60 seconds with a countdown to prevent spam
  - Style consistently with the existing dark portal theme (gold accents, glass card)

- **Handle unverified login attempt on PortalLogin.tsx** (line 31-35):
  - When `signInWithPassword` returns an "Email not confirmed" error, show a helpful message: "Please verify your email before signing in. Check your inbox for a verification link."
  - Optionally include a resend link from the login page as well

**2. `src/pages/portal/PortalLogin.tsx`**

- Detect the `?verified=true` query parameter (set by the email redirect) and show a success banner: "Email verified! You can now sign in."
- Improve the error handling to detect unverified email errors specifically and show a more user-friendly message with instructions

### Technical Details

The key function calls:

```typescript
// Signup with redirect
await supabase.auth.signUp({
  email: invitation.email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/portal/login?verified=true`
  }
});

// Resend verification
await supabase.auth.resend({
  type: 'signup',
  email: invitation.email
});
```

### No database or backend changes required
This uses built-in authentication capabilities -- no new tables, edge functions, or secrets needed.

