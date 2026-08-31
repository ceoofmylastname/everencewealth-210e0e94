-- Guard against reporting loops (A reports to B, B reports to A).
--
-- Now that admins can reassign managers from the UI, nothing stopped them
-- from pointing an agent at someone who already reports to that agent.
-- A loop would make the hierarchy nonsensical and silently strip visibility
-- for everyone in the ring. Guarded in the database so every write path is
-- covered (UI, intake form, direct SQL), plus an RPC the dropdown uses so
-- impossible choices are never offered in the first place.

-- Would pointing this agent at _new_manager_id close a loop?
-- Walks UP from the proposed manager; a loop exists if we reach the agent.
-- Takes the agent's auth_user_id rather than their row id so it also works
-- in a BEFORE INSERT trigger, where the row does not exist yet.
CREATE OR REPLACE FUNCTION public.would_create_manager_cycle(_agent_auth_uid uuid, _new_manager_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE agent_portal AS (
    SELECT pu.id AS portal_id
    FROM public.portal_users pu
    WHERE pu.auth_user_id = _agent_auth_uid
  ),
  chain AS (
    -- Start at the proposed manager (depth 1 catches self-assignment)
    SELECT _new_manager_id AS portal_id, 1 AS depth
    UNION ALL
    -- Climb to that person's own manager
    SELECT ca.manager_id, c.depth + 1
    FROM chain c
    JOIN public.portal_users pu ON pu.id = c.portal_id
    JOIN public.contracting_agents ca ON ca.auth_user_id = pu.auth_user_id
    WHERE ca.manager_id IS NOT NULL
      AND c.depth < 20  -- terminates even if the data already contains a loop
  )
  SELECT EXISTS (
    SELECT 1
    FROM chain c
    JOIN agent_portal ap ON ap.portal_id = c.portal_id
  );
$$;

CREATE OR REPLACE FUNCTION public.prevent_manager_cycle()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.manager_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only validate when the assignment actually changes.
  IF TG_OP = 'UPDATE' AND NEW.manager_id IS NOT DISTINCT FROM OLD.manager_id THEN
    RETURN NEW;
  END IF;

  IF public.would_create_manager_cycle(NEW.auth_user_id, NEW.manager_id) THEN
    RAISE EXCEPTION
      'Cannot set this manager: they already report to this agent, directly or indirectly, so this would create a reporting loop.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_manager_cycle ON public.contracting_agents;
CREATE TRIGGER trg_prevent_manager_cycle
  BEFORE INSERT OR UPDATE OF manager_id ON public.contracting_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_manager_cycle();

-- Manager choices that are valid for a given agent: active admins and
-- flagged managers, minus the agent themselves and anyone beneath them.
CREATE OR REPLACE FUNCTION public.get_eligible_managers(_agent_id uuid)
RETURNS TABLE(id uuid, first_name text, last_name text, role text, is_manager boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pu.id, pu.first_name, pu.last_name, pu.role, pu.is_manager
  FROM public.portal_users pu
  WHERE (
        (pu.is_active = true AND (pu.role = 'admin' OR pu.is_manager = true))
        -- Always include the agent's current manager, even if they have since
        -- been deactivated or un-flagged, so the dropdown shows who it is
        -- instead of rendering blank.
        OR pu.id = (SELECT ca2.manager_id FROM public.contracting_agents ca2 WHERE ca2.id = _agent_id)
      )
    AND NOT public.would_create_manager_cycle(
          (SELECT ca.auth_user_id FROM public.contracting_agents ca WHERE ca.id = _agent_id),
          pu.id
        )
  ORDER BY pu.first_name, pu.last_name;
$$;

REVOKE EXECUTE ON FUNCTION public.get_eligible_managers(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_eligible_managers(uuid) TO authenticated, service_role;
