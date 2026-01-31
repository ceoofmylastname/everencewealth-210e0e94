
# Full Localization of Home Page Property Search Tool

## Problem Identified

The QuickSearch property finder tool on the home page (`src/components/home/sections/QuickSearch.tsx`) displays **100% English content** regardless of the selected language:

| Element | Current (Hardcoded English) | Should Be (German Example) |
|---------|----------------------------|---------------------------|
| Reference label | "Reference" | "Referenz" |
| Location label | "Location" | "Standort" |
| Property Type label | "Property Type" | "Immobilientyp" |
| Bedrooms label | "Bedrooms" | "Schlafzimmer" |
| Min. Price label | "Min. Price" | "Min. Preis" |
| Max. Price label | "Max. Price" | "Max. Preis" |
| Status label | "Status" | "Status" |
| Reference placeholder | "e.g. R5014453" | "z.B. R5014453" |
| Any Location | "Any Location" | "Beliebiger Standort" |
| Any Type | "Any Type" | "Beliebiger Typ" |
| Any | "Any" | "Beliebig" |
| Loading... | "Loading..." | "Wird geladen..." |
| New Developments | "New Developments" | "Neubauprojekte" |
| Resales | "Resales" | "Wiederverkäufe" |
| All Properties | "All Properties" | "Alle Immobilien" |
| Search Properties | "Search Properties" | "Immobilien Suchen" |
| Clear All | "Clear All" | "Alles Löschen" |

---

## Solution: Expand quickSearch i18n Object

### New Translation Structure

Add a `propertySearch` subsection to the existing `quickSearch` object in all 10 translation files:

```text
quickSearch: {
  // ... existing keys (headline, description, labels, etc.)
  
  propertySearch: {
    labels: {
      reference: "Reference",
      location: "Location",
      propertyType: "Property Type",
      bedrooms: "Bedrooms",
      minPrice: "Min. Price",
      maxPrice: "Max. Price",
      status: "Status",
    },
    placeholders: {
      reference: "e.g. R5014453",
      anyLocation: "Any Location",
      anyType: "Any Type",
      any: "Any",
      loading: "Loading...",
    },
    status: {
      newDevelopments: "New Developments",
      resales: "Resales",
      allProperties: "All Properties",
    },
    buttons: {
      search: "Search Properties",
      clearAll: "Clear All",
    },
  },
}
```

---

## Files to Modify

### Part 1: Translation Files (Add `propertySearch` to `quickSearch`)

| File | Language |
|------|----------|
| `src/i18n/translations/en.ts` | English |
| `src/i18n/translations/de.ts` | German |
| `src/i18n/translations/fi.ts` | Finnish |
| `src/i18n/translations/nl.ts` | Dutch |
| `src/i18n/translations/fr.ts` | French |
| `src/i18n/translations/pl.ts` | Polish |
| `src/i18n/translations/da.ts` | Danish |
| `src/i18n/translations/hu.ts` | Hungarian |
| `src/i18n/translations/sv.ts` | Swedish |
| `src/i18n/translations/no.ts` | Norwegian |

### Part 2: Component Update

| File | Changes |
|------|---------|
| `src/components/home/sections/QuickSearch.tsx` | Import `useTranslation`, replace all hardcoded strings with i18n keys |

---

## Sample Translations

### English (en.ts)
```text
propertySearch: {
  labels: {
    reference: "Reference",
    location: "Location",
    propertyType: "Property Type",
    bedrooms: "Bedrooms",
    minPrice: "Min. Price",
    maxPrice: "Max. Price",
    status: "Status",
  },
  placeholders: {
    reference: "e.g. R5014453",
    anyLocation: "Any Location",
    anyType: "Any Type",
    any: "Any",
    loading: "Loading...",
  },
  status: {
    newDevelopments: "New Developments",
    resales: "Resales",
    allProperties: "All Properties",
  },
  buttons: {
    search: "Search Properties",
    clearAll: "Clear All",
  },
}
```

### German (de.ts)
```text
propertySearch: {
  labels: {
    reference: "Referenz",
    location: "Standort",
    propertyType: "Immobilientyp",
    bedrooms: "Schlafzimmer",
    minPrice: "Min. Preis",
    maxPrice: "Max. Preis",
    status: "Status",
  },
  placeholders: {
    reference: "z.B. R5014453",
    anyLocation: "Beliebiger Standort",
    anyType: "Beliebiger Typ",
    any: "Beliebig",
    loading: "Wird geladen...",
  },
  status: {
    newDevelopments: "Neubauprojekte",
    resales: "Wiederverkäufe",
    allProperties: "Alle Immobilien",
  },
  buttons: {
    search: "Immobilien Suchen",
    clearAll: "Alles Löschen",
  },
}
```

### Finnish (fi.ts)
```text
propertySearch: {
  labels: {
    reference: "Viite",
    location: "Sijainti",
    propertyType: "Kiinteistötyyppi",
    bedrooms: "Makuuhuoneet",
    minPrice: "Min. Hinta",
    maxPrice: "Max. Hinta",
    status: "Tila",
  },
  placeholders: {
    reference: "esim. R5014453",
    anyLocation: "Mikä tahansa sijainti",
    anyType: "Mikä tahansa tyyppi",
    any: "Mikä tahansa",
    loading: "Ladataan...",
  },
  status: {
    newDevelopments: "Uudiskohteet",
    resales: "Jälleenmyynti",
    allProperties: "Kaikki kiinteistöt",
  },
  buttons: {
    search: "Hae Kiinteistöjä",
    clearAll: "Tyhjennä Kaikki",
  },
}
```

---

## Component Changes

### QuickSearch.tsx Updates

**Import translation hook:**
```tsx
import { useTranslation } from '@/i18n';
```

**Get translations:**
```tsx
const { t, currentLanguage } = useTranslation();
const ps = t.quickSearch.propertySearch;
```

**Replace hardcoded strings:**
```tsx
// Labels
<label>{ps.labels.reference}</label>
<label>{ps.labels.location}</label>
<label>{ps.labels.propertyType}</label>

// Placeholders
<Input placeholder={ps.placeholders.reference} ... />
<SelectValue placeholder={ps.placeholders.anyLocation} />

// Status options - convert from static array to dynamic
const statusOptions = [
  { label: ps.status.newDevelopments, value: "new-developments" },
  { label: ps.status.resales, value: "resales" },
  { label: ps.status.allProperties, value: "all" },
];

// Buttons
<Button>{ps.buttons.search}</Button>
<Button>{ps.buttons.clearAll}</Button>
```

**Fix navigation to use current language:**
```tsx
// Current (hardcoded /en/)
navigate(`/en/properties?${params.toString()}`);

// Fixed (uses current language)
navigate(`/${currentLanguage}/properties?${params.toString()}`);
```

---

## Expected Result

After implementation:
- Property search tool on `/de/` will show 100% German labels and text
- Property search tool on `/fi/` will show 100% Finnish labels and text
- All 10 language versions will display fully localized search tools
- Navigation will correctly go to the language-specific property finder page
- No English "bleeding" on non-English home pages
