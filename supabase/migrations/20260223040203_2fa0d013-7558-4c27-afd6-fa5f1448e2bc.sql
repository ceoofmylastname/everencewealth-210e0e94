
-- 1. Create advisor-photos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('advisor-photos', 'advisor-photos', true);

-- 2. Public read access for advisor photos
CREATE POLICY "Public can view advisor photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'advisor-photos');

-- 3. Advisors can upload their own photos
CREATE POLICY "Advisors can upload own photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'advisor-photos'
  AND (storage.foldername(name))[1] = public.get_advisor_id_for_auth(auth.uid())::text
);

-- 4. Advisors can update their own photos
CREATE POLICY "Advisors can update own photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'advisor-photos'
  AND (storage.foldername(name))[1] = public.get_advisor_id_for_auth(auth.uid())::text
);

-- 5. Advisors can delete their own photos
CREATE POLICY "Advisors can delete own photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'advisor-photos'
  AND (storage.foldername(name))[1] = public.get_advisor_id_for_auth(auth.uid())::text
);

-- 6. RLS policy: Advisors can update their own profile row
CREATE POLICY "Advisors can update own profile fields"
ON public.advisors FOR UPDATE TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());
