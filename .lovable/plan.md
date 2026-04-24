

## List Vault entry names (Everence Wealth only)

**Target:** `zbzrmpmqijvmjbhctfoe` only. No contact with `kazggnufaoicopvmwhdl`. No secret values or lengths exposed — names only.

### Step 1 — Migration: create second temporary helper

Single migration adding a `SECURITY DEFINER` function that returns ONLY the `name` column from `vault.decrypted_secrets`. The existing helper `_tmp_check_vault_service_role_key` is left in place as instructed.

```sql
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
```

### Step 2 — Read-only invocation via `supabase--read_query`

```sql
SELECT secret_name FROM public._tmp_list_vault_secret_names();
```

I report the full list of names back to you verbatim. Nothing else is read, derived, or logged.

### Step 3 — Diagnosis

Based on the returned list, we identify which name (if any) holds the service role key. Likely outcomes:

- **Empty list** → Vault is empty in this project. The key you added may have been added to **Edge Function secrets** (visible in `<secrets>` as `SUPABASE_SERVICE_ROLE_KEY`) rather than Supabase Vault. These are two separate stores. We then pivot to Option C-alt: read from a different mechanism, or you re-add via the Vault UI.
- **List contains `service_role_key`** → contradicts the prior `secret_exists = false` result; would indicate a permissions/search_path quirk. We re-run `_tmp_check_vault_service_role_key` to reconcile.
- **List contains a similarly-named entry** (e.g. `SERVICE_ROLE_KEY`, `supabase_service_role_key`, `everence_service_key`) → name mismatch confirmed. You either rename in Vault UI or I rewrite the trigger functions to read from the actual name found.

### Step 4 — Report and pause

I stop after reporting the list. No trigger migration runs. Both temporary helpers (`_tmp_check_vault_service_role_key` and `_tmp_list_vault_secret_names`) remain in place pending your next instruction.

### Safety properties

- New helper returns only `text` names — no `decrypted_secret`, no `length()`, no `key_id`, no metadata.
- `SECURITY DEFINER` + restricted `search_path` — same posture as existing helper.
- Zero literal JWTs anywhere.
- No reference to `kazggnufaoicopvmwhdl` in any code path.
- No edge function deploys, invokes, or warm-ups.
- No `ALTER DATABASE`, no trigger changes, no app code changes.
- Existing migration files untouched.

### Out of scope

- Dropping either temporary helper (deferred per your instruction)
- Modifying `auto_generate_faqs` or `notify_sitemap_ping`
- Setting GUCs
- Any contact with non-Everence projects

### Confirmation on completion

After reporting the list I'll say: "Vault names listed for `zbzrmpmqijvmjbhctfoe` only. No secret values or lengths were read or printed. Foreign project `kazggnufaoicopvmwhdl` not contacted. Helper `_tmp_check_vault_service_role_key` left in place per instructions."

