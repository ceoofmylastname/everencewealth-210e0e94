
Goal: restore Socorro booking submissions for everyone (no login required) across all advisors.

What I found
- The booking slot and advisor in your URL are valid and available (`is_booked = false`).
- Public access rules are already in place for Socorro tables.
- The booking function call is failing because the backend endpoint is missing right now:
  - Calling `/register-socorro-booking` returns `404 NOT_FOUND` (“Requested function was not found”).
- That is why users see “Failed to send a request to the Edge Function.”

Implementation plan
1) Restore the missing booking endpoint
- Deploy `supabase/functions/register-socorro-booking/index.ts` so `/register-socorro-booking` exists again.
- Keep it public (`verify_jwt = false`) so any visitor can submit without authentication.

2) Make booking logic reliable for all advisors
- In the function, reserve the slot atomically by matching:
  - `id = availability_slot_id`
  - `advisor_id = advisor_id`
  - `is_booked = false`
- If no row updates, return a clean “slot unavailable” message (409).
- Continue inserting registration and sending webhook payload with:
  - first/last name, email, phone
  - advisor id/name
  - selected date/time
  - timestamp

3) Keep frontend submission resilient
- Keep current payload mapping (already correct): `availability_slot_id` + `advisor_name`.
- Improve client-side error handling so transport failures show a clearer service message and backend errors pass through cleanly.

4) Verify end-to-end before closing
- Smoke test function path: no more 404.
- Submit from public booking page while logged out.
- Test at least 2 different advisors.
- Confirm:
  - registration row created
  - slot flips to `is_booked = true`
  - webhook receives full payload
  - success page/confetti flow appears.

Technical details
- Files to touch:
  - `supabase/functions/register-socorro-booking/index.ts` (atomic slot lock + validation hardening)
  - `src/components/socorro/RegistrationForm.tsx` (error messaging polish only)
- Backend operation required:
  - deploy function `register-socorro-booking` (this is the primary fix for the current outage).
- No schema migration is required for the immediate fix.
