CREATE OR REPLACE FUNCTION public._tmp_seed_vault_key(p_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault'
AS $$
DECLARE
  v_existing_id uuid;
  v_action      text;
BEGIN
  IF p_key IS NULL OR length(p_key) < 100 THEN
    RAISE EXCEPTION 'invalid key payload';
  END IF;

  SELECT id INTO v_existing_id
  FROM vault.secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    PERFORM vault.update_secret(v_existing_id, p_key, 'service_role_key');
    v_action := 'updated';
  ELSE
    PERFORM vault.create_secret(p_key, 'service_role_key', 'Supabase service role key for trigger HTTP auth');
    v_action := 'created';
  END IF;

  RETURN v_action;
END;
$$;

COMMENT ON FUNCTION public._tmp_seed_vault_key(text) IS
  'TEMPORARY. Accepts service role key as parameter, writes to vault.secrets. Never stores key on disk. To be dropped together with other temp helpers in Migration B.';