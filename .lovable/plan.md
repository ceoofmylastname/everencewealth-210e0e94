

# Phase 7.5: Enhanced Quoting Tools Hub

## Overview
Rebuild the Tools Hub page to focus the Quoting Tools tab with search, type-based filtering via clickable badges, carrier logo display, and login instruction handling. The Calculators tab remains unchanged.

## No Database Migration Needed
The `quoting_tools` table already has all required columns: `tool_name`, `tool_type`, `tool_url`, `carrier_id`, `description`, `requires_login`, `login_instructions`, `featured`. The carriers join already provides `carrier_name` and `carrier_logo_url`.

## Changes

### Rebuild Quoting Tools tab in `src/pages/portal/advisor/ToolsHub.tsx`

**Enhanced Quoting Tools tab:**
- **Search bar** with icon, filtering by tool name or carrier name
- **Type filter badges**: Clickable pills for All, Quick Quote, Agent Portal, Microsite, Illustration System, Application Portal -- single-select
- **Tool cards** in a responsive grid (1-2-3 columns) showing:
  - Carrier logo (from joined `carriers.carrier_logo_url`)
  - Tool name and carrier name
  - Tool type badge
  - Description (truncated)
  - "Login Required" indicator with lock icon when `requires_login` is true
  - "Open Tool" button linking to `tool_url`
  - "Login Instructions" button (if `login_instructions` exists) -- could use a tooltip or dialog
- **Empty state** when no tools match filters

**Calculators tab**: Kept as-is (no changes).

**Data fetching update**: Expand the carriers join to include `carrier_logo_url`:
```
.select("*, carriers(carrier_name, carrier_logo_url)")
```

## Technical Details

- Filter state: `searchQuery` (string) and `selectedType` (string | null)
- Filtering is done client-side with `useMemo` or inline
- Uses existing `Input`, `Badge`, `Button`, `Card`, `Tabs` components
- Maintains Playfair Display heading and existing loading spinner pattern
- Login instructions shown via a simple expandable section or tooltip to avoid adding a modal dependency

