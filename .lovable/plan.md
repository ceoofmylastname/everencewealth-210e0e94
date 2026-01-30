

# Localize LocationIndex Page - Full Translation Implementation

## Problem Identified

The Location Index pages (e.g., `/de/locations/benalmádena`) display English text in the hero section even when the page language is German. The screenshot shows:
- **English (should be German):** "Property & Lifestyle Guides", "Everything you need to know about living, investing, and buying property in..."
- **Correctly German:** The guide cards below show German content

## Hardcoded English Strings Found

In `src/pages/LocationIndex.tsx`:

| Line | Current English Text | Purpose |
|------|---------------------|---------|
| 70 | `"Loading guides..."` | Loading state |
| 132 | `"Home"` | Breadcrumb |
| 136 | `"Locations"` | Breadcrumb |
| 149 | `"Expert Guide"` / `"Guides"` | Badge text |
| 159 | `"Property & Lifestyle Guides"` | Hero subtitle |
| 167 | `"Everything you need to know about..."` | Hero description |
| 25-35 | Intent labels object | Card category badges |
| 216 | `"5 min read"` | Read time |
| 220 | `"Read Guide"` | Card CTA |

## Solution Overview

### Step 1: Add Missing Translation Keys (All 10 Languages)

Add new keys to the `locationGuides` object in each translation file:

**New keys to add:**

```typescript
locationGuides: {
  // Existing keys...
  
  // NEW KEYS:
  loadingGuides: "Loading guides...",
  home: "Home",
  locations: "Locations",
  expertGuide: "Expert Guide",
  expertGuides: "Expert Guides",
  propertyLifestyleGuides: "Property & Lifestyle Guides",
  heroDescription: "Everything you need to know about living, investing, and buying property in {city}, Costa del Sol.",
  minRead: "min read",
  readGuide: "Read Guide",
  
  // Intent type labels
  intentLabels: {
    buyingProperty: "Buying Guide",
    bestAreasFamilies: "Best Areas for Families",
    bestAreasInvestors: "Investment Areas",
    bestAreasExpats: "Expat Guide",
    bestAreasRetirees: "Retirement Guide",
    costOfLiving: "Cost of Living",
    costOfProperty: "Property Prices",
    investmentGuide: "Investment Guide",
    relocationGuide: "Relocation Guide",
  }
}
```

### Step 2: Update LocationIndex.tsx

1. Import `useTranslation` hook
2. Replace all hardcoded strings with translation keys
3. Use dynamic string replacement for `{city}` placeholders

### Files to Modify

| File | Changes |
|------|---------|
| `src/i18n/translations/en.ts` | Add new locationGuides keys |
| `src/i18n/translations/de.ts` | Add German translations |
| `src/i18n/translations/nl.ts` | Add Dutch translations |
| `src/i18n/translations/fr.ts` | Add French translations |
| `src/i18n/translations/fi.ts` | Add Finnish translations |
| `src/i18n/translations/pl.ts` | Add Polish translations |
| `src/i18n/translations/da.ts` | Add Danish translations |
| `src/i18n/translations/hu.ts` | Add Hungarian translations |
| `src/i18n/translations/sv.ts` | Add Swedish translations |
| `src/i18n/translations/no.ts` | Add Norwegian translations |
| `src/pages/LocationIndex.tsx` | Use translations instead of hardcoded strings |

---

## Technical Details

### Translation Additions for Each Language

**German (de.ts) example:**
```typescript
locationGuides: {
  // ...existing keys
  loadingGuides: "Guides werden geladen...",
  home: "Startseite",
  locations: "Standorte",
  expertGuide: "Experten-Leitfaden",
  expertGuides: "Experten-Leitfäden",
  propertyLifestyleGuides: "Immobilien- & Lifestyle-Guides",
  heroDescription: "Alles, was Sie über Leben, Investieren und Immobilienkauf in {city}, Costa del Sol, wissen müssen.",
  minRead: "Min. Lesezeit",
  readGuide: "Leitfaden Lesen",
  intentLabels: {
    buyingProperty: "Kaufleitfaden",
    bestAreasFamilies: "Beste Gebiete für Familien",
    bestAreasInvestors: "Investitionsgebiete",
    bestAreasExpats: "Expat-Leitfaden",
    bestAreasRetirees: "Ruhestandsleitfaden",
    costOfLiving: "Lebenshaltungskosten",
    costOfProperty: "Immobilienpreise",
    investmentGuide: "Investitionsleitfaden",
    relocationGuide: "Umzugsleitfaden",
  }
}
```

### LocationIndex.tsx Code Changes

```typescript
// Add import
import { useTranslation } from "@/i18n/useTranslation";

// Inside component
const { t } = useTranslation();

// Replace hardcoded intentLabels (lines 25-35)
// Use: t.locationGuides.intentLabels

// Loading state (line 70)
// Change: "Loading guides..." 
// To: {t.locationGuides.loadingGuides}

// Breadcrumbs (lines 132, 136)
// Change: "Home" → {t.locationGuides.home}
// Change: "Locations" → {t.locationGuides.locations}

// Badge (line 149)
// Change: {pages.length === 1 ? 'Guide' : 'Guides'}
// To: {pages.length === 1 ? t.locationGuides.expertGuide : t.locationGuides.expertGuides}

// Hero subtitle (line 159)
// Change: "Property & Lifestyle Guides"
// To: {t.locationGuides.propertyLifestyleGuides}

// Hero description (line 167)
// Change: "Everything you need to know about..."
// To: {t.locationGuides.heroDescription.replace('{city}', cityName)}

// Card labels (line 196)
// Use: t.locationGuides.intentLabels[intentKey] with proper mapping

// Read time (line 216)
// Change: "5 min read"
// To: `5 ${t.locationGuides.minRead}`

// Read Guide CTA (line 220)
// Change: "Read Guide"
// To: {t.locationGuides.readGuide}
```

---

## Result

After implementation:
- The Location Index page at `/de/locations/benalmádena` will display:
  - **German breadcrumbs:** "Startseite > Standorte > Benalmádena"
  - **German hero:** "Benalmádena - Immobilien- & Lifestyle-Guides"
  - **German description:** "Alles, was Sie über Leben, Investieren und Immobilienkauf..."
  - **German badges:** "Kaufleitfaden", "Lebenshaltungskosten", etc.
- Full parity across all 10 supported languages

