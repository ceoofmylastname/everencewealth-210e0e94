-- Add logo_detected to allowed issue_type values on article_image_issues
ALTER TABLE public.article_image_issues
  DROP CONSTRAINT IF EXISTS article_image_issues_issue_type_check;

ALTER TABLE public.article_image_issues
  ADD CONSTRAINT article_image_issues_issue_type_check
  CHECK (issue_type IN ('duplicate', 'text_detected', 'expired_url', 'logo_detected'));

-- Track bulk image scan jobs so the UI can show live progress
CREATE TABLE IF NOT EXISTS public.image_scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type TEXT NOT NULL DEFAULT 'logos',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  total INTEGER NOT NULL DEFAULT 0,
  processed INTEGER NOT NULL DEFAULT 0,
  flagged INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_image_scan_jobs_status_created
  ON public.image_scan_jobs (status, created_at DESC);

ALTER TABLE public.image_scan_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage image scan jobs" ON public.image_scan_jobs;
CREATE POLICY "Admins manage image scan jobs"
  ON public.image_scan_jobs
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Realtime so the dashboard progress bar updates live
ALTER TABLE public.image_scan_jobs REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'image_scan_jobs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.image_scan_jobs';
  END IF;
END $$;