-- Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if it exists (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('auto-resume-translation-jobs');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Schedule auto-resume-translation-jobs every 2 minutes
SELECT cron.schedule(
  'auto-resume-translation-jobs',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://zbzrmpmqijvmjbhctfoe.supabase.co/functions/v1/auto-resume-translation-jobs',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienJtcG1xaWp2bWpiaGN0Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjk1MzUsImV4cCI6MjA4Njc0NTUzNX0.cI7HQmbY1XF_wmPMSm9ofbQdR3iujQ5_YNg8h_YLkVg"}'::jsonb,
    body := '{"triggered_by": "cron"}'::jsonb
  ) AS request_id;
  $$
);