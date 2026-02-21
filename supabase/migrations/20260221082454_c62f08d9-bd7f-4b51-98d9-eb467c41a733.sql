ALTER TABLE public.contracting_agents DROP CONSTRAINT contracting_agents_manager_id_fkey;

-- Re-add as FK to portal_users instead
ALTER TABLE public.contracting_agents
  ADD CONSTRAINT contracting_agents_manager_id_fkey
  FOREIGN KEY (manager_id) REFERENCES public.portal_users(id) ON DELETE SET NULL;