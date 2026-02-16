

## Password Reset Flow for Portal

### Overview
Add a complete password reset flow to the Everence Wealth portal: a "Forgot Password?" link on the login page, a page to request the reset email, and a page to set the new password after clicking the email link.

### Files to Create

**1. `src/pages/portal/PortalForgotPassword.tsx`**
- Matches existing portal dark theme (bg `hsl(215,28%,10%)`, glass card, gold accents)
- Single email input form
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/portal/reset-password' })`
- Shows success message after submission ("Check your email for a reset link")
- "Back to Sign In" link to `/portal/login`

**2. `src/pages/portal/PortalResetPassword.tsx`**
- Same dark portal styling
- New password + confirm password inputs with show/hide toggles
- On mount: listens for `PASSWORD_RECOVERY` event via `supabase.auth.onAuthStateChange`
- On submit: calls `supabase.auth.updateUser({ password })`
- Client-side validation: minimum 8 characters, passwords must match
- On success: redirects to `/portal/login` with a success message

### Files to Modify

**3. `src/pages/portal/PortalLogin.tsx`**
- Add a "Forgot Password?" link between the password field and the error message area
- Links to `/portal/forgot-password`
- Styled as subtle text link (`text-white/50 hover:text-[hsl(42,50%,55%)]`)

**4. `src/App.tsx`**
- Add two new public routes in the portal routes section (around line 315-316):
  - `<Route path="/portal/forgot-password" element={<PortalForgotPassword />} />`
  - `<Route path="/portal/reset-password" element={<PortalResetPassword />} />`
- Add lazy imports for both new pages

### No database changes required
The password reset is handled entirely by the built-in authentication system.

### User Flow
1. User clicks "Forgot Password?" on login page
2. Enters email on `/portal/forgot-password`
3. Receives reset email with link to `/portal/reset-password`
4. Sets new password and is redirected to login
5. Signs in with new password

