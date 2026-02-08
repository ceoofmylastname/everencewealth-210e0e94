
# Default Property Search: New Developments + €250,000 Minimum + Price Low-High

## Summary

Update the property search defaults to show **New Developments Only** with a **€250,000 minimum price** sorted by **price ascending** on page load. This filters out all resale properties and lower-priced homes by default.

---

## Changes Required

### 1. Set Default priceMin to €250,000

**Frontend - PropertyFinder.tsx** (Line 56)

```typescript
// Current
priceMin: searchParams.get("priceMin") ? parseInt(searchParams.get("priceMin")!) : undefined,

// Change to
priceMin: searchParams.get("priceMin") ? parseInt(searchParams.get("priceMin")!) : 250000,
```

**Frontend - PropertyFilters.tsx** (Lines 70, 97)

```typescript
// Current (Line 70)
const [priceMin, setPriceMin] = useState(initialParams.priceMin?.toString() || "");

// Change to
const [priceMin, setPriceMin] = useState(initialParams.priceMin?.toString() || "250000");

// Current (Line 97)
setPriceMin(initialParams.priceMin?.toString() || "");

// Change to
setPriceMin(initialParams.priceMin?.toString() || "250000");
```

**Backend - search-properties Edge Function** (Line 145)

```typescript
// Current
if (filters.priceMin) proxyParams.minPrice = String(filters.priceMin);

// Change to
proxyParams.minPrice = filters.priceMin ? String(filters.priceMin) : '250000';
```

### 2. Verify Existing Defaults (Already Correct)

These settings are already in place from the previous update:

- **Sort by price-asc**: Line 33 in PropertyFinder.tsx has `useState("price-asc")` ✅
- **New Developments Only**: Lines 42-49 default to `newDevs: "only"` ✅
- **Client-side sorting**: The `sortedProperties` useMemo is already implemented ✅

---

## Summary of Changes

| File | Line(s) | Current | New |
|------|---------|---------|-----|
| `PropertyFinder.tsx` | 56 | `undefined` fallback | `250000` fallback |
| `PropertyFilters.tsx` | 70 | `""` fallback | `"250000"` fallback |
| `PropertyFilters.tsx` | 97 | `""` fallback | `"250000"` fallback |
| `search-properties/index.ts` | 145 | Only pass if set | Default to `'250000'` |

---

## Default Page Load State

| Setting | Value |
|---------|-------|
| Property Type Filter | New Developments Only |
| Minimum Price | €250,000 |
| Maximum Price | €10,000,000 |
| Sort Order | Price: Low to High |
| Expected Results | ~421 new development properties |

---

## User Controls Preserved

Users can still manually:
- Switch to "All Properties" or "Resales Only" using the status dropdown
- Change minimum price to lower/higher amounts
- Adjust maximum price, bedrooms, bathrooms, location, etc.
- Change sort order (Newest, Price High-Low, Most Bedrooms)

The search button count will update to reflect these default filters applied.
