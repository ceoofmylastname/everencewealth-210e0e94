## The client is right — the reminder timing is broken

### What's happening

The workshop is stored as:
- **Date:** 2026-06-30 (Tuesday)
- **Time:** 13:00:00
- **Timezone:** America/Los_Angeles (1:00 PM Pacific)

But the reminder function (`supabase/functions/process-workshop-reminders/index.ts`, line 90) does:

```ts
new Date(`${ws.workshop_date}T${ws.workshop_time}`)
// = new Date("2026-06-30T13:00:00")
```

An ISO string with no timezone suffix is treated as **local** time. On the Supabase edge runtime, local = **UTC**. So the function thinks the workshop starts at **13:00 UTC** — which is **6:00 AM Pacific**, not 1:00 PM Pacific. Every reminder window (24h / 4h / 1h / 10m) fires 7 hours too early, which lines up with the "6 AM" reminder the client received.

The workshops table already stores the correct IANA timezone in a `timezone` column, but the function ignores it. `send-workshop-confirmation` has the same class of issue (and prints `13:00:00` raw in the confirmation email).

### The fix

**1. `supabase/functions/process-workshop-reminders/index.ts`**
- Select `workshops.timezone` alongside date/time.
- Compute the real UTC start moment from `(workshop_date, workshop_time, timezone)` — get the target zone's UTC offset for that specific date via `Intl.DateTimeFormat(..., { timeZone, timeZoneName: 'longOffset' })` (handles DST correctly), then build the Date from that offset. Default to `America/Los_Angeles` when the column is null.
- Use that correct UTC moment in the `timeDiffMinutes` comparison so 24h / 4h / 1h / 10m windows trigger relative to the actual start.
- Format the date/time shown inside the email in the workshop's own timezone (e.g. "Tuesday, June 30, 2026" and "1:00 PM PDT") using `toLocaleString('en-US', { timeZone })`, instead of raw `13:00:00` and a UTC-parsed date.

**2. `supabase/functions/send-workshop-confirmation/index.ts`**
- Same timezone-aware formatting for the confirmation email so the "Date / Time" block reads "Tuesday, June 30, 2026 · 1:00 PM PDT" instead of `13:00:00`.

**3. Deploy both edge functions.**

No schema changes, no cron changes (every-5-minutes cadence is fine), no changes to how workshops are created — the `timezone` column is already being captured correctly on the way in; only the reminder/confirmation readers are wrong.

### Verification after deploy

- Query one upcoming workshop, compute the expected UTC start manually, and confirm the function's log line matches.
- Send a test registration against a workshop scheduled ~15 minutes out and confirm the "Starting Now" email arrives ~10 minutes before start (in the workshop's local time), not 7 hours early.