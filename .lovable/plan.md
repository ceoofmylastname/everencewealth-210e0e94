

# Enhanced Card UI — Advisor & Client Dashboards

## Summary
Update card styling across both dashboards to make sections more visually dominant and distinct with stronger borders, deeper shadows, and a subtle 3D lift effect — while keeping the clean professional aesthetic.

## Design Changes

### Card Styling Updates (applied consistently to both dashboards)

**Current**: `bg-white rounded-xl border border-gray-100 shadow-sm`

**New**: `bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]`

Key differences:
- `rounded-2xl` -- slightly more rounded for modern feel
- `border-gray-200` -- more visible border so cards stand out from the background
- `shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]` -- deeper, softer shadow creating a subtle 3D float effect
- Hover state upgraded to `hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:translate-y-[-2px]` -- cards lift slightly on hover for a 3D interaction feel

### Stat Cards (top row)
- Larger icon containers (`h-11 w-11` up from `h-10 w-10`)
- Bolder value text (`text-3xl font-extrabold` up from `text-3xl font-bold`)
- Slightly thicker left-accent border on hover for directional emphasis

### Section Headers (News, Events, Clients, Policies, Advisor)
- Bump heading size from `text-base` to `text-lg font-bold`
- Slightly more padding in header rows

### Quick Actions (Advisor only)
- Each action tile gets `shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100` so they read as distinct clickable cards rather than flat pills

## Files Changed

| File | Changes |
|---|---|
| `src/pages/portal/advisor/AdvisorDashboard.tsx` | Update all card classNames with enhanced border/shadow/hover styles |
| `src/pages/portal/client/ClientDashboard.tsx` | Same card styling updates for consistency |

No database changes needed. Pure CSS/className updates.

