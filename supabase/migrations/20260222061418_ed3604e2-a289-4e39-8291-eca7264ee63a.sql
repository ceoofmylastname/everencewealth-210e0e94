
-- Fix contracting_messages INSERT policy to allow managers
DROP POLICY IF EXISTS "contracting_messages_insert" ON public.contracting_messages;

CREATE POLICY "contracting_messages_insert" ON public.contracting_messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = public.get_contracting_agent_id(auth.uid())
  AND (
    -- Agents can message in their own thread
    thread_id = public.get_contracting_agent_id(auth.uid())
    -- Managers can message in threads of their assigned agents (manager_id references portal_users.id)
    OR EXISTS (
      SELECT 1 FROM public.contracting_agents ca
      WHERE ca.id = thread_id
      AND ca.manager_id = public.get_portal_user_id(auth.uid())
    )
    -- Managers can message in their own thread (admin-to-manager direct messaging)
    OR thread_id = public.get_contracting_agent_id(auth.uid())
    -- Contracting/admin can message anywhere
    OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
    OR public.is_portal_admin(auth.uid())
  )
);

-- Fix contracting_messages SELECT policy to use portal_user_id for manager checks
-- and allow managers to see threads where thread_id = their own contracting_agent_id
DROP POLICY IF EXISTS "contracting_messages_select" ON public.contracting_messages;

CREATE POLICY "contracting_messages_select" ON public.contracting_messages
FOR SELECT TO authenticated
USING (
  thread_id = public.get_contracting_agent_id(auth.uid())
  OR sender_id = public.get_contracting_agent_id(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.contracting_agents ca
    WHERE ca.id = thread_id
    AND ca.manager_id = public.get_portal_user_id(auth.uid())
  )
  OR public.get_contracting_role(auth.uid()) IN ('contracting', 'admin')
  OR public.is_portal_admin(auth.uid())
);
