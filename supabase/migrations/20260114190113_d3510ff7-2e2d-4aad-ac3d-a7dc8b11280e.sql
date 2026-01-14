-- Create server_errors table for tracking 5xx errors
CREATE TABLE public.server_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_path TEXT NOT NULL,
  error_type TEXT NOT NULL,  -- '5xx', 'edge_function', 'middleware', 'react_error'
  status_code INTEGER,
  error_message TEXT,
  stack_trace TEXT,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.server_errors ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all errors
CREATE POLICY "Admins can read server errors"
ON public.server_errors
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Allow edge functions to insert errors (using service role)
CREATE POLICY "Service role can insert errors"
ON public.server_errors
FOR INSERT
WITH CHECK (true);

-- Create indexes for efficient querying
CREATE INDEX idx_server_errors_created_at ON public.server_errors(created_at DESC);
CREATE INDEX idx_server_errors_url_path ON public.server_errors(url_path);
CREATE INDEX idx_server_errors_error_type ON public.server_errors(error_type);
CREATE INDEX idx_server_errors_status_code ON public.server_errors(status_code);

-- Add comment
COMMENT ON TABLE public.server_errors IS 'Tracks 5xx server errors, React crashes, and edge function failures for debugging';