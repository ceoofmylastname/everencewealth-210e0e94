
# Localize Lifestyle Feature Cards in City Brochures

## Problem Identified

The City Brochure pages (e.g., `/nl/brochure/marbella`) show mixed languages in the "Lifestyle" section:

| Element | Status | Example |
|---------|--------|---------|
| Section Label | ✅ Dutch | "DE LEVENSSTIJL" |
| Headline | ✅ Dutch | "Leef de Marbella Droom" |
| Description | ✅ Dutch | "Ervaar een levensstijl waar elke dag..." |
| Feature Cards | ❌ English | "World-Class Golf", "Over 70 championship courses..." |

The `DEFAULT_FEATURES` array in `LifestyleFeatures.tsx` (lines 33-40) is hardcoded in English.

---

## Solution

### Step 1: Add Lifestyle Feature Translations (All 10 Languages)

Add a new `lifestyleFeatures` object inside `brochures.ui` for each language file:

**Structure to add:**

```typescript
brochures: {
  ui: {
    // ...existing keys
    lifestyleFeatures: {
      golf: { title: "World-Class Golf", description: "Over 70 championship courses within 30 minutes" },
      beach: { title: "Mediterranean Beaches", description: "Crystal-clear waters and golden sand coastlines" },
      dining: { title: "Michelin Dining", description: "Award-winning restaurants and vibrant culinary scene" },
      marina: { title: "Luxury Marinas", description: "Premier yacht clubs and nautical lifestyle" },
      wellness: { title: "Wellness & Spa", description: "World-renowned wellness retreats and thermal spas" },
      shopping: { title: "Designer Shopping", description: "Boutiques, galleries, and luxury retail experiences" },
    }
  }
}
```

**Example translations:**

| Key | English | Dutch | German |
|-----|---------|-------|--------|
| golf.title | World-Class Golf | Wereldklasse Golf | Weltklasse-Golf |
| golf.description | Over 70 championship courses within 30 minutes | Meer dan 70 kampioenschapsbanen binnen 30 minuten | Über 70 Meisterschaftsplätze in 30 Minuten |
| beach.title | Mediterranean Beaches | Mediterrane Stranden | Mediterrane Strände |
| dining.title | Michelin Dining | Michelin Restaurants | Michelin-Restaurants |
| marina.title | Luxury Marinas | Luxe Jachthavens | Luxus-Jachthäfen |
| wellness.title | Wellness & Spa | Wellness & Spa | Wellness & Spa |
| shopping.title | Designer Shopping | Designer Shopping | Designer-Shopping |

---

### Step 2: Update LifestyleFeatures.tsx Component

Modify the component to use translations instead of hardcoded English:

**Current (lines 33-40):**
```typescript
const DEFAULT_FEATURES: LifestyleFeature[] = [
  { icon: 'golf', title: 'World-Class Golf', description: 'Over 70 championship courses within 30 minutes' },
  { icon: 'beach', title: 'Mediterranean Beaches', description: 'Crystal-clear waters and golden sand coastlines' },
  // ...more hardcoded English
];
```

**New:**
```typescript
const lifestyleFeatures = ui.lifestyleFeatures || {};

const DEFAULT_FEATURES: LifestyleFeature[] = [
  { 
    icon: 'golf', 
    title: lifestyleFeatures.golf?.title || 'World-Class Golf', 
    description: lifestyleFeatures.golf?.description || 'Over 70 championship courses within 30 minutes' 
  },
  { 
    icon: 'beach', 
    title: lifestyleFeatures.beach?.title || 'Mediterranean Beaches', 
    description: lifestyleFeatures.beach?.description || 'Crystal-clear waters and golden sand coastlines' 
  },
  // ...continue for all 6 features
];
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/i18n/translations/en.ts` | Add `lifestyleFeatures` object in `brochures.ui` |
| `src/i18n/translations/nl.ts` | Add Dutch translations |
| `src/i18n/translations/de.ts` | Add German translations |
| `src/i18n/translations/fr.ts` | Add French translations |
| `src/i18n/translations/fi.ts` | Add Finnish translations |
| `src/i18n/translations/pl.ts` | Add Polish translations |
| `src/i18n/translations/da.ts` | Add Danish translations |
| `src/i18n/translations/hu.ts` | Add Hungarian translations |
| `src/i18n/translations/sv.ts` | Add Swedish translations |
| `src/i18n/translations/no.ts` | Add Norwegian translations |
| `src/components/brochures/LifestyleFeatures.tsx` | Use translations with fallbacks |

---

## Result

After implementation:
- `/nl/brochure/marbella` will show:
  - "Wereldklasse Golf" instead of "World-Class Golf"
  - "Meer dan 70 kampioenschapsbanen binnen 30 minuten" instead of the English description
  - All 6 feature cards fully translated
- Full parity across all 10 supported languages
- Fallback to English if translations are missing (graceful degradation)
