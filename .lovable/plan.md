

# Fix: "Database error saving new user" on Client Signup

## Problem
When a client submits the signup form, the error "Database error saving new user" appears. The auth logs confirm:

```
insert or update on table "portal_users" violates foreign key constraint "portal_users_advisor_id_fkey"
```

## Root Cause

There is a **foreign key mismatch** in the `handle_new_portal_user` database trigger:

- `client_invitations.advisor_id` stores an **`advisors` table ID**
- `portal_users.advisor_id` has a foreign key to **`portal_users(id)`** (self-reference)
- The trigger copies the `advisors.id` value directly into `portal_users.advisor_id`, which expects a `portal_users.id` value -- hence the FK violation

There is also a **secondary issue**: the `ClientSignup.tsx` code manually tries to insert into `portal_users` after signup, but the trigger already does this automatically. This redundant insert should be removed.

## Solution

### 1. Fix the database trigger (migration)

Update `handle_new_portal_user` to look up the advisor's `portal_user_id` from the `advisors` table instead of using `client_invitations.advisor_id` directly:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_portal_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record RECORD;
  v_advisor_portal_user_id UUID;
BEGIN
  SELECT * INTO invitation_record
  FROM public.client_invitations
  WHERE LOWER(email) = LOWER(NEW.email)
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- Look up the advisor's portal_user_id
    SELECT portal_user_id INTO v_advisor_portal_user_id
    FROM public.advisors
    WHERE id = invitation_record.advisor_id;

    INSERT INTO public.portal_users (
      auth_user_id, role, first_name, last_name,
      email, advisor_id, is_active
    ) VALUES (
      NEW.id, 'client',
      invitation_record.first_name,
      invitation_record.last_name,
      NEW.email,
      v_advisor_portal_user_id,  -- correct FK value
      true
    )
    ON CONFLICT (auth_user_id) DO NOTHING;

    UPDATE public.client_invitations
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = invitation_record.id;
  END IF;

  RETURN NEW;
END;
$$;
```

### 2. Remove redundant portal_users insert from ClientSignup.tsx

Since the trigger handles creating the `portal_users` record and marking the invitation as accepted, the manual steps 2 and 3 in `handleSignup` should be removed. After `signUp` succeeds, just show the success screen.

## What This Fixes
- Client signup will complete without "Database error saving new user"
- The correct advisor-to-client relationship will be established
- No duplicate insert attempts

## Files Changed
- Database migration (trigger fix)
- `src/pages/portal/ClientSignup.tsx` (remove redundant insert logic)

