

## Remediation Plan — Scrub foreign Supabase project ref from Everence Wealth

**Target project:** `zbzrmpmqijvmjbhctfoe` (Everence Wealth) — exclusively.
**Foreign project to neutralize:** `kazggnufaoicopvmwhdl` (Del Sol Prime Homes) — will not be contacted, queried, or referenced in any executable code path after this task.

---

### Task 1 — One new migration: rewrite the two trigger functions

Create a single new file in `supabase/migrations/` with today's UTC timestamp prefix. No existing migration file is modified.

**Full SQL diff (preview — not yet applied):**

```sql
-- Migration: Remove foreign Supabase project reference (kazggnufaoicopvmwhdl)
-- from notify_sitemap_ping() and auto_generate_faqs(). Replace with Everence
-- Wealth project (zbzrmpmqijvmjbhctfoe) and harden via GUC fallback so URLs
-- can never silently drift to a foreign project again.

-- ─────────────────────────────────────────────────────────────
-- 1. notify_sitemap_ping() — replaces hardcoded foreign URL
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
  -- Only proceed if status is being set to 'published'
  IF TG_OP = 'INSERT' THEN
    IF NEW.status != 'published' THEN
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status != 'published' OR OLD.status = 'published' THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Slug source depends on table
  IF TG_TABLE_NAME = 'location_pages' THEN
    v_slug := NEW.topic_slug;
  ELSE
    v_slug := NEW.slug;
  END IF;

  -- Resolve Supabase URL: GUC first, then Everence fallback (NEVER foreign)
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
    v_supabase_url := 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
  END IF;

  PERFORM net.http_post(
    url     := v_supabase_url || '/functions/v1/ping-indexnow',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object(
      'table',  TG_TABLE_NAME,
      'slug',   v_slug,
      'action', TG_OP
    )
  );

  RAISE NOTICE 'IndexNow ping triggered for % - %', TG_TABLE_NAME, v_slug;
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.notify_sitemap_ping() IS
  'Pings IndexNow on publish. Updated YYYY-MM-DD: removed hardcoded foreign Supabase project ref (kazggnufaoicopvmwhdl); now uses GUC app.settings.supabase_url with Everence (zbzrmpmqijvmjbhctfoe) fallback.';

-- ─────────────────────────────────────────────────────────────
-- 2. auto_generate_faqs() — replaces hardcoded foreign fallback
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

    v_supabase_url     := current_setting('app.settings.supabase_url',     true);
    v_service_role_key := current_setting('app.settings.service_role_key', true);

    -- Everence fallback ONLY (never foreign)
    IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
      v_supabase_url := 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
    END IF;

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
  'Auto-backfills FAQs on publish. Updated YYYY-MM-DD: removed hardcoded foreign Supabase project ref (kazggnufaoicopvmwhdl); now uses GUC app.settings.supabase_url with Everence (zbzrmpmqijvmjbhctfoe) fallback. Service role key sourced from GUC, never literal.';
```

**Key safety properties of this migration:**

- Zero literal JWTs (no anon, no service role pasted as string).
- No `net.http_post` to any foreign URL — fallback is hardcoded to Everence only.
- Functions are recreated, not invoked. No trigger fires during the migration.
- Existing migration files are untouched.

---

### Task 2 — Doc file scrubs (4 files, find/replace only)

For each file: replace every literal `kazggnufaoicopvmwhdl` with `zbzrmpmqijvmjbhctfoe`. Anon JWTs that decode to `ref: kazggnufaoicopvmwhdl` will be replaced with the placeholder string `YOUR_SUPABASE_ANON_KEY` (since pasting the live Everence anon key into docs is unnecessary and a doc is not a runtime). No other line edits.

Affected files and occurrence counts (from audit):

| File | Replacements |
|---|---|
| `DEPLOYMENT_GUIDE.md` | `kazggnufaoicopvmwhdl` → `zbzrmpmqijvmjbhctfoe`; foreign JWT example → `YOUR_SUPABASE_ANON_KEY` |
| `DEPLOYMENT_SSG_CHECKLIST.md` | same rule |
| `README_STATIC_SEO.md` | same rule |
| `SCHEMA_DOCUMENTATION.md` | same rule |

Exact diffs will be generated and shown to you for review before write, per your instruction.

---

### Out of scope (explicitly NOT touched)

- Any existing file in `supabase/migrations/` (historical record stays intact)
- `functions/_middleware.js`, citation blocklists, any `costadelsol*.com` reference
- `.env`, `supabase/config.toml`, `src/integrations/supabase/client.ts`, every edge function
- No edge function deploy, invoke, warm-up, or test
- No connection to any other Supabase / Lovable / GitHub project

---

### Review gate

On approval I will:

1. Generate the migration file with today's UTC timestamp and present the final SQL.
2. Generate per-file unified diffs for the 4 docs.
3. Pause for your go-ahead before running the migration tool or writing any file.

**Confirmation:** All planned changes target Supabase project `zbzrmpmqijvmjbhctfoe` only. Project `kazggnufaoicopvmwhdl` will not be contacted, deployed to, queried, or referenced in any runtime code path.

