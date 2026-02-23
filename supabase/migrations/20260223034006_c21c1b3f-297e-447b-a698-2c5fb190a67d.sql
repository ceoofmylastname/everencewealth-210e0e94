-- Fix: Allow both anon and authenticated users to register for workshops
DROP POLICY "Public can register" ON public.workshop_registrations;

CREATE POLICY "Anyone can register for workshops"
  ON public.workshop_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);