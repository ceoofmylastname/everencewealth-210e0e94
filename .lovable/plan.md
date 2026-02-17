

# Fix Build Errors and Further Modernize Portal Dashboards

## Problem
The build is failing due to unused imports left behind from the previous UI update. Both dashboard files import components that are no longer used in their JSX.

## Phase 1: Fix Build Errors (Unused Imports)

### `src/pages/portal/client/ClientDashboard.tsx`
- Remove unused imports: `Card`, `CardContent`, `CardHeader`, `CardTitle`, `Badge`, `TrendingUp`
- These were from the old UI but the new JSX uses plain `div` elements with Tailwind classes

### `src/pages/portal/advisor/AdvisorDashboard.tsx`  
- Verify all imports are used (they appear to be)

## Phase 2: Enhanced Dashboard UI (Matching Reference)

Based on the Donezo-style reference image, upgrade both dashboards with a more polished, card-based layout:

### Client Dashboard Enhancements
- Add a **Messages stat card** (3-column grid instead of 2) with message count from existing data
- Add a **"Your Advisor" sidebar card** in a 2/3 + 1/3 layout showing advisor info
- Add skeleton loading states using the existing `Skeleton` component instead of a spinner
- Add staggered fade-in animations on stat cards

### Advisor Dashboard Enhancements  
- Add skeleton loading states for all sections
- Improve the stat cards with subtle trend indicators
- Add a **"Recent Clients" section** showing the latest 5 clients (new query on `portal_users` already available via `clients` count)
- Refine Quick Actions with slightly larger touch targets

### Portal Layout
- No changes needed (already modernized)

## Technical Details

### Files to modify:
1. `src/pages/portal/client/ClientDashboard.tsx` — Remove unused imports, add Messages card, advisor sidebar, skeleton loaders
2. `src/pages/portal/advisor/AdvisorDashboard.tsx` — Add skeleton loaders, verify imports

### What stays the same:
- All Supabase queries and data fetching logic
- All routing and navigation links
- All state management
- Authentication and RLS
- PortalLayout sidebar and top bar

### Styling approach:
- Continue using Tailwind utility classes with `rounded-2xl`, `shadow-sm`, hover transitions
- Use existing Evergreen brand colors (primary = #1A4D3E)
- Skeleton component from `@/components/ui/skeleton` for loading states
- `animate-fade-in` from existing animation utilities for staggered entry

