

## Fix Password Reset Redirect + Build Errors

### Problem
When the user clicks the password reset link in the email, they're redirected to the homepage instead of `/portal/reset-password`. Auth logs confirm the `/verify` endpoint returns a 303, but the redirect lands on the root URL.

**Root cause**: The `redirectTo` URL (`https://everencewealth.lovable.app/portal/reset-password`) is likely not in the allowed redirect URLs list in the auth configuration. When Supabase can't match the redirect URL, it falls back to the Site URL (homepage).

### Plan

#### 1. Add allowed redirect URLs to auth configuration
- Use the auth configuration tool to add these redirect URL patterns:
  - `https://everencewealth.lovable.app/portal/reset-password`
  - `https://id-preview--29324b25-4616-48ca-967b-28e362789bf6.lovable.app/portal/reset-password`
  - Wildcard patterns for both domains (`/**`) to cover future routes

#### 2. Fix build errors in `process-email-queue/index.ts`
The TypeScript errors are caused by type inference issues with the Supabase client. Fix by:
- Adding explicit `any` type cast for `supabase.from('email_send_log').insert(...)` calls
- Adding explicit `any` type cast for `supabase.rpc('move_to_dlq', ...)` calls
- Adding explicit types for the `msg` and `id` parameters in the `.map()` and `.filter()` callbacks
- Casting `supabase` parameter type in `moveToDlq` function to accept the actual client type

#### 3. Verify the fix
- Trigger a new password reset for the test email
- Confirm the reset link redirects to `/portal/reset-password` instead of the homepage

### Files to modify
- Auth configuration (redirect URLs) — via configuration tool
- `supabase/functions/process-email-queue/index.ts` — fix TypeScript type errors (~5 lines changed)

