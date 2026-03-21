
-- Step 1: Create portal_users entries for contracting agents who don't have one
INSERT INTO portal_users (auth_user_id, role, first_name, last_name, email, is_active)
SELECT ca.auth_user_id, 'advisor', ca.first_name, ca.last_name, ca.email, true
FROM contracting_agents ca
WHERE NOT EXISTS (
  SELECT 1 FROM portal_users pu WHERE pu.auth_user_id = ca.auth_user_id
);

-- Step 2: Backfill contracting agents who lack portal_user_id
UPDATE contracting_agents ca
SET portal_user_id = pu.id
FROM portal_users pu
WHERE pu.auth_user_id = ca.auth_user_id
  AND ca.portal_user_id IS NULL;

-- Step 3: Create advisors records for contracting agents who don't have one
INSERT INTO advisors (auth_user_id, email, first_name, last_name, portal_user_id, is_active)
SELECT ca.auth_user_id, ca.email, ca.first_name, ca.last_name, ca.portal_user_id, true
FROM contracting_agents ca
WHERE NOT EXISTS (
  SELECT 1 FROM advisors a WHERE a.auth_user_id = ca.auth_user_id
)
AND ca.portal_user_id IS NOT NULL;

-- Step 4: Trigger to auto-create portal_users + advisors when new contracting agents are added
CREATE OR REPLACE FUNCTION public.sync_contracting_agent_to_advisor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_portal_user_id uuid;
BEGIN
  -- Ensure portal_users entry exists
  SELECT id INTO v_portal_user_id FROM portal_users WHERE auth_user_id = NEW.auth_user_id;
  
  IF v_portal_user_id IS NULL THEN
    INSERT INTO portal_users (auth_user_id, role, first_name, last_name, email, is_active)
    VALUES (NEW.auth_user_id, 'advisor', NEW.first_name, NEW.last_name, NEW.email, true)
    RETURNING id INTO v_portal_user_id;
  END IF;

  -- Update contracting_agents with portal_user_id
  NEW.portal_user_id := v_portal_user_id;

  -- Ensure advisors entry exists
  IF NOT EXISTS (SELECT 1 FROM advisors WHERE auth_user_id = NEW.auth_user_id) THEN
    INSERT INTO advisors (auth_user_id, email, first_name, last_name, portal_user_id, is_active)
    VALUES (NEW.auth_user_id, NEW.email, NEW.first_name, NEW.last_name, v_portal_user_id, true);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_contracting_agent_to_advisor
BEFORE INSERT ON contracting_agents
FOR EACH ROW
EXECUTE FUNCTION sync_contracting_agent_to_advisor();
