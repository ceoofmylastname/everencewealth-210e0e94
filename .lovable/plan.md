

# Collapsible Tab Navigation for Portal Sidebar

## What Changes

The five sidebar navigation groups -- **Portal, Market, Resources, Contracting, Compliance** -- will become clickable collapsible tabs. Clicking a group label toggles its dropdown of nav items open/closed, instead of all items being visible at once. The currently active group (based on the current route) will auto-expand on load.

## Behavior

- Each group label becomes a clickable row with a chevron icon that rotates when open
- Only one group can be open at a time (accordion-style) to keep the sidebar clean
- The group containing the active route auto-opens on page load/navigation
- Locked groups (when gated) still show the label but items inside remain locked with the existing lock icon behavior
- Smooth expand/collapse animation

## Visual Layout

```text
Sidebar:
+---------------------------+
| Everence Wealth           |
|---------------------------|
| > Portal           [v]   |  <- click to expand
|   Dashboard               |
|   Clients                 |
|   Policies                |
|   CNA                     |
|   Messages                |
|---------------------------|
| > Market            [>]   |  <- collapsed
|---------------------------|
| > Resources         [>]   |  <- collapsed
|---------------------------|
| > Contracting       [>]   |  <- collapsed
|---------------------------|
| > Compliance        [>]   |  <- collapsed
+---------------------------+
```

## Technical Details

### File Modified
- `src/components/portal/PortalLayout.tsx`

### Implementation
- Import `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible` (already used in AdminLayout)
- Add state: `openGroup` (string | null) tracking which single group is expanded
- Auto-set `openGroup` based on which group contains the current route (using `useLocation`)
- Replace the static group rendering with `Collapsible` wrappers:
  - The group label becomes a `CollapsibleTrigger` styled as a clickable row with a `ChevronDown`/`ChevronRight` icon
  - The nav items go inside `CollapsibleContent`
- Clicking a group label toggles it: if already open, close it; if closed, open it and close the previous one
- Gating logic stays the same -- locked groups still show locked items inside their dropdown

### No database changes needed
