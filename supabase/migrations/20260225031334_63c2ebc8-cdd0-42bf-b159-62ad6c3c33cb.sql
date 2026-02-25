-- Allow advisors to read their own slugs (active or inactive)
-- This is required so UPDATE operations that set is_active=false
-- don't fail the implicit SELECT WITH CHECK in PostgreSQL RLS.
CREATE POLICY "Advisors can read own slugs"
ON public.advisor_slugs
FOR SELECT
TO authenticated
USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));