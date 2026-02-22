

# Guided Spotlight Tour (Replaces Centered Modal)

## What Changes

Instead of a popup in the middle of the screen, the tour will **highlight each actual sidebar section** with a spotlight effect and position a tooltip card next to it. The tour literally "walks" through the sidebar, scrolling and animating to each nav group.

## How It Works

### Desktop (sidebar always visible)
1. A dark overlay covers the entire screen with a **cutout/spotlight** around the current nav group
2. A sleek tooltip card appears to the **right of the highlighted section** with the title, description, step dots, and Next/Skip buttons
3. As the user clicks "Next", the spotlight **smoothly animates** down the sidebar to the next group, scrolling the sidebar nav if needed
4. The cutout uses CSS `clip-path` or a canvas-based approach for the spotlight hole

### Mobile (sidebar is a drawer)
1. Tour automatically **opens the mobile sidebar drawer** when it starts
2. Same spotlight + tooltip behavior, but the tooltip appears **below the highlighted section** (since there's no room to the right)
3. Sidebar stays open throughout the tour; closes on dismiss/completion

## Visual Design
- Dark semi-transparent overlay (same backdrop blur as current)
- Spotlight cutout with a subtle glowing border (brand green) around the highlighted nav group
- Tooltip card: compact white card with rounded corners, shadow, containing:
  - Step badge (e.g., "Portal -- 1/5")
  - Title + description
  - Small icon row showing the section's nav items
  - Dot indicators + Next/Skip buttons
- Smooth spring animation when spotlight moves between sections
- Pulse animation on the highlighted area to draw attention

## Technical Approach

### PortalLayout.tsx changes
- Add `data-tour-group="Portal"`, `data-tour-group="Market"`, etc. to each nav group `<div>` wrapper in the sidebar
- Pass `setMobileOpen` to the tour component so it can open the sidebar on mobile

### PortalOnboardingTour.tsx -- full rewrite
- On mount, query `[data-tour-group="Portal"]` to get the bounding rect of the current step's target
- Render a full-screen overlay with a rectangular cutout (using `clip-path: polygon(...)` or an SVG mask) positioned over the target element
- Render the tooltip card absolutely positioned next to the cutout
- On "Next", update the target selector, recalculate position, and animate the cutout + tooltip to the new location using Framer Motion
- Use `ResizeObserver` and scroll listeners to keep positions accurate
- On mobile: call `setMobileOpen(true)` on mount, use a slight delay for the drawer animation, then start highlighting

### Step-to-Element Mapping
Each step maps to a `data-tour-group` value:
| Step | data-tour-group | Tooltip Position |
|------|----------------|-----------------|
| 0 | Portal | Right (desktop) / Below (mobile) |
| 1 | Market | Right / Below |
| 2 | Resources | Right / Below |
| 3 | Contracting | Right / Below |
| 4 | Compliance | Right / Below |

### Files Modified
1. **`src/components/portal/PortalOnboardingTour.tsx`** -- Complete rewrite to spotlight-based guided tour
2. **`src/components/portal/PortalLayout.tsx`** -- Add `data-tour-group` attributes to nav group wrappers; pass `setMobileOpen` prop to tour component

