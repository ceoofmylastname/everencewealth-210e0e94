
# Fix Desktop Navigation Dropdown Positioning

## Problem Identified

The navigation dropdown menus are appearing offset to the right instead of directly below the selected menu item. This happens due to two issues in the current implementation:

1. **Shared Layout Animation**: The `layoutId="active"` prop causes Framer Motion to animate the dropdown container between menu items, creating a "sliding" effect that makes the menu appear to jump to the right
2. **Centering Miscalculation**: The current approach centers the dropdown relative to the menu item text, but with variable-width dropdown content, this causes visual misalignment

## Solution

Remove the problematic `layoutId` animation and adjust the positioning to keep dropdowns directly below their trigger items, making navigation smoother and more intuitive.

## Technical Changes

### File: `src/components/ui/navbar-menu.tsx`

**Change 1: Remove `layoutId` from dropdown container (Line 45-48)**

The `layoutId="active"` causes the dropdown to animate/slide between positions when switching menu items. Removing it ensures each dropdown appears independently below its trigger.

```text
Before:
<motion.div
  transition={transition}
  layoutId="active"    <-- REMOVE THIS
  className="bg-white rounded-2xl..."
>

After:
<motion.div
  transition={transition}
  className="bg-white rounded-2xl..."
>
```

**Change 2: Keep dropdown anchored to left edge instead of center (Line 41)**

Currently uses `left-1/2 -translate-x-1/2` which centers the dropdown. For the Explore menu (which is wide), this causes overflow to the right. Change to anchor from the left edge for consistent positioning.

```text
Before:
className="absolute top-full left-1/2 -translate-x-1/2 z-[60]"

After:
className="absolute top-full left-0 z-[60]"
```

**Note**: This anchors dropdowns to the left edge of each menu item, which works well for all menus. An alternative is to use `left-1/2 -translate-x-1/4` for a slight left offset, but left-aligned is more predictable.

## Visual Comparison

```text
BEFORE (Current Behavior):
+-------+-------+---------+-------+
|Explore| Learn | Compare | About |
+-------+-------+---------+-------+
              |
              v
        +--------------+
        | Dropdown     |  <-- Appears offset to right
        | slides when  |
        | switching    |
        +--------------+


AFTER (Fixed Behavior):
+-------+-------+---------+-------+
|Explore| Learn | Compare | About |
+-------+-------+---------+-------+
|               |
v               v
+---------+  +------+
| Explore |  | Learn|  <-- Each appears directly below
| dropdown|  | menu |
+---------+  +------+
```

## Files Modified

| File | Change |
|------|--------|
| `src/components/ui/navbar-menu.tsx` | Remove `layoutId`, adjust positioning |

## Expected Result

After this fix:
- Hovering "Explore" shows dropdown directly below "Explore"
- Hovering "Learn" shows dropdown directly below "Learn"
- No sliding/jumping animation between dropdowns
- Dropdowns stay visible when moving mouse down to select options
- The invisible "bridge" element (already present) maintains hover continuity
