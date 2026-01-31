
# Fix Price Filtering for New Development Properties

## Problem Identified

The Resales Online API uses **overlapping range matching** for New Development properties. When filtering for €500,000 - €750,000:

- **API returns** properties where **any unit** falls in that range
- **Display shows** the **minimum** starting price (e.g., €215,000)
- **Result**: Properties appear with prices below the user's selected minimum

### Example:
Property R5074729:
- Range: €215,000 - €558,000
- Matches filter because €558,000 ≤ €750,000
- But displays as "From €215,000" which confuses users

---

## Solution: Add Frontend Price Validation

Apply strict price filtering on the frontend to only show properties where the **displayed price** meets the user's criteria.

### Logic:
```text
For each property:
  displayedPrice = property.price (the minimum/starting price)
  
  If user set priceMin:
    - For new developments: check if priceMax >= priceMin (any unit available in range)
    - For resales: check if price >= priceMin
  
  If user set priceMax:
    - Check if displayedPrice <= priceMax (starting price within budget)
```

---

## Changes Required

### 1. Update `PropertyFinder.tsx` - Add Price Filter After API Response

**File**: `src/pages/PropertyFinder.tsx`

Add a filter function after receiving properties from the API:

```typescript
// After receiving properties from API
const filterPropertiesByDisplayedPrice = (
  properties: Property[], 
  filters: { priceMin?: number; priceMax?: number }
) => {
  return properties.filter(property => {
    const minPrice = property.price; // Starting/displayed price
    const maxPrice = property.priceMax || property.price; // Highest price in range
    
    // If user set a minimum price filter
    if (filters.priceMin) {
      // For developments with price ranges: at least one unit must be >= priceMin
      // This means the maxPrice must be >= priceMin
      if (maxPrice < filters.priceMin) {
        return false;
      }
    }
    
    // If user set a maximum price filter
    if (filters.priceMax) {
      // The starting price must be <= priceMax (user can afford at least the entry unit)
      if (minPrice > filters.priceMax) {
        return false;
      }
    }
    
    return true;
  });
};
```

**Apply the filter in searchProperties function** (around line 125-150):

```typescript
// After: const properties = data.properties || [];
// Add:
const filteredProperties = filterPropertiesByDisplayedPrice(properties, {
  priceMin: params.priceMin,
  priceMax: params.priceMax,
});

// Use filteredProperties instead of properties
setProperties(filteredProperties);
setTotal(data.total); // Keep original total for transparency
```

---

### 2. Update Edge Function to Pass Through priceMax Properly

**File**: `supabase/functions/search-properties/index.ts`

Ensure `priceMax` is extracted from API response (already done in `normalizeProperty`):

```typescript
priceMax: raw.PriceMax ? parseInt(raw.PriceMax) : undefined,
```

This is already implemented correctly.

---

### 3. Update Property Card to Show Relevant Price Info

**File**: `src/components/property/PropertyCard.tsx`

Enhance `formatPrice` to show price ranges more clearly:

```typescript
const formatPrice = (price: number, priceMax: number | undefined, currency: string) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 0,
  });
  
  // If there's a price range (new development)
  if (priceMax && priceMax > price) {
    return `From ${formatter.format(price)}`;
  }
  
  // Single price (resale)
  return formatter.format(price);
};
```

This is already implemented - no changes needed.

---

## Summary of Changes

| File | Change |
|------|--------|
| `PropertyFinder.tsx` | Add `filterPropertiesByDisplayedPrice()` function to filter properties client-side based on displayed price |
| `search-properties/index.ts` | No changes needed - already passes `priceMax` |
| `PropertyCard.tsx` | No changes needed - already displays "From €X" for ranges |

---

## Expected Behavior After Changes

| Scenario | Before | After |
|----------|--------|-------|
| Filter €500k-€750k | Shows €215k properties | Only shows properties where starting price ≤ €750k AND ending price ≥ €500k |
| Property R5074729 | ❌ Shows (confusing) | ❌ Hidden (starting price €215k < €500k filter, but max €558k would need display) |
| Property with €480k-€700k | Shows "From €480k" | Shows "From €480k" (max €700k ≥ €500k) |

---

## Alternative Approach (For Consideration)

Instead of hiding properties, we could **show the relevant price range** within the user's filter:

- Property with €215k - €558k, filter €500k - €750k
- Display: "€500,000 - €558,000 available" (intersection of ranges)

This would require more complex UI changes but provides better transparency. Let me know if you'd prefer this approach.
