

## Insert service role key into Vault, then run Migration B

**Target:** `zbzrmpmqijvmjbhctfoe` (Everence Wealth) only. No contact with `kazggnufaoicopvmwhdl`. Service role key value never printed, logged, or written to any `.sql` file on disk.

### Why this works

The Edge Function runtime in this project has `SUPABASE_SERVICE_ROLE_KEY` available as `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`. A short-lived edge function can read that env var in memory and call `vault.create_secret` / `vault.update_secret` via the `service_role` PostgREST connection — the key never leaves the runtime as a literal in source, never lands in a migration file, never appears in chat output.

### Step 1 — Diagnostic read (no writes)

Via `supabase--read_query`:

```sql
SELECT
  (SELECT COUNT(*) FROM vault.secrets           WHERE name = 'service_role_key') AS raw_rows,
  (SELECT COUNT(*) FROM vault.decrypted_secrets WHERE name = 'service_role_key') AS decrypted_rows;
```

Report the two integers only. This tells us whether to `update_secret` (raw row exists) or `create_secret` (no row).

### Step 2 — Deploy ephemeral edge function `_tmp_seed_vault_key`

Single-purpose function in `supabase/functions/_tmp_seed_vault_key/index.ts`. Behavior:

1. Reads `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` into a local `const key`.
2. Connects to the database using that same key as the PostgREST `Authorization: Bearer …` header (so the call runs as `service_role`, which can write to `vault`).
3. Calls a tiny SQL RPC `public._tmp_seed_vault_key(p_key text)` (created in Step 2a) which decides `update` vs `create` server-side based on the diagnostic row counts.
4. Returns ONLY `{ ok: true, action: 'created'|'updated' }` — never echoes the key, never logs it, never includes its length.

The literal key value exists only:
- In the env var (already there, not introduced by us)
- In the in-memory `key` constant for the duration of the request
- In `pg_net` request body sent over TLS to PostgREST

It does NOT appear in:
- Any `.sql` migration file on disk
- Any chat response
- Any tool call argument I emit
- Any log line in the function

#### Step 2a — Migration: helper RPC `_tmp_seed_vault_key(p_key text)`

A migration file is created, but it contains ONLY the function definition with a `text` parameter — no key value:

```sql
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
```

The literal JWT is NOT in this file — only the parameter name `p_key`.

### Step 3 — Invoke the seeder once

Call the edge function. It returns `{ ok: true, action: 'created' }` or `{ ok: true, action: 'updated' }`. I report only that JSON.

### Step 4 — Re-run pre-flight via `supabase--read_query`

```sql
SELECT secret_exists, key_len
FROM public._tmp_check_vault_service_role_key();
```

Report only the boolean and integer. No key material.

### Step 5 — Branching

- **`secret_exists = true` AND `key_len` ≈ 200–260** → proceed to Step 6.
- **Otherwise** → STOP. Report row counts in `vault.secrets` vs `vault.decrypted_secrets` for diagnosis. Leave all helpers in place. No trigger changes.

### Step 6 — Migration B (the previously approved one, with one addition)

Single atomic migration file. Contents identical to the previously approved Migration B, plus a third `DROP` for the new seeder helper:

```sql
-- 1. notify_sitemap_ping() — logic unchanged, comment refreshed
CREATE OR REPLACE FUNCTION public.notify_sitemap_ping() ... $$;
COMMENT ON FUNCTION public.notify_sitemap_ping() IS '...';

-- 2. auto_generate_faqs() — Vault inline lookup
CREATE OR REPLACE FUNCTION public.auto_generate_faqs() ... $$;
COMMENT ON FUNCTION public.auto_generate_faqs() IS '...';

-- 3. Drop ALL temporary helpers
DROP FUNCTION IF EXISTS public._tmp_check_vault_service_role_key();
DROP FUNCTION IF EXISTS public._tmp_list_vault_secret_names();
DROP FUNCTION IF EXISTS public._tmp_seed_vault_key(text);
```

(Full bodies of the two trigger functions are exactly as approved previously — Vault read for `auto_generate_faqs`, GUC + Everence URL fallback for `notify_sitemap_ping`. Zero literal JWTs anywhere.)

### Step 7 — Delete the ephemeral edge function

`supabase--delete_edge_functions` on `_tmp_seed_vault_key`. No lingering attack surface.

### Step 8 — Post-migration verification (read-only)

```sql
SELECT proname,
       (pg_get_functiondef(oid) ILIKE '%kazggnufaoicopvmwhdl%')   AS has_foreign_ref,
       (pg_get_functiondef(oid) ILIKE '%vault.decrypted_secrets%') AS reads_vault,
       (pg_get_functiondef(oid) ILIKE '%zbzrmpmqijvmjbhctfoe%')   AS has_everence_ref
FROM pg_proc
WHERE proname IN (
        'notify_sitemap_ping','auto_generate_faqs',
        '_tmp_check_vault_service_role_key',
        '_tmp_list_vault_secret_names',
        '_tmp_seed_vault_key'
      )
  AND pronamespace = 'public'::regnamespace;
```

Expected:
- `notify_sitemap_ping` → foreign:false, vault:false, everence:true
- `auto_generate_faqs` → foreign:false, vault:true, everence:true
- All three `_tmp_*` rows → not present

### Safety properties

- Service role key value never appears in: chat output, migration `.sql` files, tool call arguments I emit, function logs.
- Key passes only through: existing env var → in-memory const in edge function → TLS request body → `vault.update_secret` / `vault.create_secret`.
- All three temp helpers dropped in the same Migration B that activates Vault reads.
- Ephemeral edge function deleted in Step 7.
- Zero literal JWTs in any file landing on disk.
- No reference to `kazggnufaoicopvmwhdl` anywhere.
- No `ALTER DATABASE`, no GUC changes, no app code changes.

### Out of scope

- Modifying any unrelated trigger or function
- Touching any non-Everence project
- Setting `app.settings.service_role_key` GUC (Vault path is the destination)

### Confirmation on completion

After Step 8 I'll report: "Service role key inserted into Vault on project `zbzrmpmqijvmjbhctfoe` only. Value was never printed, logged, or written to any file on disk. Foreign project `kazggnufaoicopvmwhdl` not contacted."

