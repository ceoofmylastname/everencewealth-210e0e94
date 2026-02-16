

# Phase 7.4: Enhanced Carrier Directory

## Overview
Enhance the existing Carrier Directory page with advanced filtering (product badges, specialty/niche filters), visual improvements (AM Best rating colors, featured star, carrier descriptions), and add missing database columns to the `carriers` table.

## Step 1: Database Migration

Add 3 missing columns to the `carriers` table:

| Column | Type | Purpose |
|---|---|---|
| `short_code` | TEXT | Carrier abbreviation code (e.g., "PL" for Pacific Life) |
| `portal_url` | TEXT | Link to carrier's agent portal |
| `niches` | TEXT[] | Specialty tags (e.g., "senior", "no_exam", "digital") |

The `description` field maps to the existing `notes` column. The `featured` column already exists.

## Step 2: Rebuild CarrierDirectory.tsx

Replace the current basic carrier directory with the enhanced version from the spec:

- **Search bar** filtering by carrier name or description/notes
- **Product filter badges**: Clickable pills for Term, WL, IUL, FE, Annuity, DI, LTC -- toggleable multi-select
- **Specialty filter badges**: Clickable pills for niches like senior, no_exam, digital, etc.
- **Clear All Filters** button when any filters are active
- **Carrier cards** showing:
  - Logo + name + short code
  - Featured star indicator
  - AM Best rating with color coding (A+ = green, A = blue, B = yellow)
  - Product badges
  - Truncated description (from `notes`)
  - "View Details" link and "Agent Portal" external link (if `portal_url` exists)
- **Empty state** with icon and "Clear Filters" button

## Step 3: Update CarrierDetail.tsx

Minor enhancement to also display:
- Short code next to the carrier name
- Portal URL as an external link button
- Niche/specialty badges section

## Technical Details

### Migration SQL
```sql
ALTER TABLE carriers
  ADD COLUMN IF NOT EXISTS short_code TEXT,
  ADD COLUMN IF NOT EXISTS portal_url TEXT,
  ADD COLUMN IF NOT EXISTS niches TEXT[];
```

### Component Architecture
- Stays as a single file page component (consistent with existing pages)
- Uses existing UI components: `Card`, `CardContent`, `Badge`, `Input`, `Button`
- Uses `useState` for filter state, `useMemo` or inline filtering for derived data
- Follows existing Playfair Display heading style
- Loading spinner pattern matches existing pages

### Filter Logic
- All three filter dimensions (search, products, niches) are AND-combined
- Product and niche filters are OR within their group (any match)
- Clicking a selected filter badge deselects it

