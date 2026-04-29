# Update Broker Training Times (June 27, 2026)

New times across the landing page and all connected emails:
- Registration: **9:30 AM PT**
- Event start: **10:00 AM PT**
- **No end time** mentioned anywhere

## Changes

**1. `src/pages/TrainingEvent.tsx`** (the `/broker-training` page)
- Line 11: `"10:30 AM"` Registration → `"9:30 AM"`
- Line 12: `"11:00 AM"` Financial Workshop Begins → `"10:00 AM"`
- Line 20: Remove the `{ time: "4:00 PM", title: "Closing Remarks" }` agenda item (drops the end time entirely)
- Line 180: `Registration 10:30 AM | Event 11:00 AM – 4:00 PM PT` → `Registration 9:30 AM | Event 10:00 AM PT`
- Line 407: `11:00 AM – 4:00 PM PT` → `10:00 AM PT`

**2. `supabase/functions/register-training-event/index.ts`** (registration confirmation email)
- Line 76: `Registration: 10:30 AM PST` → `Registration: 9:30 AM PT`
- Line 77: `Event: 11:00 AM – 4:00 PM PST` → `Event: 10:00 AM PT` (end time removed)

**3. `supabase/functions/process-training-reminders/index.ts`** (10-day / 5-day / 24-hour reminder emails)
- Line 13–14: Update `EVENT_DATETIME` constant to `new Date("2026-06-27T10:00:00-07:00")` and refresh the comment to reflect the new 10:00 AM PDT start. This keeps reminder timing accurate (10-day, 5-day, 24-hour countdowns).
- Line 93: `Registration: 10:30 AM PST` → `Registration: 9:30 AM PT`
- Line 94: `Event: 11:00 AM – 4:00 PM PST` → `Event: 10:00 AM PT` (end time removed)

## Notes
- Date (Saturday, June 27, 2026), location (Andaz Napa), and the database status key `"March21Event"` remain unchanged.
- Switching the timezone label from `PST` to `PT` since June is daylight time (PDT); `PT` is correct year-round and consistent with the landing page copy.
