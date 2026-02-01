
# Remove Project Names from Retargeting Property Cards

## Problem
The retargeting property cards currently display specific project names like "MORASOL", "SAVIA", "360", "BENJAMINS DERAM", "TERRA NOVA HILLS", and "ALURA LIVING". These names should be removed from all retargeting pages.

## Current State
Project names appear in **two files**:

| File | Location | Current Display |
|------|----------|-----------------|
| `RetargetingProjects.tsx` | Line 179-181 | `<h3>{property.internal_name}</h3>` |
| `RetargetingPropertyModal.tsx` | Line 215-217 | `<h3>{property.internal_name}</h3>` |

## Solution
Replace the project name with a **generic, localized title** based on the property type (apartment/villa). This follows the same pattern already used in `PropertyCard.tsx` for the main landing pages.

### Display Logic

| Property Category | English Display | Finnish Example | German Example |
|-------------------|-----------------|-----------------|----------------|
| `apartment` | "New Luxury Apartments" | "Uudet Luksushuoneistot" | "Neue Luxuswohnungen" |
| `villa` | "Exclusive Villas" | "Yksinomaiset Huvilat" | "Exklusive Villen" |

## Files to Modify

### 1. `src/lib/retargetingTranslations.ts`
Add two new translation keys for the generic property titles:

```typescript
cardTitleApartment: "New Luxury Apartments",
cardTitleVilla: "Exclusive Villas",
```

These keys need to be added to all 10 language translations within this file.

### 2. `src/components/retargeting/RetargetingProjects.tsx`
**Line 179-181** - Replace the project name heading with a generic localized title:

```typescript
// FROM:
<h3 className="text-lg font-medium text-landing-navy mb-2 line-clamp-1">
  {property.internal_name}
</h3>

// TO:
<h3 className="text-lg font-medium text-landing-navy mb-2 line-clamp-1">
  {property.category === 'apartment' ? t.cardTitleApartment : t.cardTitleVilla}
</h3>
```

### 3. `src/components/retargeting/RetargetingPropertyModal.tsx`
**Line 215-217** - Replace the project name in the modal property info box:

```typescript
// FROM:
<h3 className="font-semibold text-gray-900 text-base mb-1">
  {property.internal_name}
</h3>

// TO:
<h3 className="font-semibold text-gray-900 text-base mb-1">
  {property.category === 'apartment' ? t.cardTitleApartment : t.cardTitleVilla}
</h3>
```

**Note:** The modal component needs to:
1. Import the retargeting translations
2. Accept `category` in the property interface
3. Pass `category` when calling from RetargetingProjects

## Translation Values to Add

| Language | `cardTitleApartment` | `cardTitleVilla` |
|----------|----------------------|------------------|
| `en` | New Luxury Apartments | Exclusive Villas |
| `de` | Neue Luxuswohnungen | Exklusive Villen |
| `nl` | Nieuwe Luxe Appartementen | Exclusieve Villa's |
| `fr` | Nouveaux Appartements de Luxe | Villas Exclusives |
| `pl` | Nowe Luksusowe Apartamenty | Ekskluzywne Wille |
| `sv` | Nya Lyxlägenheter | Exklusiva Villor |
| `da` | Nye Luksuslejligheder | Eksklusive Villaer |
| `fi` | Uudet Luksushuoneistot | Yksinomaiset Huvilat |
| `hu` | Új Luxus Apartmanok | Exkluzív Villák |
| `no` | Nye Luksusleiligheter | Eksklusive Villaer |

## CRM Note
The `internal_name` is still passed to the CRM in line 134 for lead tracking purposes:
```typescript
interest: `${property.internal_name} - ${data.interest || "both"}`,
```
This will remain unchanged so the sales team knows which specific project the lead was interested in.

## Expected Result
After implementation:
- All retargeting property cards show generic titles like "New Luxury Apartments" or "Exclusive Villas"
- Titles are fully localized based on the page language
- Location, price, beds/baths, and descriptions remain unchanged
- CRM lead tracking still captures the specific project name internally
