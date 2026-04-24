CREATE OR REPLACE FUNCTION public._tmp_check_vault_service_role_key()
RETURNS TABLE(secret_exists boolean, key_len integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault'
AS $$
DECLARE
  v_key TEXT;
BEGIN
  SELECT decrypted_secret INTO v_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  RETURN QUERY SELECT
    (v_key IS NOT NULL AND length(v_key) > 0) AS secret_exists,
    COALESCE(length(v_key), 0)               AS key_len;
END;
$$;

COMMENT ON FUNCTION public._tmp_check_vault_service_role_key() IS
  'TEMPORARY pre-flight helper. Returns only existence and length of vault secret named service_role_key. Returns NO secret material. To be dropped in the next migration.';