-- Fix: Update contracting_agents SELECT policy to use portal_user_id instead of contracting_agent_id
-- manager_id references portal_users.id, not contracting_agents.id
DROP POLICY IF EXISTS contracting_agents_select ON public.contracting_agents;

CREATE POLICY contracting_agents_select ON public.contracting_agents
FOR SELECT USING (
  (auth_user_id = auth.uid())
  OR (manager_id = get_portal_user_id(auth.uid()))
  OR (get_contracting_role(auth.uid()) = ANY (ARRAY['contracting'::text, 'admin'::text]))
  OR is_portal_admin(auth.uid())
);