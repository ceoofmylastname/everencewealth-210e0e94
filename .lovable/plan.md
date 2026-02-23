

## Fix: Workshop Registration Failing Due to RLS

### Root Cause
The registration insert itself is allowed by RLS (the INSERT policy permits both anonymous and authenticated users). However, the code uses `.select("id").single()` after the insert to retrieve the new row's ID for the confirmation email. This triggers the **SELECT** policy, which only allows advisors and admins to read registrations -- so the entire operation fails with an RLS violation.

### Solution
Two changes are needed:

1. **Add a SELECT policy** on `workshop_registrations` that allows anyone (anon + authenticated) to read back a row they just inserted, scoped to their own email. Alternatively, we can take a simpler approach:

2. **Remove `.select("id").single()`** from the insert call and instead generate the UUID on the client side before inserting. This way, the insert never needs to read the row back, and the confirmation email can be triggered with the pre-generated ID.

I recommend option 2 (client-side UUID) as it's simpler and avoids opening up SELECT access unnecessarily. However, generating UUIDs client-side requires `crypto.randomUUID()`. A cleaner alternative is adding a public SELECT policy.

**Recommended approach: Add a public SELECT policy for registrants**

### Technical Details

**Database migration:**
- Add a new RLS policy on `workshop_registrations` allowing `anon` and `authenticated` roles to SELECT rows matching their own insert (using `true` for the returning clause, or a narrow policy).
- Simplest safe policy: Allow public SELECT on `workshop_registrations` but only for the `id` column isn't possible with RLS (it's row-level, not column-level). Instead, we'll allow public users to read rows where `email` matches -- but we don't have the email in the auth context for anonymous users.

**Best approach: Generate UUID client-side**
- Generate `id` with `crypto.randomUUID()` before the insert
- Pass the `id` in the insert payload
- Remove `.select("id").single()` from the insert call
- Use the pre-generated ID for the confirmation email trigger

### Changes

**File: `src/pages/public/WorkshopLanding.tsx`** (lines ~274-283)
- Generate a UUID before the insert: `const regId = crypto.randomUUID()`
- Include `id: regId` in the insert object
- Remove `.select("id").single()` -- just use `.insert({...})` 
- Use `regId` directly for the confirmation email call instead of `insertedReg?.id`
