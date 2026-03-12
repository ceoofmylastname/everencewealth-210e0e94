

## Plan: Fix Registration Error + Add Confetti & Sound + Webhook Data

### 1. Fix the Registration Error
**Root cause:** Field name mismatch between client and edge function.
- Client sends `slot_id` → Edge function expects `availability_slot_id`
- Client doesn't send `advisor_name` → Edge function receives undefined

**Fix in `src/components/socorro/RegistrationForm.tsx`:**
- Change `slot_id: booking.slot_id` → `availability_slot_id: booking.slot_id`
- Add `advisor_name: booking.advisor_name`

### 2. Enhanced Confetti + Pop Sound on Success Page
**In `src/components/socorro/ConfirmationBlock.tsx`:**
- Increase confetti volume: more particles, longer duration, bigger spread from both sides
- Add a pop/burst sound effect using the Web Audio API (generate a synthetic pop sound — no external file needed) that plays when confetti fires

### 3. Webhook Already Configured
The edge function already sends all data (name, email, phone, advisor info, date, time) to the exact GHL webhook URL provided. Once the field name mismatch is fixed, this will work automatically.

### Technical Summary
- **Files modified:** `RegistrationForm.tsx` (field name fix), `ConfirmationBlock.tsx` (confetti + sound)
- **Edge function:** No changes needed — already has webhook integration and sends all required data

