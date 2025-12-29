-- First, drop the existing status check constraint
ALTER TABLE public.qa_generation_jobs 
DROP CONSTRAINT IF EXISTS faq_generation_jobs_status_check;

-- Add the new check constraint that includes 'stalled' status
ALTER TABLE public.qa_generation_jobs 
ADD CONSTRAINT faq_generation_jobs_status_check 
CHECK (status IN ('pending', 'running', 'completed', 'failed', 'stalled'));

-- Add resume columns for stalled job recovery
ALTER TABLE public.qa_generation_jobs 
ADD COLUMN IF NOT EXISTS resume_from_article_index integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS resume_from_language text DEFAULT NULL;

-- Mark stalled jobs (no update for 10+ minutes while still 'running') as 'stalled'
UPDATE public.qa_generation_jobs
SET status = 'stalled'
WHERE status = 'running'
AND updated_at < NOW() - INTERVAL '10 minutes';