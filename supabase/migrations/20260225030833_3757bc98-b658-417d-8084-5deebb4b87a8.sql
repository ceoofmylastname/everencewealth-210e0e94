
-- Drop the old duplicate INSERT policy
DROP POLICY IF EXISTS "Advisors create own slug" ON public.advisor_slugs;

-- Drop the old UPDATE policy that lacks WITH CHECK
DROP POLICY IF EXISTS "Advisors update own slug" ON public.advisor_slugs;
