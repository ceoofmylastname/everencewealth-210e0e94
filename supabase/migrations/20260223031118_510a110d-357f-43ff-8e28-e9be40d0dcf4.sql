
-- Public can view advisor profiles (for landing pages)
CREATE POLICY "Public read advisors for workshops"
  ON public.advisors FOR SELECT
  USING (
    is_active = true
    AND id IN (SELECT advisor_id FROM public.advisor_slugs WHERE is_active = true)
  );

-- Public can view scheduled workshops (for landing pages)
CREATE POLICY "Public read scheduled workshops"
  ON public.workshops FOR SELECT
  USING (status IN ('scheduled', 'published', 'draft'));
