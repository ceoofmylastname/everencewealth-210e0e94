SELECT cron.schedule(
  'cleanup-internal-logs',
  '0 7 * * 0',
  $$
    DELETE FROM cron.job_run_details WHERE start_time < now() - interval '30 days';
    DELETE FROM net._http_response WHERE created < now() - interval '30 days';
  $$
);