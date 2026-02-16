

## Fix: Portal Login "No Portal Account" - Comprehensive Resolution

### What's Wrong
The `portal_users` table is completely empty. The admin user (`jrmenterprisegroup@gmail.com`, auth ID `431e15bd-29b2-46cb-a037-83c9162ae1b5`) exists in authentication but has no matching portal record, so login is denied.

### What's Already Working
- RLS policy "Portal users can view own record" already exists on `portal_users` (uses `auth_user_id = auth.uid()`) -- no additional SELECT policy needed
- Login flow logic in `PortalLogin.tsx` is correct
- Signup flow in `ClientSignup.tsx` already creates portal_users records for invited clients

### Plan (in priority order)

#### Step 1: Insert Admin Portal Record (Database)
Insert the missing admin record into `portal_users`:
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

#### Step 2: Add Auto-Creation Trigger (Database Migration)
Create a trigger on `auth.users` that automatically creates a `portal_users` record when a new user signs up via invitation. This prevents future orphaned users.

- Creates function `handle_new_portal_user()` that checks `client_invitations` for a matching pending invitation
- If invitation found: creates a client portal_users record linked to the advisor and marks invitation as accepted
- If no invitation found: does nothing (prevents random signups from getting portal access)
- Attaches trigger to `auth.users` AFTER INSERT

#### Step 3: Improve Login Error Messages (Code Change)
Update `PortalLogin.tsx` to show a more actionable error message that includes a truncated user ID for support reference, instead of the generic "no portal account" message.

#### Step 4: Skip Fixes That Are Unnecessary
- **Fix #1 (RLS policy)**: Already exists -- no change needed
- **Fix #4 (Orphaned users admin tool)**: Deferred -- the trigger in Step 2 prevents future orphans, and the admin record is manually inserted in Step 1
- **Fix #5 (Signup flow)**: Already works correctly in `ClientSignup.tsx`
- **Fix #6 (Forgot password)**: Already implemented at `/portal/forgot-password` and `/portal/reset-password`

### Technical Details

**Files modified:**
- `src/pages/portal/PortalLogin.tsx` -- improved error message with support code

**Database changes:**
- One data insert (admin portal_users record)
- One migration (auto-creation trigger function + trigger)

### After This Fix
1. Admin can log in immediately at `/portal/login`
2. Future client signups via invitation will automatically get portal_users records (belt-and-suspenders with the existing signup code)
3. Login errors will include a support reference code for easier debugging

