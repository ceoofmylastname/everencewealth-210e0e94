
CREATE TABLE public.recruit_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  audit_score INTEGER,
  video_watch_time INTEGER DEFAULT 0,
  audit_answers JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.recruit_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recruit_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON public.recruit_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read leads" ON public.recruit_leads FOR SELECT USING (public.is_admin(auth.uid()));

ALTER TABLE public.recruit_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.recruit_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.recruit_settings FOR ALL USING (public.is_admin(auth.uid()));
