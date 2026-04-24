

## Option C — Inline Vault lookup in both trigger functions

**Target:** `zbzrmpmqijvmjbhctfoe` (Everence Wealth) only. No contact with `kazggnufaoicopvmwhdl`.

### What changes

Both trigger functions stop reading `app.settings.service_role_key` (GUC) and instead read the key inline from `vault.decrypted_secrets` where `name = 'service_role_key'` (the Vault entry you just created). The Supabase URL behavior is unchanged — GUC first, Everence-only fallback.

### Why this is safe

- `vault.decrypted_secrets` is a Supabase-managed view that decrypts on read using the project's encryption key. Only `SECURITY DEFINER` functions owned by `postgres` (which these are) can read it.
- No literal JWT enters the migration file or chat.
- If Vault lookup returns NULL (secret missing/renamed), `auto_generate_faqs` sends `Authorization: Bearer ` and `backfill-article-faqs` returns 401 — same safe-fail behavior as the GUC version, no foreign URL ever called.
- `notify_sitemap_ping` doesn't need the key at all (no auth header on `ping-indexnow`), so it stays GUC-only for the URL.

### Pre-flight check (read-only, run before migration)

I'll first run this `SELECT` to confirm the Vault entry exists and is readable:

```sql
SELECT name, length(decrypted_secret) AS key_len
FROM vault.decrypted_secrets
WHERE name = 'service_role_key';
```

Expected: one row, `key_len ≈ 200–250`. If zero rows or NULL, I stop and report — no migration runs.

### Migration SQL (preview — not yet applied)

One new file in `supabase/migrations/` with today's UTC timestamp:

```sql
-- Migration: Switch auto_generate_faqs() from GUC to inline Vault lookup
-- for the service role key. notify_sitemap_ping() unchanged in behavior;
-- recreated only to keep the pair in sync and re-stamp the COMMENT.
-- Target project: zbzrmpmqijvmjbhctfoe (Everence Wealth) ONLY.

-- ─────────────────────────────────────────────────────────────
-- 1. notify_sitemap_ping() — unchanged logic, refreshed comment
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
SET search_path TO 'public'
AS $function$
DECLARE
  v_supabase_url     TEXT;
  v_service_role_key TEXT;
BEGIN
  IF NEW.status = 'published'
     AND (NEW.qa_entities IS NULL OR jsonb_array_length(NEW.qa_entities) = 0) THEN

    -- URL: GUC first, Everence-only fallback
    v_supabase_url := current_setting('app.settings.supabase_url', true);
    IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
      v_supabase_url := 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
    END IF;

    -- Service role key: inline Vault lookup (never literal, never GUC)
    SELECT decrypted_secret
      INTO v_service_role_key
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
```

### Safety properties

- Zero literal JWTs anywhere in the file.
- No reference to `kazggnufaoicopvmwhdl` in any code path.
- `CREATE OR REPLACE` only — no triggers fire during migration.
- No edge functions deployed, invoked, or warmed.
- No `ALTER DATABASE` statement (sidesteps the tooling block entirely).
- Existing migration files untouched.

### Post-migration verification (read-only)

```sql
-- Confirm both functions reference the right things
SELECT proname,
       (pg_get_functiondef(oid) ILIKE '%kazggnufaoicopvmwhdl%') AS has_foreign_ref,
       (pg_get_functiondef(oid) ILIKE '%vault.decrypted_secrets%') AS reads_vault,
       (pg_get_functiondef(oid) ILIKE '%zbzrmpmqijvmjbhctfoe%') AS has_everence_ref
FROM pg_proc
WHERE proname IN ('notify_sitemap_ping', 'auto_generate_faqs')
  AND pronamespace = 'public'::regnamespace;
```

Expected:
| function | has_foreign_ref | reads_vault | has_everence_ref |
|---|---|---|---|
| notify_sitemap_ping | false | false | true |
| auto_generate_faqs | false | true  | true |

### Out of scope

- No edge function changes
- No app code changes
- No GUC changes (`app.settings.supabase_url` may still be set later if you want; not required)
- No connection to any non-Everence project

### Execution order on approval

1. Run pre-flight `SELECT` against Vault to confirm `service_role_key` exists and is non-null.
2. If confirmed → apply the migration above.
3. Run the post-migration verification query and report the table.
4. Confirm: "All changes target `zbzrmpmqijvmjbhctfoe` only. Service role key never printed. Foreign project `kazggnufaoicopvmwhdl` not contacted."

