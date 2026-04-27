-- Bulk cluster batch jobs: tracks long-running unattended cluster generation runs
CREATE TABLE public.cluster_batch_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_path text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('dry_run', 'live')),
  limit_count integer,
  start_from integer,
  force_rebuild boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','paused','completed','failed')),
  total_entries integer NOT NULL DEFAULT 0,
  build_count integer NOT NULL DEFAULT 0,
  skip_count integer NOT NULL DEFAULT 0,
  fail_count integer NOT NULL DEFAULT 0,
  flagged_count integer NOT NULL DEFAULT 0,
  current_index integer NOT NULL DEFAULT 0,
  current_topic text,
  current_job_id uuid,
  classifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  dedupe_summary jsonb,
  error text,
  triggered_by uuid,
  started_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cluster_batch_jobs_status ON public.cluster_batch_jobs(status);
CREATE INDEX idx_cluster_batch_jobs_created ON public.cluster_batch_jobs(created_at DESC);

ALTER TABLE public.cluster_batch_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view batch jobs"
  ON public.cluster_batch_jobs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create batch jobs"
  ON public.cluster_batch_jobs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update batch jobs"
  ON public.cluster_batch_jobs FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete batch jobs"
  ON public.cluster_batch_jobs FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- updated_at trigger
CREATE TRIGGER trg_cluster_batch_jobs_updated_at
  BEFORE UPDATE ON public.cluster_batch_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();