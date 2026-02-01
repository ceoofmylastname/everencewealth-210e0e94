
# Translate Navbar with Language Selector

## Overview
Currently the header/navbar displays all menu items in English regardless of the selected language. When a user switches to German (or any other language), only page content translates - the navigation remains in English.

## Current State
The `Header.tsx` component contains 20+ hardcoded English strings:

| Category | Hardcoded Strings |
|----------|-------------------|
| Menu Titles | "Explore", "Learn", "Compare", "About" |
| Explore Items | "Property Finder", "City Brochures", "Location Guides" |
| Learn Items | "Blog & Insights", "Q&A Center", "Property Glossary", "Buyer's Guide" |
| Compare Items | "Comparison Index", "City vs City" |
| About Items | "About Us", "Our Team", "Contact" |
| City Descriptions | "Luxury living on the Golden Mile", "Charming old town & beaches", etc. |
| Mobile Labels | "Language" |

## Solution

### 1. Expand Translation Files
Add a new `header` translation object to all 10 language files in `src/i18n/translations/`:

```text
en.ts, de.ts, nl.ts, fr.ts, pl.ts, sv.ts, da.ts, fi.ts, hu.ts, no.ts
```

New structure:
```typescript
header: {
  menus: {
    explore: "Explore",
    learn: "Learn",
    compare: "Compare",
    about: "About",
  },
  items: {
    propertyFinder: "Property Finder",
    cityBrochures: "City Brochures",
    locationGuides: "Location Guides",
    blogInsights: "Blog & Insights",
    qaCenter: "Q&A Center",
    propertyGlossary: "Property Glossary",
    buyersGuide: "Buyer's Guide",
    comparisonIndex: "Comparison Index",
    cityVsCity: "City vs City",
    aboutUs: "About Us",
    ourTeam: "Our Team",
    contact: "Contact",
  },
  cities: {
    marbella: "Luxury living on the Golden Mile",
    estepona: "Charming old town & beaches",
    malaga: "Culture, cuisine & coastline",
    sotogrande: "Exclusive marina lifestyle",
  },
  language: "Language",
}
```

### 2. Update Header Component
Modify `src/components/home/Header.tsx` to use translated strings:

**Before:**
```tsx
<MenuItem setActive={setActive} active={active} item="Explore">
```

**After:**
```tsx
<MenuItem setActive={setActive} active={active} item={t.header.menus.explore}>
```

Apply this pattern to:
- All 4 menu titles (desktop and mobile)
- All 12 menu item links
- All 4 city descriptions in the featured dropdown
- The mobile "Language" label

### 3. Translation Values by Language

| Key | EN | DE | NL | FR |
|-----|-----|-----|-----|-----|
| **menus.explore** | Explore | Erkunden | Verkennen | Explorer |
| **menus.learn** | Learn | Lernen | Leren | Apprendre |
| **menus.compare** | Compare | Vergleichen | Vergelijken | Comparer |
| **menus.about** | About | Über Uns | Over Ons | À Propos |
| **items.propertyFinder** | Property Finder | Immobiliensuche | Woningzoeker | Recherche Immobilière |
| **items.cityBrochures** | City Brochures | Stadtbroschüren | Stadsbrochures | Brochures de Ville |
| **items.locationGuides** | Location Guides | Standortführer | Locatiegidsen | Guides de Localisation |
| **items.blogInsights** | Blog & Insights | Blog & Einblicke | Blog & Inzichten | Blog & Conseils |
| **items.qaCenter** | Q&A Center | Q&A Zentrum | Q&A Centrum | Centre Q&R |
| **items.propertyGlossary** | Property Glossary | Immobilienglossar | Vastgoedwoordenlijst | Glossaire Immobilier |
| **items.buyersGuide** | Buyer's Guide | Käuferleitfaden | Koopgids | Guide Acheteur |
| **items.comparisonIndex** | Comparison Index | Vergleichsindex | Vergelijkingsindex | Index Comparatif |
| **items.cityVsCity** | City vs City | Stadt vs Stadt | Stad vs Stad | Ville vs Ville |
| **items.aboutUs** | About Us | Über Uns | Over Ons | À Propos |
| **items.ourTeam** | Our Team | Unser Team | Ons Team | Notre Équipe |
| **items.contact** | Contact | Kontakt | Contact | Contact |
| **language** | Language | Sprache | Taal | Langue |

The same pattern applies to all 10 languages (EN, DE, NL, FR, PL, SV, DA, FI, HU, NO).

## Files to Modify

| File | Changes |
|------|---------|
| `src/i18n/translations/en.ts` | Add `header` object |
| `src/i18n/translations/de.ts` | Add German `header` translations |
| `src/i18n/translations/nl.ts` | Add Dutch `header` translations |
| `src/i18n/translations/fr.ts` | Add French `header` translations |
| `src/i18n/translations/pl.ts` | Add Polish `header` translations |
| `src/i18n/translations/sv.ts` | Add Swedish `header` translations |
| `src/i18n/translations/da.ts` | Add Danish `header` translations |
| `src/i18n/translations/fi.ts` | Add Finnish `header` translations |
| `src/i18n/translations/hu.ts` | Add Hungarian `header` translations |
| `src/i18n/translations/no.ts` | Add Norwegian `header` translations |
| `src/components/home/Header.tsx` | Replace 20+ hardcoded strings with `t.header.*` |

## Expected Result
After implementation:
- Selecting German shows: "Erkunden", "Lernen", "Vergleichen", "Über Uns"
- All dropdown items translate to the selected language
- City descriptions in the Explore dropdown are localized
- Mobile menu sections and "Sprache" label translate
- No English "bleeding" in the navigation on any translated page
