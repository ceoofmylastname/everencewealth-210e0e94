
-- Allow advisors to UPDATE their own slugs (e.g., deactivate)
CREATE POLICY "Advisors can update own slugs"
ON public.advisor_slugs
FOR UPDATE
USING (advisor_id = public.get_my_advisor_id_from_portal(auth.uid()))
WITH CHECK (advisor_id = public.get_my_advisor_id_from_portal(auth.uid()));
