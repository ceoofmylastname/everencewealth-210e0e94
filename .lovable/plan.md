

## Cleanup: drop broken FAQ trigger, temp helpers, ephemeral function

**Target:** `zbzrmpmqijvmjbhctfoe` (Everence Wealth) only. No contact with `kazggnufaoicopvmwhdl`. No app/config/edge changes other than deleting the one ephemeral function.

### Step 1 — Discover trigger attachments (read-only)

Via `supabase--read_query`:

```sql
SELECT
  c.relname AS table_name,
  t.tgname  AS trigger_name,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_proc    p ON p.oid = t.tgfoid
JOIN pg_class   c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'auto_generate_faqs'
  AND n.nspname = 'public'
  AND NOT t.tgisinternal;
```

I report every `(table_name, trigger_name)` pair before writing the migration so nothing is missed.

### Step 2 — Single cleanup migration

One new migration file in `supabase/migrations/` (today's UTC timestamp). Structure (trigger names filled in from Step 1 results):

```sql
-- Cleanup: remove broken FAQ trigger + temp helpers from Step-1-inserted attempt.
-- Target project: zbzrmpmqijvmjbhctfoe (Everence Wealth) ONLY.

-- 1. Drop every trigger pointing at auto_generate_faqs (one DROP per row found in Step 1).
--    Example shape — actual table/trigger names come from the pg_trigger query.
DROP TRIGGER IF EXISTS <trigger_name_1> ON public.<table_name_1>;
DROP TRIGGER IF EXISTS <trigger_name_2> ON public.<table_name_2>;
-- ...repeat for each row...

-- 2. Drop the broken function itself.
DROP FUNCTION IF EXISTS public.auto_generate_faqs();

-- 3. Drop all three temporary helpers.
DROP FUNCTION IF EXISTS public._tmp_check_vault_service_role_key();
DROP FUNCTION IF EXISTS public._tmp_list_vault_secret_names();
DROP FUNCTION IF EXISTS public._tmp_seed_vault_key(text);

-- 4. Optional Vault cleanup: remove any orphan service_role_key entry left from
--    failed seeder attempts. email_queue_service_role_key is preserved.
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
```

### Step 3 — Delete ephemeral edge function

`supabase--delete_edge_functions` on `tmp-seed-vault-key`. Removes the function file directory and the deployed function. No other functions touched.

### Step 4 — Post-cleanup verification (read-only)

Three small queries:

```sql
-- a) confirm function + helpers are gone
SELECT proname
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'auto_generate_faqs',
    '_tmp_check_vault_service_role_key',
    '_tmp_list_vault_secret_names',
    '_tmp_seed_vault_key'
  );
-- expected: 0 rows

-- b) confirm no remaining triggers reference the dropped function
SELECT c.relname AS table_name, t.tgname AS trigger_name
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_class c ON c.oid = t.tgrelid
WHERE p.proname = 'auto_generate_faqs'
  AND NOT t.tgisinternal;
-- expected: 0 rows

-- c) Vault state — names only
SELECT name FROM vault.secrets ORDER BY name;
-- expected: email_queue_service_role_key (and any unrelated entries),
--           service_role_key absent
```

### Untouched on purpose

- `notify_sitemap_ping` — left as-is (works).
- `email_queue_service_role_key` Vault entry — preserved.
- All app code, all other edge functions, all config files, GUC settings.

### Final report I will deliver

1. Trigger(s) dropped — exact `(table_name, trigger_name)` list from Step 1.
2. Edge function `tmp-seed-vault-key` deleted — confirmed.
3. All three temp helpers and `auto_generate_faqs` confirmed absent (Step 4a/4b).
4. Vault state by name only (Step 4c).
5. Closing line: "All changes target `zbzrmpmqijvmjbhctfoe` only. Foreign project `kazggnufaoicopvmwhdl` not contacted."

