
# Update Property Search to Show All Residential Properties

## Goal
Update the property search to show ALL residential properties at ANY price by:
1. Removing the default €500,000 minimum price filter
2. Defaulting to "Sales" instead of "New Developments" 
3. Always passing `propertyTypes=1-1,2-1` to filter apartments/houses at the API level
4. Expected result: ~7,067 properties when no price filter is applied

---

## Changes Overview

### 1. Edge Function: Remove Default Price Filter

**File**: `supabase/functions/search-properties/index.ts`

Remove the logic that automatically adds a €500,000 minimum price for New Developments:

```text
DELETE lines 165-170:
// Set default minimum price for New Developments
const effectiveFilters = { ...filters };
if (filters.newDevs === 'only' && !filters.priceMin) {
  effectiveFilters.priceMin = 500000;
  console.log('💰 Applied default minPrice: €500,000 for New Developments');
}
```

Replace with:
```javascript
const effectiveFilters = { ...filters };
```

---

### 2. Edge Function: Add Default Property Types

Pass `propertyTypes=1-1,2-1` by default to filter apartments and houses at the API level (more efficient than post-filtering):

In `callProxySearch()`, add default propertyTypes if not specified:

```javascript
// Default to apartments (1-1) and houses (2-1) for residential filtering
if (!filters.propertyType) {
  proxyParams.propertyTypes = '1-1,2-1';
}
```

---

### 3. Frontend: Change Default Status to "Sales"

**File**: `src/pages/PropertyFinder.tsx`

Change the default behavior on initial load from "New Developments" to "Sales":

```text
BEFORE (lines 113-120):
useEffect(() => {
  const params = getInitialParams();
  if (!params.newDevs) {
    params.newDevs = "only";
  }
  searchProperties(params);
}, []);

AFTER:
useEffect(() => {
  const params = getInitialParams();
  // No longer defaulting to New Developments - show all sales
  searchProperties(params);
}, []);
```

---

### 4. PropertyFilters Component: Default to Sales

**File**: `src/components/property/PropertyFilters.tsx`

Update default status from "new-developments" to "sales":

| Line | Before | After |
|------|--------|-------|
| 73-74 | `initialParams.newDevs === "only" \|\| initialParams.newDevs === undefined ? "new-developments" : "sales"` | `initialParams.newDevs === "only" ? "new-developments" : "sales"` |
| 92 | Same logic | Same fix |
| 122 | `setStatus("new-developments")` | `setStatus("sales")` |
| 123 | `onSearch({ transactionType: "sale", newDevs: "only" })` | `onSearch({ transactionType: "sale" })` |

---

### 5. QuickSearch Component: Default to Sales

**File**: `src/components/home/sections/QuickSearch.tsx`

Change line 50:
```text
BEFORE: const [status, setStatus] = useState("new-developments");
AFTER:  const [status, setStatus] = useState("sales");
```

Change `handleReset()` (line 67):
```text
BEFORE: setStatus("new-developments");
AFTER:  setStatus("sales");
```

---

## Technical Summary

| Component | Change |
|-----------|--------|
| **Edge Function** | Remove €500,000 default price; add `propertyTypes=1-1,2-1` default |
| **PropertyFinder.tsx** | Remove `newDevs = "only"` default on mount |
| **PropertyFilters.tsx** | Default status to "sales", update reset behavior |
| **QuickSearch.tsx** | Default status to "sales", update reset behavior |

---

## Expected Behavior After Changes

1. **Default search** shows all apartments and houses (no price filter)
2. **API request** includes `propertyTypes=1-1,2-1` by default
3. **No P_Min/minPrice** sent unless user selects a minimum price
4. **Expected count**: ~7,067 properties
5. **User can still select** "New Developments" filter if desired
6. **Residential filtering** now happens at API level (more efficient)
