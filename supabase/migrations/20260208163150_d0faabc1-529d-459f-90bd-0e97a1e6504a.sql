-- Add missing user_roles entries for Hans and Steven
INSERT INTO public.user_roles (user_id, role, granted_at, notes)
VALUES 
  ('95808453-dde1-421c-85ba-52fe534ef288', 'admin', NOW(), 'Hans - CRM admin sync'),
  ('288f9795-c3c5-47c2-8aae-e2cd408e862a', 'admin', NOW(), 'Steven - CRM admin sync')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create sync trigger to prevent future mismatches
CREATE OR REPLACE FUNCTION sync_crm_agent_role_to_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is admin, ensure user_roles entry exists
  IF NEW.role = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role, granted_at, notes)
    VALUES (NEW.id, 'admin', NOW(), 'Auto-synced from CRM agent role')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- If role changed away from admin, remove the user_roles entry
    DELETE FROM public.user_roles 
    WHERE user_id = NEW.id AND role = 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on crm_agents table
DROP TRIGGER IF EXISTS sync_agent_role_trigger ON public.crm_agents;
CREATE TRIGGER sync_agent_role_trigger
AFTER INSERT OR UPDATE OF role ON public.crm_agents
FOR EACH ROW
EXECUTE FUNCTION sync_crm_agent_role_to_user_roles();