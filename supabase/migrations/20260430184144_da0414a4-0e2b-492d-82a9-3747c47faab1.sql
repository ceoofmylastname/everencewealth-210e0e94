-- Extend cluster_batch_jobs.status to allow halted_partial
ALTER TABLE public.cluster_batch_jobs
  DROP CONSTRAINT IF EXISTS cluster_batch_jobs_status_check;
ALTER TABLE public.cluster_batch_jobs
  ADD CONSTRAINT cluster_batch_jobs_status_check
  CHECK (status = ANY (ARRAY['queued','running','paused','completed','failed','halted_partial']));

-- Extend cluster_batch_jobs.current_phase to allow halted
ALTER TABLE public.cluster_batch_jobs
  DROP CONSTRAINT IF EXISTS cluster_batch_jobs_current_phase_check;
ALTER TABLE public.cluster_batch_jobs
  ADD CONSTRAINT cluster_batch_jobs_current_phase_check
  CHECK (current_phase = ANY (ARRAY['blog','qa','halted']));

-- Extend cluster_completion_progress.status to allow flagged
ALTER TABLE public.cluster_completion_progress
  DROP CONSTRAINT IF EXISTS valid_progress_status;
ALTER TABLE public.cluster_completion_progress
  ADD CONSTRAINT valid_progress_status
  CHECK (status = ANY (ARRAY['not_started','queued','in_progress','completed','failed','paused','flagged']));