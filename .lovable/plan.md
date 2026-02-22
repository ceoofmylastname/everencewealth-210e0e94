

# Mobile-First Agents CRM Dashboard

## Problem
The current Agents page uses a 12-column data table that requires horizontal scrolling on mobile devices. Filters use fixed-width selects that overflow on small screens. There's no card-based mobile view.

## Solution
Rebuild the page with a mobile-first approach: card-based agent list on mobile, full table on desktop, with touch-friendly filters and improved stat cards.

## Changes (single file)

**File:** `src/pages/portal/advisor/contracting/ContractingAgents.tsx` -- rewrite

### Mobile Layout (below 768px)

1. **Stat Cards**: 2x2 grid with the 5th card spanning full width, larger touch targets (min 48px height), bolder typography
2. **Filters**: Horizontal scrollable pill/chip row for quick filters (Status, Stage, Licensed), full-width search bar above
3. **Agent Cards** (replaces table): Each card shows:
   - Avatar initials + full name (tappable, links to detail)
   - Stage pill (color-coded) + Licensed badge
   - Progress bar with percentage
   - Manager name, days in pipeline, last activity as compact metadata row
   - Email + phone as secondary info
   - Approve button (if applicable) as full-width action
   - Red left-border accent for stuck agents (7d+ inactive)
   - Min 44px touch targets on all interactive elements

### Desktop Layout (768px+)

4. **Keep existing table** but wrap in responsive container that only renders on md+ screens
5. Stat cards switch to 5-column grid
6. Filters display inline horizontally

### Technical Approach

- Use the existing `useMediaQuery` hook or Tailwind responsive classes
- Conditionally render card list vs table based on screen size
- Extract `MobileAgentCard` as an inline component within the same file
- All data fetching, real-time subscriptions, and filter logic remain unchanged
- Add `pb-24` safe area padding at bottom for mobile
- Touch targets minimum 44px height on buttons and tappable areas

### UI Polish (both views)

- Smoother stat card design with subtle gradient backgrounds
- Improved color palette for stage pills (slightly more saturated)
- Better spacing and padding throughout
- Sticky search bar on mobile scroll
- Empty state with illustration for zero results

