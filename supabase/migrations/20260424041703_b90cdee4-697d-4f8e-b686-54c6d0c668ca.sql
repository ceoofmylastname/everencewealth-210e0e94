-- Cleanup: remove broken FAQ trigger + temp helpers
-- Target project: zbzrmpmqijvmjbhctfoe (Everence Wealth) ONLY.

-- 1. Drop the trigger pointing at auto_generate_faqs
DROP TRIGGER IF EXISTS trigger_auto_generate_faqs ON public.blog_articles;

-- 2. Drop the broken function itself
DROP FUNCTION IF EXISTS public.auto_generate_faqs();

-- 3. Drop all three temporary helpers
DROP FUNCTION IF EXISTS public._tmp_check_vault_service_role_key();
DROP FUNCTION IF EXISTS public._tmp_list_vault_secret_names();
DROP FUNCTION IF EXISTS public._tmp_seed_vault_key(text);

-- 4. Optional Vault cleanup: remove orphan service_role_key entry from failed seeder attempts.
--    email_queue_service_role_key is preserved.
DO $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id
  FROM vault.secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    DELETE FROM vault.secrets WHERE id = v_id;
  END IF;
END $$;