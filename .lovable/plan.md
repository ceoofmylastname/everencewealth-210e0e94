

## Fix: Duplicate Slug Error in Comparison Generator

### Problem

When you generate a "Term Life vs Whole Life" comparison, it produces a deterministic slug like `term-life-vs-whole-life-insurance-2025`. Since you already have comparisons with that slug in the database, the insert fails with a **409 duplicate key** error. This cascades into the Spanish translation also failing because the English comparison was never saved (so there is no `comparison_id` to pass).

### Solution

Two changes to make the flow resilient to duplicate slugs:

**1. Frontend: Use `upsert` or append a suffix to avoid slug collisions** (`src/pages/admin/ComparisonGenerator.tsx`)

- Before inserting, check if the slug already exists in the database
- If it does, append a numeric suffix (e.g., `-2`, `-3`) to make the slug unique
- After a successful insert, capture the returned `id` so the translation step has a valid `comparison_id`
- Use `.insert(...).select().single()` so the saved record (with its `id`) is available for the next step

**2. Frontend: Pass the saved English record's `id` to the translate call**

Currently `englishComparison` is set from the edge function response, which has no `id`. After the DB insert succeeds, update `englishComparison` with the returned record so `.id` is available for the Spanish translation call.

### Technical Details

**File: `src/pages/admin/ComparisonGenerator.tsx` (lines ~217-228)**

- Change the insert to use `.insert({...}).select().single()` to get the saved record back
- Before inserting, query for existing slugs matching the base slug and generate a unique variant
- After English insert succeeds, set `englishComparison` to the saved record (which includes `id`)

```text
Flow before fix:
  generate-comparison -> comparison (no id)
  insert comparison -> 409 FAIL (duplicate slug)
  translate-comparison(id=undefined) -> 400 FAIL

Flow after fix:
  generate-comparison -> comparison (no id)
  check slug exists -> append suffix if needed
  insert comparison -> SUCCESS, returns record with id
  translate-comparison(id=saved_record.id) -> SUCCESS
```

