

## Plan: Add Registration Time (10:30 AM) to Landing Page and Emails

### 1. Landing Page Changes (`src/pages/TrainingEvent.tsx`)

**A. Add registration time to the event details pills (line 284)**
Change "11:00 AM - 4:00 PM" to include registration:
```
Registration: 10:30 AM
Event: 11:00 AM – 4:00 PM
```

**B. Add registration time to the confirmation card (line 161)**
Update the time display from `11:00 AM – 4:00 PM PT` to `Registration 10:30 AM | Event 11:00 AM – 4:00 PM PT`

**C. Update session highlights (line 11)**
Add a "10:30 AM" registration/check-in entry as the first item in `sessionHighlights`.

### 2. Email Changes

**A. Registration confirmation email (`supabase/functions/register-training-event/index.ts`)**
Add registration and event times to the event details block (currently only shows date and location):
```
🕐 Registration: 10:30 AM PST
🕐 Event: 11:00 AM – 4:00 PM PST
```

**B. Reminder emails (`supabase/functions/process-training-reminders/index.ts`, line 92)**
Update the time line from `11:00 AM to 4:00 PM PST` to include registration:
```
🕐 Registration: 10:30 AM PST
🕐 Event: 11:00 AM – 4:00 PM PST
```

### Files Modified
- `src/pages/TrainingEvent.tsx` — 3 spots (session highlights array, event pills, confirmation card)
- `supabase/functions/register-training-event/index.ts` — add times to email
- `supabase/functions/process-training-reminders/index.ts` — update time line

