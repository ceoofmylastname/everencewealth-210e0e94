

# Modernize Client Portal and Advisor Dashboard UI

## Overview
Redesign the Client Dashboard and Advisor Dashboard to match the clean, modern card-based aesthetic from the reference image -- rounded cards with colored stat banners, clean typography, generous whitespace, and subtle shadows. All existing functionality (data fetching, navigation, links) remains untouched.

## Design Elements to Adopt (from reference)
- **Stat cards** with colored left accent or full background tint (using Evergreen palette), rounded-2xl corners, subtle arrow icons
- **Clean header area** with bold title + subtitle text
- **Card grid layout** with consistent spacing and rounded-2xl borders
- **Softer shadows** (shadow-sm to shadow-md on hover) and border-less card styling
- **Status badges** with colored dots instead of heavy badges
- **Better visual hierarchy** -- larger stat numbers, smaller labels beneath

## Files to Modify

### 1. Client Dashboard (`src/pages/portal/client/ClientDashboard.tsx`)
- Redesign stat cards: Add colored background tint (Evergreen for Policies, Amber for Documents) with rounded-2xl, larger numbers (text-3xl), and a subtle "Increased" or count indicator
- Add a welcome banner card with gradient background using the Evergreen palette
- Restyle the "Recent Policies" list: Use rounded-xl rows with colored status dots, cleaner layout with more breathing room
- Add subtle hover animations (scale, shadow transitions)

### 2. Advisor Dashboard (`src/pages/portal/advisor/AdvisorDashboard.tsx`)
- Redesign the 4 stat cards to use colored background fills (like the reference -- first card has green bg, others have light bg with subtle tint)
- Stat cards get rounded-2xl, larger bold numbers (text-3xl), colored accent icon, and a small trend indicator
- Rank Banner: More prominent with gradient and rounded-2xl
- Quick Actions grid: Rounded-2xl buttons with hover scale effect
- News and Events cards: Cleaner dividers, rounded-2xl containers, dot-style status indicators
- Add a subtle top search/greeting bar area with the user avatar

### 3. Portal Layout (`src/components/portal/PortalLayout.tsx`)
- Sidebar: Add rounded-xl background for active nav item (filled, not just text color), slightly more padding
- Add a subtle top bar on desktop (hidden currently) with user greeting + avatar on the right side, matching reference's top-right user info
- Sidebar brand area: Slightly larger logo area with more polish

## Technical Details

### Styling Approach
- Use existing Tailwind classes + Evergreen brand colors already in config
- rounded-2xl on all major cards
- bg-emerald-50/bg-emerald-600 tints for primary stat cards (maps to Evergreen brand)
- shadow-sm default, shadow-lg on hover with transition-all duration-200
- No new dependencies needed

### Cards Pattern (stat card example)
```
rounded-2xl border-0 shadow-sm hover:shadow-lg transition-all duration-200
First card: bg-[#1A4D3E] text-white (filled green)
Other cards: bg-white border border-border/50
```

### What Stays the Same
- All data fetching logic (useEffect, loadData, loadDashboard)
- All Supabase queries and state management
- All routing/navigation links and hrefs
- PortalLayout sidebar nav items and auth logic
- Mobile responsive behavior

