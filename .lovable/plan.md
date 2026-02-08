
# Default Property Search: New Developments, No Price Minimum, Sorted Low-High

## Summary

Update the property search to show **all new developments** (no price filter) sorted by **price ascending** on page load. This will display all ~421 new development properties starting from the cheapest available.

---

## Changes Required

### 1. Remove €400,000 Price Minimum Default

**Files to update:**

| File | Change |
|------|--------|
| `src/pages/PropertyFinder.tsx` (Line 56) | Remove `400000` default, use `undefined` |
| `src/components/property/PropertyFilters.tsx` (Lines 70, 97) | Remove `"400000"` default, use empty string `""` |
| `supabase/functions/search-properties/index.ts` (Line 145) | Remove hardcoded fallback, only pass minPrice if provided |

### 2. Set Default Sort to Price Low-High

**File:** `src/pages/PropertyFinder.tsx` (Line 33)

```typescript
// Before
const [sortBy, setSortBy] = useState("newest");

// After
const [sortBy, setSortBy] = useState("price-asc");
```

### 3. Implement Client-Side Sorting Logic

Currently, the `sortBy` dropdown exists but doesn't actually sort the properties. We need to add sorting logic.

**File:** `src/pages/PropertyFinder.tsx`

Add a `useMemo` hook to sort properties based on the selected sort option:

```typescript
import { useMemo } from "react";

// Add after properties state
const sortedProperties = useMemo(() => {
  const sorted = [...properties];
  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "beds":
      return sorted.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
    case "newest":
    default:
      return sorted; // API returns in default order
  }
}, [properties, sortBy]);
```

Then use `sortedProperties` instead of `properties` in the render loop.

---

## Detailed Changes

### `src/pages/PropertyFinder.tsx`

| Line | Current | New |
|------|---------|-----|
| 33 | `useState("newest")` | `useState("price-asc")` |
| 56 | `priceMin: ... : 400000` | `priceMin: ... : undefined` |
| New | - | Add `sortedProperties` memo |
| 616 | `properties.map(...)` | `sortedProperties.map(...)` |

### `src/components/property/PropertyFilters.tsx`

| Line | Current | New |
|------|---------|-----|
| 70 | `\|\| "400000"` | `\|\| ""` |
| 97 | `\|\| "400000"` | `\|\| ""` |

### `supabase/functions/search-properties/index.ts`

| Line | Current | New |
|------|---------|-----|
| 145 | `filters.priceMin ? ... : '400000'` | Only include if `filters.priceMin` is truthy |

```typescript
// Before
proxyParams.minPrice = filters.priceMin ? String(filters.priceMin) : '400000';

// After
if (filters.priceMin) proxyParams.minPrice = String(filters.priceMin);
```

---

## Result

When users first visit `/:lang/properties`:

| Setting | Default |
|---------|---------|
| Property Status | New Developments Only |
| Minimum Price | None (shows all prices) |
| Maximum Price | €10,000,000 |
| Sort Order | Price: Low to High |
| Expected Results | ~421 new developments, cheapest first |

Users can still:
- Switch between New Developments / All Properties / Resales
- Add their own min/max price filters
- Change the sort order to Newest, Price High-Low, or Most Bedrooms
