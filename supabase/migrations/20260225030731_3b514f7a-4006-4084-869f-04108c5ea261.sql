
-- Drop the broken UPDATE policy that uses get_my_advisor_id_from_portal
DROP POLICY IF EXISTS "Advisors can update own slugs" ON public.advisor_slugs;

-- Drop any existing INSERT policy to replace it
DROP POLICY IF EXISTS "Advisors create own slugs" ON public.advisor_slugs;
DROP POLICY IF EXISTS "Advisors can create own slugs" ON public.advisor_slugs;

-- Recreate UPDATE policy using the correct helper
CREATE POLICY "Advisors can update own slugs"
ON public.advisor_slugs FOR UPDATE
TO authenticated
USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()))
WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

-- Align INSERT policy with the same helper
CREATE POLICY "Advisors can create own slugs"
ON public.advisor_slugs FOR INSERT
TO authenticated
WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));
