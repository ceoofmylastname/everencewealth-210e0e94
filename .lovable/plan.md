# Reschedule Broker Training: March 21 → June 27, 2026

Live page: https://www.everencewealth.com/broker-training
June 27, 2026 is a Saturday, so "Saturday" copy stays correct.

## Changes

**1. `src/pages/TrainingEvent.tsx`** (the /broker-training landing page)
- `March 21, 2026` → `June 27, 2026`
- `MARCH 21, 2026` → `JUNE 27, 2026`
- `Saturday, March 21` → `Saturday, June 27`
- `leading up to March 21` → `leading up to June 27`

**2. `src/pages/portal/admin/AdminAgents.tsx`**
- CRM tab label `March 21st Event` → `June 27th Event`

**3. `supabase/functions/register-training-event/index.ts`** (registration confirmation email)
- Body copy: `... on March 21st` → `... on June 27th`
- Event details line: `Date: March 21st, 2026` → `Date: June 27th, 2026`
- Keep DB `status: "March21Event"` value unchanged so existing registrants stay linked to the reminder pipeline. Add a code comment noting it's a legacy key for the rescheduled June 27 event.

**4. `supabase/functions/process-training-reminders/index.ts`** (10-day / 5-day / 24-hour reminder emails)
- `EVENT_DATETIME` constant → `new Date("2026-06-27T11:00:00-07:00")` (PDT, same offset)
- Update the date-math comment above it
- Email subject/body: `March 21st Broker Training` → `June 27th Broker Training`
- Email details line: `Saturday, March 21, 2026` → `Saturday, June 27, 2026`
- Keep the `.eq("status", "March21Event")` query filter unchanged

## Unchanged
- Time (11:00 AM PT), location (Andaz Napa), registration window
- `register-socorro-booking` (different Socorro ISD event, not broker training)
