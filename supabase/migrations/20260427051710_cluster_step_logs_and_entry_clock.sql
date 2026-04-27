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
