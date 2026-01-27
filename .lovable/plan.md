
# Complete Property Detail Page Implementation

## Overview

This is a comprehensive update to make property detail pages match the Resales Online format exactly, fix the "Property Not Found" bug, implement proper multi-language support, add high-resolution images, and display all property data correctly.

## Root Cause Analysis

The edge function logs show:
```
📦 Raw response keys: [ "transaction", "QueryInfo", "Property" ]
📦 Property array?: undefined
```

The API returns `data.Property` as a **direct object**, but the code tries `data.Property?.[0]` expecting an array. This fails silently and returns `null`.

---

## Implementation Plan

### Phase 1: Fix the Critical Bug (Edge Function)

**File: `supabase/functions/get-property-details/index.ts`**

Fix the property extraction logic to handle both object and array responses:

```typescript
// Current (broken):
const rawProp = data.Property?.[0] || data.property?.[0] || data.property || (data.Reference ? data : null);

// Fixed:
const rawProp = Array.isArray(data.Property) 
  ? data.Property[0] 
  : data.Property || data.property || (data.Reference ? data : null);
```

Also add comprehensive logging to debug the actual response structure.

---

### Phase 2: Expand Property Type to Include All API Fields

**File: `src/types/property.ts`**

Add all the fields from the Resales Online API that we need to display:

| New Field | Type | Description |
|-----------|------|-------------|
| `developmentName` | `string` | "Etherna Homes II" |
| `newDevelopment` | `boolean` | Is new development |
| `status` | `string` | Property status |
| `interiorSize` | `number` | Interior floor space |
| `interiorSizeMax` | `number` | Interior floor space max |
| `terraceSize` | `number` | Terrace size |
| `terraceSizeMax` | `number` | Terrace size max |
| `totalSize` | `number` | Total combined size |
| `totalSizeMax` | `number` | Total combined size max |
| `completionDate` | `string` | Expected completion |
| `buildingLicense` | `string` | License status |
| `energyRating` | `string` | Energy certificate |
| `co2Rating` | `string` | CO2 emissions rating |
| `communityFees` | `number` | Monthly community fees |
| `ibi` | `number` | Annual IBI tax |
| `garbageTax` | `number` | Annual garbage tax |
| `reservationAmount` | `number` | Reservation deposit |
| `vatPercentage` | `number` | IVA/VAT percentage |
| `featureCategories` | `object` | Grouped features by category |

---

### Phase 3: Update Edge Function to Return Complete Data

**File: `supabase/functions/get-property-details/index.ts`**

Enhance `normalizeProperty()` to extract all available API data:

```typescript
function normalizeProperty(prop: any) {
  return {
    // ... existing fields ...
    
    // Development info
    developmentName: prop.DevelopmentName || prop.Development || '',
    newDevelopment: prop.NewDevelopment === 'Yes' || prop.OffPlan === 'Yes',
    
    // Size ranges (for New Developments)
    interiorSize: parseNumeric(prop.InteriorFloorSpace || prop.Interior || 0),
    interiorSizeMax: parseNumeric(prop.InteriorMax || 0),
    terraceSize: parseNumeric(prop.Terrace || prop.TerraceArea || 0),
    terraceSizeMax: parseNumeric(prop.TerraceMax || 0),
    totalSize: parseNumeric(prop.TotalBuiltArea || 0),
    totalSizeMax: parseNumeric(prop.TotalBuiltAreaMax || 0),
    
    // Construction details
    completionDate: prop.CompletionDate || prop.Completion || '',
    buildingLicense: prop.BuildingLicense || '',
    
    // Certificates
    energyRating: prop.EnergyRating || prop.EnergyCertificate || '',
    co2Rating: prop.CO2Rating || prop.CO2Emissions || '',
    
    // Costs
    communityFees: parseNumeric(prop.CommunityFees || 0),
    ibi: parseNumeric(prop.IBI || prop.IBIFees || 0),
    garbageTax: parseNumeric(prop.GarbageTax || 0),
    
    // Payment terms
    reservationAmount: parseNumeric(prop.ReservationAmount || 0),
    vatPercentage: parseNumeric(prop.VAT || prop.IVA || 10),
    
    // Grouped features (as returned by API)
    featureCategories: extractFeatureCategories(prop.PropertyFeatures),
  };
}
```

Add a new function to extract grouped features:

```typescript
function extractFeatureCategories(propertyFeatures: any): Record<string, string[]> {
  if (!propertyFeatures?.Category) return {};
  
  const categories: Record<string, string[]> = {};
  for (const cat of propertyFeatures.Category) {
    if (cat.Type && cat.Value && Array.isArray(cat.Value)) {
      categories[cat.Type] = cat.Value;
    }
  }
  return categories;
}
```

---

### Phase 4: Fix Image Transformer for High Resolution

**File: `src/lib/imageUrlTransformer.ts`**

Implement the resolution upgrade with proper error handling:

```typescript
export function getHighResImageUrl(
  url: string | undefined | null, 
  size: 'thumbnail' | 'card' | 'hero' | 'lightbox' = 'hero'
): string {
  if (!url) return '/placeholder.svg';
  
  // Only transform if URL contains /w400/ pattern
  if (!url.includes('/w400/')) {
    return url;
  }
  
  // Map size to resolution
  const resolutionMap: Record<typeof size, string> = {
    thumbnail: 'w400',   // Keep thumbnails small
    card: 'w800',        // Property cards
    hero: 'w1200',       // Hero images
    lightbox: 'w1200',   // Full-screen gallery
  };
  
  const targetResolution = resolutionMap[size];
  return url.replace('/w400/', `/${targetResolution}/`);
}
```

---

### Phase 5: Create New PropertyCosts Component

**File: `src/components/property/PropertyCosts.tsx`** (New)

Display payment terms and associated costs in a professional layout:

```text
┌─────────────────────────────────────────────────────────┐
│  💰 Payment Terms & Costs                              │
├─────────────────────────────────────────────────────────┤
│  Payment Terms              │  Associated Costs         │
│  • Reservation: €3,000      │  • Community Fees: €125/mo│
│  • IVA: 10%                 │  • IBI: €400/year         │
│                             │  • Garbage Tax: €60/year  │
├─────────────────────────────────────────────────────────┤
│  Construction Details       │  Energy Certificates      │
│  • Completion: Q4 2026      │  • Energy Rating: B       │
│  • License: Approved        │  • CO2 Rating: C          │
└─────────────────────────────────────────────────────────┘
```

---

### Phase 6: Update PropertyFeatures Component

**File: `src/components/property/PropertyFeatures.tsx`**

Display features grouped by category exactly as the API returns them:

```text
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 📍 Setting       │  │ 🏊 Pool          │  │ ❄️ Climate Control│
│ ✓ Close To Shops │  │ ✓ Communal       │  │ ✓ Hot A/C        │
│ ✓ Close To Sea   │  │                  │  │ ✓ Cold A/C       │
│ ✓ Close To Town  │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 👁️ Views         │  │ 🏠 Features      │  │ 🍳 Kitchen       │
│ ✓ Sea            │  │ ✓ Lift           │  │ ✓ Fully Fitted   │
│ ✓ Pool           │  │ ✓ Fitted Wardrobe│  │ ✓ Kitchen-Lounge │
│ ✓ Panoramic      │  │ ✓ Gym            │  │                  │
│ ✓ Garden         │  │ ✓ Storage Room   │  │                  │
│                  │  │ ✓ Private Terrace│  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

### Phase 7: Update PropertyStats for Exact Formatting

**File: `src/components/property/PropertyStats.tsx`**

Format ranges exactly as Resales Online displays them:
- Bedrooms: `1 - 3` (not "1-3 bedrooms")
- Bathrooms: `1 - 2`
- Built Size: `65 m² - 138 m²`
- Terrace: `16 m² - 73 m²`
- Total Size: `81 m² - 211 m²`

---

### Phase 8: Update PropertyHeader for Price Range Display

**File: `src/components/property/PropertyHeader.tsx`**

Display price as range for new developments:
```
€ 215,000 - € 558,000
```

Include development name prominently when available.

---

### Phase 9: Add Terrace and Total Size Stats

**File: `src/components/property/PropertyStats.tsx`**

Add additional stat items for:
- Interior Floor Space (with range for new devs)
- Terrace Size (with range)
- Total Size (with range)

---

### Phase 10: Update PropertyDetail Page Integration

**File: `src/pages/PropertyDetail.tsx`**

1. Pass new props to components
2. Add the new `PropertyCosts` component
3. Update price formatting for range display
4. Show development name in title for new developments

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/get-property-details/index.ts` | Modify | Fix property extraction bug, add complete data normalization |
| `src/types/property.ts` | Modify | Add new property fields |
| `src/lib/imageUrlTransformer.ts` | Modify | Implement resolution upgrade |
| `src/components/property/PropertyStats.tsx` | Modify | Add range formatting, new size stats |
| `src/components/property/PropertyFeatures.tsx` | Modify | Display grouped features by category |
| `src/components/property/PropertyHeader.tsx` | Modify | Support development name, price ranges |
| `src/components/property/PropertyCosts.tsx` | Create | New component for costs/payment terms |
| `src/pages/PropertyDetail.tsx` | Modify | Integrate new components and data |

---

## Technical Notes

### Language Mapping
The edge function already has the correct language mapping:
```typescript
const LANGUAGE_MAP = {
  en: 1, es: 2, de: 3, fr: 4, nl: 5, ru: 6, pl: 7, it: 8, pt: 9, sv: 10, no: 11, da: 12, fi: 13, hu: 14
};
```

The 10 supported languages map to: EN=1, NL=5, FR=4, DE=3, FI=13, PL=7, DA=12, HU=14, SV=10, NO=11

### Image Resolution Pattern
The CDN URL pattern is:
```
https://cdn.resales-online.com/public/{hash}/properties/{id}/w400/{filename}.jpg
```
Transform to `/w800/` for cards and `/w1200/` for hero/lightbox.

### Testing
After implementation, test with these properties:
- R5074729 (Etherna Homes II - New Development)
- R5166472 (Luminal Homes - New Development)
- R4922596 (Celestia Homes - New Development)
