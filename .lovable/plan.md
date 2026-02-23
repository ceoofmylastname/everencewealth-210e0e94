

# Fix: "JSON object requested, multiple (or no) rows returned"

## Root Cause

The `advisor_slugs` table has duplicate active slugs for the same advisor (both `john-mel` and `johnmelvin` are marked `is_active = true`). When the code calls `.maybeSingle()`, it crashes because 2 rows are returned instead of 0 or 1.

## Fix

### 1. Clean up duplicate data

Deactivate the older duplicate slug, keeping only the most recent one (`john-mel`).

### 2. Add a unique constraint

Add a database constraint so only one active slug per advisor can exist, preventing this from happening again.

### 3. Fix queries defensively

In both `WorkshopSlugSetup.tsx` and `WorkshopCreate.tsx`, add `.limit(1)` before `.maybeSingle()` on the `advisor_slugs` query and order by `created_at desc` so the most recent slug is always picked.

## Files Modified

- `src/pages/portal/advisor/WorkshopSlugSetup.tsx` -- add `.order("created_at", { ascending: false }).limit(1)` to the slug query
- `src/pages/portal/advisor/WorkshopCreate.tsx` -- same fix for the slug query
- Database migration: deactivate duplicate slug and add a unique partial index on `(advisor_id) WHERE is_active = true`

