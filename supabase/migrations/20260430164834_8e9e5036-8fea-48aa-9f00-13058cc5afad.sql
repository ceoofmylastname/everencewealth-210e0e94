-- Bug A: persist compliance_class on cluster_generations so chunked generators can read it
ALTER TABLE public.cluster_generations
  ADD COLUMN IF NOT EXISTS compliance_class TEXT NULL;

-- Bug B: cluster_batch_jobs gets a sub-state machine for the blog → QA pipeline
ALTER TABLE public.cluster_batch_jobs
  ADD COLUMN IF NOT EXISTS current_phase TEXT NOT NULL DEFAULT 'blog'
    CHECK (current_phase IN ('blog','qa')),
  ADD COLUMN IF NOT EXISTS qa_job_id UUID NULL,
  ADD COLUMN IF NOT EXISTS qa_phase_started_at TIMESTAMPTZ NULL;