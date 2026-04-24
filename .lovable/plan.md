

## Option B — Vault pre-flight via helper, then trigger migration

**Target:** `zbzrmpmqijvmjbhctfoe` (Everence Wealth) only. No contact with `kazggnufaoicopvmwhdl`. Service role key value never printed.

### Execution sequence

**Step 1 — Migration A: create temporary helper**

One short migration creating a `SECURITY DEFINER` helper that returns ONLY the length of the Vault secret, never the value:

```sql
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
```

**Step 2 — Pre-flight via `read_query`**

```sql
SELECT secret_exists, key_len
FROM public._tmp_check_vault_service_role_key();
```

I report only those two values back to you.

**Step 3 — Branching decision**

- **If `secret_exists = true` AND `key_len` is in a sane range (≈ 200–250):** proceed to Step 4.
- **If `secret_exists = false` OR `key_len = 0`:** STOP. Report result. Do not touch triggers. Wait for you to fix the Vault entry (likely a name mismatch — must be exactly `service_role_key`).

**Step 4 — Migration B: rewrite triggers + drop helper (single file)**

Atomic migration that does three things in order:

```sql
-- 4a. notify_sitemap_ping() — refreshed comment, logic unchanged
CREATE OR REPLACE FUNCTION public.notify_sitemap_ping() ...
  -- (same body as currently in DB; URL via GUC w/ Everence fallback only)
$$;

-- 4b. auto_generate_faqs() — service role key from Vault inline
CREATE OR REPLACE FUNCTION public.auto_generate_faqs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault'
AS $$
DECLARE
  v_supabase_url     TEXT;
  v_service_role_key TEXT;
BEGIN
  IF NEW.status = 'published'
     AND (NEW.qa_entities IS NULL OR jsonb_array_length(NEW.qa_entities) = 0) THEN

    v_supabase_url := current_setting('app.settings.supabase_url', true);
    IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
      v_supabase_url := 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
    END IF;

    SELECT decrypted_secret INTO v_service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'service_role_key'
    LIMIT 1;

    PERFORM net.http_post(
      url     := v_supabase_url || '/functions/v1/backfill-article-faqs',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || COALESCE(v_service_role_key, '')
      ),
      body := jsonb_build_object(
        'articles', jsonb_build_array(
          jsonb_build_object(
            'id', NEW.id, 'headline', NEW.headline,
            'detailed_content', NEW.detailed_content,
            'meta_description', NEW.meta_description,
            'language', NEW.language, 'funnel_stage', NEW.funnel_stage
          )
        ),
        'single_article_mode', true
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.auto_generate_faqs() IS
  'Auto-backfills FAQs on publish. URL via GUC w/ Everence fallback. Service role key sourced inline from vault.decrypted_secrets where name = ''service_role_key''.';

-- 4c. drop the temporary helper
DROP FUNCTION IF EXISTS public._tmp_check_vault_service_role_key();
```

**Step 5 — Post-migration verification (read-only)**

```sql
SELECT proname,
       (pg_get_functiondef(oid) ILIKE '%kazggnufaoicopvmwhdl%') AS has_foreign_ref,
       (pg_get_functiondef(oid) ILIKE '%vault.decrypted_secrets%') AS reads_vault,
       (pg_get_functiondef(oid) ILIKE '%zbzrmpmqijvmjbhctfoe%') AS has_everence_ref
FROM pg_proc
WHERE proname IN ('notify_sitemap_ping', 'auto_generate_faqs', '_tmp_check_vault_service_role_key')
  AND pronamespace = 'public'::regnamespace;
```

Expected:
- `notify_sitemap_ping` → foreign:false, vault:false, everence:true
- `auto_generate_faqs` → foreign:false, vault:true, everence:true
- `_tmp_check_vault_service_role_key` → not present (dropped)

### Safety properties

- Helper returns ONLY a boolean and an integer length — never the secret itself.
- Helper is dropped in the same migration that activates Vault reads, so it never lingers as an attack surface.
- Zero literal JWTs anywhere.
- No reference to `kazggnufaoicopvmwhdl` in any code path.
- No edge function deploys, invokes, or warm-ups.
- No `ALTER DATABASE` statement.
- Existing migration files untouched.

### Out of scope

- No app code changes
- No GUC changes
- No edge function changes
- No connection to any non-Everence project

### Confirmation on approval

After Step 5 I'll report: "All changes target `zbzrmpmqijvmjbhctfoe` only. Service role key value was never printed or logged. Foreign project `kazggnufaoicopvmwhdl` not contacted."

