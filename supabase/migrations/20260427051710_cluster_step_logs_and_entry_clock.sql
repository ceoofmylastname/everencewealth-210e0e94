-- Step 2: heartbeat log table
CREATE TABLE IF NOT EXISTS public.cluster_step_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_job_id    uuid NOT NULL REFERENCES public.cluster_batch_jobs(id) ON DELETE CASCADE,
  current_index   integer,
  current_topic   text,
  current_job_id  uuid,
  cluster_generations_status text,
  action_taken    text NOT NULL,
  detail          jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cluster_step_logs_batch
  ON public.cluster_step_logs(batch_job_id, created_at DESC);

ALTER TABLE public.cluster_step_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read step logs" ON public.cluster_step_logs;
CREATE POLICY "Admins read step logs" ON public.cluster_step_logs
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Step 4: per-entry clock for the 20-min worker timeout
ALTER TABLE public.cluster_batch_jobs
  ADD COLUMN IF NOT EXISTS entry_started_at timestamptz;

-- Concurrency control: CAS-based "tick in progress" flag.
-- Replaces pg_try_advisory_xact_lock (which can't be held across separate
-- supabase-js calls). Stale-locks auto-expire after 5 min as a safety net.
ALTER TABLE public.cluster_batch_jobs
  ADD COLUMN IF NOT EXISTS tick_in_progress boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tick_locked_at   timestamptz;

-- Acquire a tick lock via CAS. Returns true if we got it, false if another
-- worker is already running. Expired locks (> 5 min old) are stolen.
CREATE OR REPLACE FUNCTION public.try_lock_batch_tick(_batch_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acquired int;
BEGIN
  UPDATE public.cluster_batch_jobs
     SET tick_in_progress = true,
         tick_locked_at   = now()
   WHERE id = _batch_job_id
     AND (tick_in_progress = false
          OR tick_locked_at < now() - interval '5 minutes');
  GET DIAGNOSTICS v_acquired = ROW_COUNT;
  RETURN v_acquired = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_batch_tick_lock(_batch_job_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.cluster_batch_jobs
     SET tick_in_progress = false,
         tick_locked_at   = NULL
   WHERE id = _batch_job_id;
$$;

-- pg_cron job: tick every 60 sec. Dispatcher fans out to running batches.
-- Stop condition is inside the dispatcher (not cron) so new batches auto-pick-up.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'tick-active-cluster-batches') THEN
    PERFORM cron.schedule(
      'tick-active-cluster-batches',
      '* * * * *',
      $cron$
      SELECT net.http_post(
        url := 'https://zbzrmpmqijvmjbhctfoe.supabase.co/functions/v1/tick-cluster-batches',
        headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienJtcG1xaWp2bWpiaGN0Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjk1MzUsImV4cCI6MjA4Njc0NTUzNX0.cI7HQmbY1XF_wmPMSm9ofbQdR3iujQ5_YNg8h_YLkVg"}'::jsonb,
        body := '{"triggered_by":"cron"}'::jsonb
      );
      $cron$
    );
  END IF;
END $$;
