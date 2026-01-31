

# Fix New Developments Filter - Correct API Parameter

## Problem Root Cause

The proxy server is ignoring the `newDevelopment=true` parameter because:

1. **Official Resales Online API parameter**: `p_new_devs` with values `'exclude'`, `'include'`, or `'only'`
2. **Current edge function sends**: `newDevelopment=true` (wrong parameter name and wrong value format)
3. **Result**: Proxy/API ignores it and returns all properties

## Solution

Update the edge function to send the correct parameter name and value format that matches the official Resales Online WebAPI V6 specification.

## Technical Changes

### File: `supabase/functions/search-properties/index.ts`

**Current Code (line 126):**
```typescript
if (filters.newDevs === 'only') proxyParams.newDevelopment = 'true';
```

**Updated Code:**
```typescript
// Handle new development filter per Resales Online API V6 spec
// p_new_devs values: 'exclude' (resales only), 'include' (all), 'only' (new devs only)
if (filters.newDevs === 'only') {
  proxyParams.p_new_devs = 'only';
} else if (filters.newDevs === 'resales') {
  proxyParams.p_new_devs = 'exclude';
}
// else: default 'include' - don't send parameter (API default is include)
```

## API Parameter Reference (from official docs)

| Parameter | Values | Meaning |
|-----------|--------|---------|
| `p_new_devs` | `'only'` | Return only New Development properties |
| `p_new_devs` | `'exclude'` | Return only Resale properties |
| `p_new_devs` | `'include'` | Return both (default) |

## Expected Request URLs After Fix

| Filter Selection | Request URL |
|-----------------|-------------|
| New Developments | `...&p_new_devs=only` |
| Resales | `...&p_new_devs=exclude` |
| All Properties | (no p_new_devs parameter) |

## Testing Plan

1. **Default page load** (`/en/properties?transactionType=sale&newDevs=only`):
   - Verify request includes `p_new_devs=only`
   - Verify only New Development properties appear (should show price ranges, development names)

2. **Switch to Resales**:
   - Verify request includes `p_new_devs=exclude`
   - Verify only resale properties appear (individual listings, no price ranges)

3. **Switch to All Properties**:
   - Verify request has no `p_new_devs` parameter
   - Verify mixed results appear

## Assumption

This fix assumes the proxy server at `http://188.34.164.137:3000` will pass through the `p_new_devs` parameter to the Resales Online API. If the proxy requires different parameter mapping, the proxy server code would need to be updated instead.

