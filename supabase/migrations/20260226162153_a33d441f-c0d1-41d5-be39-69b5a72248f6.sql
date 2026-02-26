
-- Create compliance_resources table
CREATE TABLE public.compliance_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  promo_code TEXT,
  promo_text TEXT,
  contact_email TEXT,
  discount_text TEXT,
  color_theme TEXT NOT NULL DEFAULT 'neutral',
  type TEXT NOT NULL DEFAULT 'link',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_resources ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active resources
CREATE POLICY "Authenticated users can read active resources"
ON public.compliance_resources FOR SELECT TO authenticated
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage compliance resources"
ON public.compliance_resources FOR ALL TO authenticated
USING (public.is_portal_admin(auth.uid()))
WITH CHECK (public.is_portal_admin(auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_compliance_resources_updated_at
BEFORE UPDATE ON public.compliance_resources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing hardcoded resources
INSERT INTO public.compliance_resources (title, description, url, promo_code, promo_text, discount_text, color_theme, type, sort_order) VALUES
('FastrackCE — Continuing Education', 'All CE courses available with discount', 'https://www.fastrackce.com/', 'BB25HOF', 'Use code for discount', '20% OFF', 'blue', 'partner', 1),
('ExamFX — Pre-Licensing Courses', 'Pre-licensing courses with group discount', 'https://www.examfx.com/product-registration', NULL, 'Mention "Insurance Courses"', '55% OFF', 'emerald', 'partner', 2),
('State CE Requirements', 'NAIC interactive map', 'https://www.naic.org/state_web_map.htm', NULL, NULL, NULL, 'neutral', 'link', 3),
('NAIC Producer Database', 'Verify license status via NIPR', 'https://pdb.nipr.com/', NULL, NULL, NULL, 'neutral', 'link', 4);

-- Set contact_email for ExamFX
UPDATE public.compliance_resources SET contact_email = 'kjenson@lifeconetwork.com' WHERE title LIKE 'ExamFX%';
