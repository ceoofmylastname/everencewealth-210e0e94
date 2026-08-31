-- Managers could not see their downline advisors' CNAs.
--
-- client_needs_analysis had only three SELECT policies: advisor-owns-row,
-- client-owns-row, and admin-sees-all. There was no manager policy, so a
-- manager (e.g. Nate Ramos) got an empty list for agents he manages.
--
-- The existing can_manage_advisor() helper cannot be reused here: it matches
-- advisors.id, but client_needs_analysis.advisor_id references portal_users(id).
-- This adds a portal_users-based companion helper and the missing policies.

-- Does _auth_uid manage the advisor whose portal_users.id = _portal_user_id?
CREATE OR REPLACE FUNCTION public.can_manage_portal_advisor(_auth_uid uuid, _portal_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portal_users pu
    JOIN public.contracting_agents ca ON ca.auth_user_id = pu.auth_user_id
    JOIN public.portal_users mgr ON mgr.id = ca.manager_id
    WHERE pu.id = _portal_user_id
      AND mgr.auth_user_id = _auth_uid
      AND mgr.is_active = true
  );
$$;

-- Managers get read-only visibility of their downline's CNAs.
DROP POLICY IF EXISTS manager_select_downline_cnas ON public.client_needs_analysis;
CREATE POLICY manager_select_downline_cnas
ON public.client_needs_analysis FOR SELECT
TO authenticated
USING (public.can_manage_portal_advisor(auth.uid(), advisor_id));

-- The CNA dashboard resolves the owning advisor's name through an embedded
-- join on portal_users, which is itself RLS-filtered. Without this the CNAs
-- would appear with a blank owner. Read-only, scoped to direct downline.
DROP POLICY IF EXISTS manager_select_downline_portal_users ON public.portal_users;
CREATE POLICY manager_select_downline_portal_users
ON public.portal_users FOR SELECT
TO authenticated
USING (public.can_manage_portal_advisor(auth.uid(), id));
