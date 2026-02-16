

# Fix: "Failed to load master prompt" Error

## Root Cause
The `content_settings` table is empty -- there is no row where `setting_key = 'master_content_prompt'`. The `MasterPromptEditor` component queries with `.single()`, which throws an error when no matching row exists, triggering the "Failed to load master prompt" toast.

## Fix (2 changes)

### 1. Seed the missing row (database migration)
Insert a default row into `content_settings` so the editor has something to load:

```sql
INSERT INTO content_settings (setting_key, setting_value)
VALUES ('master_content_prompt', '')
ON CONFLICT DO NOTHING;
```

### 2. Harden `MasterPromptEditor.tsx` against missing data
Update `loadPrompt` to use `.maybeSingle()` instead of `.single()`, and auto-create the row if it does not exist. This prevents the error from recurring if the row is ever deleted.

**Changes in `loadPrompt`:**
- Replace `.single()` with `.maybeSingle()`
- If `data` is `null` (no row found), insert a default empty row and set state to empty string
- Keep existing error handling for actual database errors

