

# Phase 7.7: Enhanced Training Center

## Overview
Rebuild the Training Center page with search, dual filters (category + level), stats cards showing completion progress, and richer training cards with thumbnail support and progress indicators.

## No Database Migration Needed
All required columns already exist:
- `trainings`: title, category, level, duration_minutes, description, thumbnail_url, video_url, status
- `training_progress`: advisor_id, training_id, progress_percent, completed, completed_at

## Changes

### Rebuild `src/pages/portal/advisor/TrainingCenter.tsx`

**1. Stats Cards Row** (3 cards across the top):
- Trainings Completed -- count of progress records where `completed = true`
- Total Watch Time -- sum of `duration_minutes` for completed trainings (actual, not approximate)
- In Progress -- count of progress records where `progress_percent > 0` and `completed = false`

**2. Search and Filters Section:**
- Search bar with icon -- filters by title or description
- Category filter badges: All, plus dynamic categories from data (single-select, matching existing pill pattern)
- Level filter badges: All Levels, Beginner, Intermediate, Advanced (single-select)

**3. Training Cards Grid** (1-2-3 column responsive):
Each card shows:
- Thumbnail image (from `thumbnail_url`) or a gradient placeholder with GraduationCap icon
- Level badge (color-coded: green/blue/purple using existing `levelColors`)
- Duration with clock icon
- Completed checkmark indicator when `completed = true`
- Title and description (truncated)
- Progress bar when in-progress (not completed, progress > 0)
- Action button: "Start Training", "Continue", or "Watch Again" based on progress state
- Links to `/portal/advisor/training/{id}`

**4. Empty State:**
- GraduationCap icon with "No trainings match your filters" message

## Technical Details

- **State**: Add `searchQuery` (string), `selectedLevel` (string | null) alongside existing category filter renamed to `selectedCategory`
- **Progress data**: Fetch full training_progress records (including `completed`, `completed_at`, `duration_minutes` join) instead of just `progress_percent`
- **Filtering**: Client-side using `useMemo` -- matches search against title/description, filters by category and level
- **Stats calculation**: Computed from progress array after fetch -- completed count, sum of matched training durations, in-progress count
- **Imports**: Add `Search`, `Play`, `CheckCircle`, `TrendingUp` from lucide-react; add `Button` and `Input` components
- **Auth**: Continue using `usePortalAuth` and `portal_user_id` to find the advisor record
- Maintains Playfair Display heading and existing spinner pattern

