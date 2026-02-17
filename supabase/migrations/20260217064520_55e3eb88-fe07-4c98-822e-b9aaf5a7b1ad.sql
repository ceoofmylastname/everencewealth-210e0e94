
-- 1. Create helper function that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_my_advisor_id_from_portal(_auth_uid uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT advisor_id FROM portal_users
  WHERE auth_user_id = _auth_uid AND is_active = true
  LIMIT 1;
$$;

-- 2. Drop the broken recursive policy
DROP POLICY IF EXISTS "Clients can view their advisor" ON advisors;

-- 3. Recreate without recursion
CREATE POLICY "Clients can view their advisor"
ON advisors FOR SELECT TO authenticated
USING (
  portal_user_id = get_my_advisor_id_from_portal(auth.uid())
);
