CREATE POLICY "agents_can_insert_own_steps"
ON public.contracting_agent_steps
FOR INSERT TO authenticated
WITH CHECK (agent_id = get_contracting_agent_id(auth.uid()));