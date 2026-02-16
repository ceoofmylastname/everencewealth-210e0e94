

# Phase 7.6: Enhanced Calculators Tab

## Overview
Enhance the Calculators tab within the existing Tools Hub page with category filter badges, category-aware icons, and improved card layout with a "Use Calculator" button.

## No Database Migration Needed
The `calculators` table already has all required columns: `calculator_name`, `category`, `description`, `external_url`, `calculator_type`, `active`, `sort_order`.

## Changes

### Edit `src/pages/portal/advisor/ToolsHub.tsx`

**Add to the Calculators tab:**

1. **Category filter badges** at the top -- clickable pills for All, Cash Flow, Retirement, Life and Income, Tax Planning, Estate Planning (single-select, matching the quoting tools filter pattern)

2. **Category icon mapping** -- each category gets a distinct icon:
   - `cash_flow` -> DollarSign
   - `retirement` -> Calendar
   - `life_income` -> TrendingUp
   - `tax_planning` / `estate_planning` -> Calculator (default)

3. **Grouped display** -- categories shown as sections with icon + heading + count badge, only visible categories based on filter

4. **Improved calculator cards** -- each card shows:
   - Category icon (colored)
   - Calculator name (bold)
   - Description (truncated)
   - "Use Calculator" button linking to `external_url` (replaces the small "Open" link)

5. **State**: Add `selectedCategory` (string | null) state for the category filter

### Technical Details

- New state variable: `selectedCategory`
- New constant: `CALC_CATEGORIES` array with key, label, and icon
- New import: `DollarSign`, `TrendingUp`, `Calendar` from lucide-react
- Filter logic: when `selectedCategory` is set, only show that category's section
- Cards use the existing `Card`/`CardContent` components with the "Use Calculator" `Button`
- No changes to the Quoting Tools tab or data fetching logic

