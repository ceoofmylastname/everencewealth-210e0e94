
-- Create a helper function that gets the advisors.id from auth.uid()
CREATE OR REPLACE FUNCTION public.get_advisor_id_for_auth(_auth_uid uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT a.id FROM advisors a
  JOIN portal_users pu ON a.portal_user_id = pu.id
  WHERE pu.auth_user_id = _auth_uid AND pu.is_active = true
  LIMIT 1;
$$;

-- Drop old policies
DROP POLICY IF EXISTS "Advisors can insert own sales" ON public.advisor_sales;
DROP POLICY IF EXISTS "Advisors can update own sales" ON public.advisor_sales;
DROP POLICY IF EXISTS "Advisors can delete own sales" ON public.advisor_sales;
DROP POLICY IF EXISTS "Advisors can view own goals" ON public.advisor_goals;
DROP POLICY IF EXISTS "Advisors can insert own goals" ON public.advisor_goals;
DROP POLICY IF EXISTS "Advisors can update own goals" ON public.advisor_goals;
DROP POLICY IF EXISTS "Advisors can delete own goals" ON public.advisor_goals;

-- Recreate with correct function
CREATE POLICY "Advisors can insert own sales"
ON public.advisor_sales FOR INSERT TO authenticated
WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "Advisors can update own sales"
ON public.advisor_sales FOR UPDATE TO authenticated
USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "Advisors can delete own sales"
ON public.advisor_sales FOR DELETE TO authenticated
USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "Advisors can view own goals"
ON public.advisor_goals FOR SELECT TO authenticated
USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "Advisors can insert own goals"
ON public.advisor_goals FOR INSERT TO authenticated
WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "Advisors can update own goals"
ON public.advisor_goals FOR UPDATE TO authenticated
USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

CREATE POLICY "Advisors can delete own goals"
ON public.advisor_goals FOR DELETE TO authenticated
USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()));
