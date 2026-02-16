CREATE TABLE public.homepage_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view homepage images"
  ON public.homepage_images FOR SELECT USING (true);

CREATE POLICY "Service role manages homepage images"
  ON public.homepage_images FOR ALL USING (auth.role() = 'service_role');