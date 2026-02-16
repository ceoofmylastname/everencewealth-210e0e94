

## Fix: Citation Discovery Modal Not Scrollable

### Problem
The Citation Discovery Results modal uses a Radix `ScrollArea` with `flex-1` inside a flex column container. While this should work, the `ScrollArea` component needs a more explicit height constraint to trigger its internal scrollbar. The modal content is cut off and users cannot scroll to see all discovered citations.

### Solution

**File: `src/components/admin/cluster-manager/ClusterCitationsTab.tsx`** (line 561)

Change the `ScrollArea` from using only `flex-1` to having an explicit `min-h-0` class (which is the standard CSS fix for flex children that need to shrink below their content size and enable scrolling):

```
// Before:
<ScrollArea className="flex-1 pr-4">

// After:
<ScrollArea className="flex-1 min-h-0 pr-4">
```

The `min-h-0` is necessary because flex children default to `min-height: auto`, which prevents them from shrinking below their content size. Adding `min-h-0` allows the `ScrollArea` to properly constrain its height within the `max-h-[85vh]` parent container and enable scrolling.

### Technical Detail
- Only one line changes in `ClusterCitationsTab.tsx` (line 561)
- This is a well-known CSS flexbox scrolling fix
- No other files need modification

