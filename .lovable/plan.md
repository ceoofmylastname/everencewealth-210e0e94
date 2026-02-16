

## Translate All Remaining English Comparisons to Spanish

### Current State

4 out of 5 published English comparisons already have Spanish translations. Only one is missing:
- **Fixed Annuity vs Variable Annuity (retirement-2025)** -- no Spanish version yet

### Changes

**1. Fix the translate-comparison edge function** (`supabase/functions/translate-comparison/index.ts`)

- Change the system prompt from "real estate content" to "financial planning content" to match the rebrand
- Change the default status from `'draft'` to `'published'` so translations go live immediately (matching the standard set by the blog translation pipeline)
- Set `date_published` on the translated record so it appears in feeds

**2. Create a batch-translate-comparisons edge function** (`supabase/functions/batch-translate-comparisons/index.ts`)

A simple function that:
- Queries all published English comparisons
- For each, checks if a Spanish translation exists (by `comparison_topic` + `language = 'es'`)
- Calls the `translate-comparison` function for each missing one
- Returns a summary of what was translated

This gives you a one-click way to ensure 100% coverage going forward whenever new English comparisons are added.

**3. Wire it into the admin UI** (`src/pages/admin/ComparisonGenerator.tsx`)

Add a "Translate All to Spanish" button in the Manage tab that calls `batch-translate-comparisons`. This button will show:
- How many are missing translations
- Progress as each one completes
- Final summary

### Technical Details

The batch function will call `translate-comparison` sequentially (not in parallel) to avoid rate limits on the AI gateway. Each translation takes ~10-15 seconds, so for the 1 currently missing it will be quick. For future bulk runs it scales linearly.

| File | Change |
|---|---|
| `supabase/functions/translate-comparison/index.ts` | Fix "real estate" prompt, set status to published |
| `supabase/functions/batch-translate-comparisons/index.ts` | New edge function for bulk translation |
| `src/pages/admin/ComparisonGenerator.tsx` | Add "Translate All to Spanish" button in Manage tab |

