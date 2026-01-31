
Goal  
Make “New Development” properties with price ranges behave correctly with a minPrice filter. Example: range 215,000–558,000 should still appear when user searches minPrice=500,000, because the range maximum is >= 500,000. Right now the frontend is excluding them because `property.priceMax` is often missing in search results.

What’s happening now (root cause)  
- The backend search response is returning properties like R5074729 with:
  - `price: 215000`
  - no `priceMax` field (so it becomes `undefined`)
- The frontend filter currently does:
  - `maxPrice = property.priceMax || property.price`
  - so maxPrice becomes 215,000
  - then it hides the property for minPrice=500,000 (incorrect, because the real max is 558,000)
- In the search response, the only reliable place to infer the range is often the description text (e.g., “Prices from €215,000 to €558,000”) or sometimes a “min-max” formatted string.

Solution approach (frontend-only, as requested)  
1) Infer a price range (min + max) on the frontend for every returned property, even if `priceMax` is missing.  
2) Use the inferred max for the minPrice check: show a property if inferredMax >= minPrice.  
3) When a property matches only because of its max (i.e., its displayed “from” is below the user’s min), adjust the displayed price in the card list to reflect the user’s range, so the UI no longer shows confusing “From €215k” in a €500k+ search.

Key behavior we’ll implement  
Given:
- Property range: [propertyMin, propertyMax]
- User filter: [filterMin, filterMax]

We’ll:
- Exclude if no overlap:
  - if filterMin is set and propertyMax < filterMin → exclude
  - if filterMax is set and propertyMin > filterMax → exclude
- Otherwise include, and compute a “display range intersection”:
  - displayMin = filterMin ? max(propertyMin, filterMin) : propertyMin
  - displayMax = filterMax ? min(propertyMax, filterMax) : propertyMax
- Store the list results using:
  - `price = displayMin`
  - `priceMax = displayMax` (only if displayMax > displayMin; otherwise leave undefined or equal)

This means:
- Search minPrice=500k, property 215k–558k will show and display as ~“From €500,000” (and internally still links to the correct detail page which fetches full details separately).

Implementation details  
A) Add robust number parsing helpers in `src/pages/PropertyFinder.tsx`  
- `parseMoney(value: unknown): number | undefined`
  - Handles: `215000`, `€215,000`, `215.000`, `215000.00`, etc.
- `extractPriceRangeFromText(description: string): { min?: number; max?: number }`
  - Regex patterns for:
    - “Prices from €215,000 to €558,000”
    - “€ 215,000 - € 558,000”
    - “215000 - 558000”
- `getPropertyPriceRange(property: Property): { min: number; max: number }`
  - Priority:
    1) `property.price` + `property.priceMax` (if present)
    2) parse `property.price` if it is a range string (defensive)
    3) parse from `property.description`
    4) fallback: max = min

B) Replace the current `filterPropertiesByDisplayedPrice` with a normalize+filter function  
- New function conceptually:
  - `normalizeAndFilterByPriceRange(properties, filters) => Property[]`
- For each property:
  - infer `{min,max}`
  - apply overlap logic vs filters
  - compute display intersection range
  - return property with adjusted `price`/`priceMax` for listing

C) Apply the new normalize+filter function in both:
- `searchProperties()` (initial search)
- `loadMoreProperties()` (pagination append)

D) (Small but important) Fix `hasMore` calculation to avoid stale state in `loadMoreProperties`  
Currently `setHasMore(properties.length + filteredNewProperties.length < total)` can use stale `properties`.  
We’ll compute next length from the functional `setProperties(prev => ...)` update so `hasMore` is accurate.

Files to change  
- `src/pages/PropertyFinder.tsx`
  - Add helpers + replace filtering logic with “infer range + overlap + display intersection”
  - Use the new logic in initial search and load-more flows

How we’ll test (end-to-end)  
1) Visit: `/en/properties?transactionType=sale&priceMin=500000`  
   - Confirm results appear (not empty).  
   - Confirm at least some New Development cards show prices at/above €500k (e.g., “From €500,000”), not “From €215,000”.  
2) Test with min+max: `/en/properties?transactionType=sale&priceMin=500000&priceMax=750000`  
   - Confirm overlapping developments appear and display within the filter window (e.g., “From €500,000”).  
3) Click into a property detail page  
   - Confirm the detail page still shows the full official range (e.g., “€215,000 - €558,000”) since it fetches details separately.  
4) Load More  
   - Confirm “Load More” still works and continues appending results correctly under the same filter.

Risks / edge cases handled  
- If we cannot infer a max price at all (no `priceMax`, no parsable description), then we’ll behave conservatively:
  - treat max = min; such a property will be excluded if min < filterMin
- Different description languages: we’ll keep regex flexible (“Prices from”, currency symbols, dash ranges). If localization causes misses, we can extend patterns after we see examples.

Acceptance criteria  
- A New Development with real range 215k–558k is shown for minPrice=500k searches.
- It is not hidden by frontend filtering.
- The displayed price in search results is aligned with the user’s filter (no more “From €215k” shown in €500k+ searches).
