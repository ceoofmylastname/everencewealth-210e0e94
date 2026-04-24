CREATE OR REPLACE FUNCTION public._tmp_list_vault_secret_names()
RETURNS TABLE(secret_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault'
AS $$
BEGIN
  RETURN QUERY
  SELECT name::text AS secret_name
  FROM vault.decrypted_secrets
  ORDER BY name;
END;
$$;

COMMENT ON FUNCTION public._tmp_list_vault_secret_names() IS
  'TEMPORARY pre-flight helper. Returns ONLY the names of vault secrets. Returns NO secret material and NO lengths. To be dropped after Vault entry is verified.';