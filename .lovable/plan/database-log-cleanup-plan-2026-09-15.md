# Database Log Cleanup Plan

## Current state
- `cron.job_run_details` is consuming **~5.6 GB** of disk.
- `net._http_response` is consuming **~359 MB** of disk.
- The entire `public` schema is only **~29 MB**, so the app tables are not the pressure source.

## Goal
Reclaim the bulk of the database disk usage by safely purging old internal cron and HTTP response logs, then keeping them pruned automatically.

## Plan

1. **Inspect log table schemas**
   - Confirm the date/timestamp columns in `cron.job_run_details` and `net._http_response` so we can purge by age without affecting recent logs.

2. **One-time safe purge**
   - Delete rows older than a chosen retention window (default: 30 days) from both tables using `run_sql`.
   - Keep the most recent 30 days of logs for troubleshooting.

3. **Reclaim disk space**
   - Run `VACUUM` / `ANALYZE` on the cleaned tables so Postgres can reuse freed space and update query plans.
   - Re-check table sizes to confirm the reclaim.

4. **Set up automatic retention**
   - Create a `pg_cron` scheduled job (via migration) that purges rows older than 30 days from both tables on a recurring schedule.
   - Default cadence: weekly on Sunday at 07:00 UTC.

5. **Document the retention policy**
   - Add a short note to project memory so future agents know cron/net logs are kept for 30 days.

## Expected outcome
- Database disk usage drops from ~6 GB to roughly the size of the `public` schema (~30 MB) plus recent logs.
- No need to resize the database instance for disk pressure.
- Logs continue to be cleaned automatically going forward.

## Risks and mitigation
- These are internal log tables; purging old rows does not affect user data or app functionality.
- We will keep 30 days of history, so recent debugging information remains available.
- The cleanup SQL will be run with an explicit `WHERE created_at < now() - interval '30 days'` guard to avoid deleting recent logs.
