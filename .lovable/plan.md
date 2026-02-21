

# Let Recruits Set Their Password on the Application Form

## Current Behavior
Right now, when a recruit submits the `/apply` form, the system creates their account with a **random temporary password** and sends an email with a "Set Your Password" link. This adds friction -- they have to check their email before they can log in.

## New Behavior
Add a **"Create Your Password"** step to the intake form (after Email, as step 3). The recruit enters and confirms their password directly. The edge function then creates the auth user with that chosen password instead of a random one. After submitting, the recruit can immediately log in at `/portal/login`.

## Changes

### 1. Frontend -- `src/pages/ContractingIntake.tsx`
- Add `password` and `confirm_password` fields to the form state
- Insert a new step (step 3) with password + confirm inputs and validation (min 8 characters, must match)
- Update `TOTAL_STEPS` from 8 to 9
- Shift all subsequent step numbers by +1
- Pass `password` to the edge function in `handleSubmit`
- Update the success screen text to say "You can now log in" instead of "check your email"

### 2. Edge Function -- `supabase/functions/contracting-intake/index.ts`
- Accept `password` from the request body
- Use the user-provided password in `createUser()` instead of the random temp password
- Keep the welcome email but remove the recovery link -- change it to a simple confirmation email with a "Go to Login" button instead
