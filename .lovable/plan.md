

# Schedule send-escalating-alarms Cron Job

## Overview

The `send-escalating-alarms` edge function has been deployed, but the cron job to trigger it every minute is not yet scheduled in the database. This needs to be set up manually via the Cloud View > Run SQL interface.

---

## Current Status

| Component | Status |
|-----------|--------|
| Edge function deployed | ✅ Complete |
| Cron job documented in cron_jobs.sql | ✅ Complete |
| Cron job scheduled in database | ❌ **Not scheduled** |

---

## Action Required

You need to run the following SQL in **Cloud View > Run SQL** to schedule the cron job:

```sql
SELECT cron.schedule(
  'send-escalating-alarms',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://kazggnufaoicopvmwhdl.supabase.co/functions/v1/send-escalating-alarms',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthemdnbnVmYW9pY29wdm13aGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzM0ODEsImV4cCI6MjA3NjEwOTQ4MX0.acQwC_xPXFXvOwwn7IATeg6OwQ2HWlu52x76iqUdhB4"}'::jsonb,
    body := '{"triggered_by": "cron"}'::jsonb
  ) AS request_id;
  $$
);
```

---

## How to Schedule

1. Open **Cloud View** in Lovable
2. Navigate to **Run SQL**
3. Paste the SQL above
4. Click **Run**
5. You should see a success message with a job ID returned

---

## Verification

After scheduling, run this query to confirm:

```sql
SELECT jobid, jobname, schedule, active 
FROM cron.job 
WHERE jobname = 'send-escalating-alarms';
```

Expected result:
- **jobname**: send-escalating-alarms
- **schedule**: * * * * *
- **active**: true

---

## What This Cron Job Does

```text
Every 1 minute:
├── Calls send-escalating-alarms edge function
├── Function checks for unclaimed leads needing alarm levels 1-4
├── Sends escalating emails if leads are past their time threshold
└── Updates last_alarm_level to prevent duplicate sends
```

---

## Notes

- This cron job cannot be scheduled automatically by me - it requires manual SQL execution
- The SQL is already documented in `supabase/cron_jobs.sql` for reference
- The function returns quickly (processed: 0) when no leads need alarms, so running every minute has minimal overhead

