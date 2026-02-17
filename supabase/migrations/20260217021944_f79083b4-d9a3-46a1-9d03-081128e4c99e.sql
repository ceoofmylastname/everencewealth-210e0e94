
-- Create brochures table
CREATE TABLE public.brochures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url TEXT,
  hero_headline TEXT NOT NULL,
  subtitle TEXT,
  speakable_intro TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  gated BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  pdf_url TEXT,
  cover_image_url TEXT,
  cover_image_alt TEXT,
  has_calculator BOOLEAN DEFAULT false,
  calculator_type TEXT,
  has_worksheet BOOLEAN DEFAULT false,
  worksheet_fields JSONB,
  json_ld_schema JSONB,
  language TEXT DEFAULT 'en',
  hreflang_es_url TEXT,
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create brochure_downloads table
CREATE TABLE public.brochure_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brochure_id UUID REFERENCES public.brochures(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  source_page TEXT,
  ip_address TEXT
);

-- Indexes
CREATE INDEX idx_brochures_slug ON public.brochures(slug);
CREATE INDEX idx_brochures_category ON public.brochures(category);
CREATE INDEX idx_brochures_status ON public.brochures(status);
CREATE INDEX idx_brochure_downloads_email ON public.brochure_downloads(user_email);
CREATE INDEX idx_brochure_downloads_brochure ON public.brochure_downloads(brochure_id);

-- Enable RLS
ALTER TABLE public.brochures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brochure_downloads ENABLE ROW LEVEL SECURITY;

-- Brochures: public read for published
CREATE POLICY "Anyone can view published brochures"
  ON public.brochures FOR SELECT
  USING (status = 'published');

-- Brochures: admin full access
CREATE POLICY "Portal admins can manage brochures"
  ON public.brochures FOR ALL
  TO authenticated
  USING (public.is_portal_admin(auth.uid()))
  WITH CHECK (public.is_portal_admin(auth.uid()));

-- Downloads: anyone can insert (email capture)
CREATE POLICY "Anyone can submit download"
  ON public.brochure_downloads FOR INSERT
  WITH CHECK (true);

-- Downloads: admin can read
CREATE POLICY "Portal admins can view downloads"
  ON public.brochure_downloads FOR SELECT
  TO authenticated
  USING (public.is_portal_admin(auth.uid()));

-- Storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('brochure-pdfs', 'brochure-pdfs', true);

-- Storage policy: public read
CREATE POLICY "Public read brochure PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brochure-pdfs');

-- Storage policy: admin upload
CREATE POLICY "Admin upload brochure PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'brochure-pdfs' AND public.is_portal_admin(auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_brochures_updated_at
  BEFORE UPDATE ON public.brochures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
