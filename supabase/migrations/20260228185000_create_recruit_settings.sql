-- Create recruit_settings table for dynamic portal configuration
CREATE TABLE IF NOT EXISTS public.recruit_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.recruit_settings ENABLE ROW LEVEL SECURITY;

-- Allow public reads so the Briefing page can load the video URL
CREATE POLICY "Allow public read of recruit_settings" ON public.recruit_settings
  FOR SELECT
  USING (true);

-- Allow authenticated admins to update settings
CREATE POLICY "Allow authenticated update of recruit_settings" ON public.recruit_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default youtube URL if not exists
INSERT INTO public.recruit_settings (key, value)
VALUES ('briefing_video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
ON CONFLICT (key) DO NOTHING;

-- Grant permissions for authenticated dashboard users to read and update leads
CREATE POLICY "Allow authenticated full access to recruit_leads" ON public.recruit_leads
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
