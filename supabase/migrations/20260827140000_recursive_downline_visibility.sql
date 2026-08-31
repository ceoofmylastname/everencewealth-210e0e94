-- Make manager visibility walk the full upline chain, not just one level.
--
-- can_manage_portal_advisor() originally matched only an agent's DIRECT
-- manager_id. In a real agency the chain is multi-level (e.g.
-- David -> Nate -> Alan), and an upline manager must still see everyone
-- beneath them, not just their immediate reports. Without this, moving an
-- agent under a mid-level manager silently removes them from the upline
-- manager's view.
--
-- Backward compatible: a direct manager is simply depth 1 of the walk.
CREATE OR REPLACE FUNCTION public.can_manage_portal_advisor(_auth_uid uuid, _portal_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE upline AS (
    -- Level 1: the advisor's direct manager
    SELECT ca.manager_id AS manager_portal_id, 1 AS depth
    FROM public.portal_users pu
    JOIN public.contracting_agents ca ON ca.auth_user_id = pu.auth_user_id
    WHERE pu.id = _portal_user_id
      AND ca.manager_id IS NOT NULL

    UNION ALL

    -- Climb: that manager's own manager, and so on.
    -- depth < 10 guards against a cycle in the hierarchy data.
    SELECT ca2.manager_id, u.depth + 1
    FROM upline u
    JOIN public.portal_users pu2 ON pu2.id = u.manager_portal_id
    JOIN public.contracting_agents ca2 ON ca2.auth_user_id = pu2.auth_user_id
    WHERE ca2.manager_id IS NOT NULL
      AND u.depth < 10
  )
  SELECT EXISTS (
    SELECT 1
    FROM upline u
    JOIN public.portal_users mgr ON mgr.id = u.manager_portal_id
    WHERE mgr.auth_user_id = _auth_uid
      AND mgr.is_active = true
  );
$$;
