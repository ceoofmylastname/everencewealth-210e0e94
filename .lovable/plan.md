

## Re-check Vault, then Migration B (trigger rewrites + drop both helpers)

**Target:** `zbzrmpmqijvmjbhctfoe` (Everence Wealth) only. No contact with `kazggnufaoicopvmwhdl`. Service role key value never printed.

### Step 1 — Re-run pre-flight check (read-only)

```sql
SELECT secret_exists, key_len
FROM public._tmp_check_vault_service_role_key();
```

I report only `secret_exists` (boolean) and `key_len` (integer). The secret value is never read or printed.

### Step 2 — Branching decision

- **If `secret_exists = true` AND `key_len` is in a sane range (≈ 200–250):** proceed to Step 3.
- **If `secret_exists = false` OR `key_len = 0`:** STOP. Report and pause. No trigger changes, no helper drops.

### Step 3 — Migration B (single atomic file)

One new migration in `supabase/migrations/` with today's UTC timestamp. Order matters: rewrite triggers first, then drop both helpers last so the helpers are still available if the migration aborts mid-file.

```sql
-- Migration B: switch auto_generate_faqs() to inline Vault lookup,
-- refresh notify_sitemap_ping() comment, drop both temp helpers.
-- Target project: zbzrmpmqijvmjbhctfoe (Everence Wealth) ONLY.

-- ─────────────────────────────────────────────────────────────
-- 1. notify_sitemap_ping() — logic unchanged, comment refreshed
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_sitemap_ping()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_slug         TEXT;
  v_supabase_url TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status != 'published' THEN RETURN NEW; END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status != 'published' OR OLD.status = 'published' THEN RETURN NEW; END IF;
  END IF;

  IF TG_TABLE_NAME = 'location_pages' THEN
    v_slug := NEW.topic_slug;
  ELSE
    v_slug := NEW.slug;
  END IF;

  v_supabase_url := current_setting('app.settings.supabase_url', true);
  IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
    v_supabase_url := 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
  END IF;

  PERFORM net.http_post(
    url     := v_supabase_url || '/functions/v1/ping-indexnow',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object('table', TG_TABLE_NAME, 'slug', v_slug, 'action', TG_OP)
  );

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.notify_sitemap_ping() IS
  'Pings IndexNow on publish. URL via GUC app.settings.supabase_url with Everence (zbzrmpmqijvmjbhctfoe) fallback. No auth header required.';

-- ─────────────────────────────────────────────────────────────
-- 2. auto_generate_faqs() — service role key from Vault inline
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.auto_generate_faqs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault'
AS $function$
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
            'id',               NEW.id,
            'headline',         NEW.headline,
            'detailed_content', NEW.detailed_content,
            'meta_description', NEW.meta_description,
            'language',         NEW.language,
            'funnel_stage',     NEW.funnel_stage
          )
        ),
        'single_article_mode', true
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.auto_generate_faqs() IS
  'Auto-backfills FAQs on publish. URL via GUC app.settings.supabase_url with Everence (zbzrmpmqijvmjbhctfoe) fallback. Service role key sourced inline from vault.decrypted_secrets where name = ''service_role_key'' — never literal, never GUC.';

-- ─────────────────────────────────────────────────────────────
-- 3. Drop both temporary helpers
-- ─────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public._tmp_check_vault_service_role_key();
DROP FUNCTION IF EXISTS public._tmp_list_vault_secret_names();
```

### Step 4 — Post-migration verification (read-only)

```sql
SELECT proname,
       (pg_get_functiondef(oid) ILIKE '%kazggnufaoicopvmwhdl%')   AS has_foreign_ref,
       (pg_get_functiondef(oid) ILIKE '%vault.decrypted_secrets%') AS reads_vault,
       (pg_get_functiondef(oid) ILIKE '%zbzrmpmqijvmjbhctfoe%')   AS has_everence_ref
FROM pg_proc
WHERE proname IN (
        'notify_sitemap_ping',
        'auto_generate_faqs',
        '_tmp_check_vault_service_role_key',
        '_tmp_list_vault_secret_names'
      )
  AND pronamespace = 'public'::regnamespace;
```

Expected:
- `notify_sitemap_ping` → foreign:false, vault:false, everence:true
- `auto_generate_faqs` → foreign:false, vault:true, everence:true
- `_tmp_check_vault_service_role_key` → not present
- `_tmp_list_vault_secret_names` → not present

### Safety properties

- Zero literal JWTs anywhere in the migration file.
- No reference to `kazggnufaoicopvmwhdl` in any code path.
- `CREATE OR REPLACE` only — no triggers fire during migration.
- Both temp helpers dropped in the same migration that activates the Vault read path; no lingering attack surface.
- No edge function deploys, invokes, or warm-ups.
- No `ALTER DATABASE` statement.
- Existing migration files untouched.

### Out of scope

- No app code changes, no edge function changes, no GUC changes.
- No connection to any non-Everence project.

### Confirmation on completion

After Step 4 I'll report: "All changes target `zbzrmpmqijvmjbhctfoe` only. Service role key value was never printed or logged. Both temporary helpers dropped. Foreign project `kazggnufaoicopvmwhdl` not contacted."

