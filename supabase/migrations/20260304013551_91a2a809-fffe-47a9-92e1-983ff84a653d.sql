ALTER TABLE public.recruit_leads ADD COLUMN IF NOT EXISTS status TEXT;
NOTIFY pgrst, 'reload schema';