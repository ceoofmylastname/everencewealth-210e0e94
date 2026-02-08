

# Fix: Localize Glossary Term Cards on Homepage

## Problem Identified

The Polish homepage (`/pl/`) displays **English text** on the glossary term cards. The section headers are correctly translated, but the **term descriptions inside the cards are hardcoded in English**.

| Element | Current State | 
|---------|---------------|
| Section eyebrow | ✅ Translated ("Podstawowe Terminy") |
| Section headline | ✅ Translated ("Zrozum Hiszpańską Terminologię...") |
| Section description | ✅ Translated |
| CTA button | ✅ Translated ("Przeglądaj Pełny Słownik") |
| **Term card titles** | ⚠️ Keep as-is (Spanish legal terms: NIE, IBI, etc.) |
| **Term card descriptions** | ❌ **HARDCODED ENGLISH** |
| "Learn more" link text | ❌ **HARDCODED ENGLISH** |

## Root Cause

In `src/components/home/sections/ReviewsAndBlog.tsx` (lines 144-149), the `FEATURED_TERMS` array has hardcoded English descriptions:

```typescript
const FEATURED_TERMS = [
  { term: "NIE", icon: Scale, description: "Tax identification number required..." },
  { term: "Digital Nomad Visa", icon: Laptop, description: "Spanish visa for remote workers..." },
  // ... all in English
];
```

## Solution

### 1. Add Term Descriptions to All 10 Language Translation Files

Add a `terms` object inside `glossaryTeaser` with localized descriptions for each term:

```typescript
// Example for pl.ts
glossaryTeaser: {
  eyebrow: "Podstawowe Terminy",
  headline: "Zrozum Hiszpańską Terminologię Nieruchomości",
  // ... existing fields
  learnMore: "Dowiedz się więcej",  // NEW
  terms: {  // NEW
    nie: "Numer identyfikacji podatkowej wymagany do wszystkich transakcji nieruchomościowych w Hiszpanii.",
    digitalNomadVisa: "Hiszpańska wiza dla pracowników zdalnych zarabiających ponad €2,520/miesiąc od klientów spoza Hiszpanii.",
    ibi: "Roczny podatek od nieruchomości (Impuesto sobre Bienes Inmuebles) płacony na rzecz lokalnych rad.",
    escritura: "Oficjalny akt notarialny podpisany przed notariuszem przy zakupie nieruchomości.",
  },
},
```

### 2. Update the GlossaryTeaser Component

Modify `ReviewsAndBlog.tsx` to read term descriptions from translations:

```typescript
const FEATURED_TERMS = [
  { term: "NIE", icon: Scale, key: "nie" },
  { term: "Digital Nomad Visa", icon: Laptop, key: "digitalNomadVisa" },
  { term: "IBI", icon: Home, key: "ibi" },
  { term: "Escritura", icon: Book, key: "escritura" },
];

// In the component render:
<p className="text-slate-600 text-sm font-light leading-relaxed">
  {t.glossaryTeaser?.terms?.[item.key] || item.fallbackDescription}
</p>

// And for "Learn more":
<div className="...">
  {t.glossaryTeaser?.learnMore || "Learn more"} <ArrowRight size={14} />
</div>
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/i18n/translations/en.ts` | Add `learnMore` and `terms` object |
| `src/i18n/translations/pl.ts` | Add Polish `learnMore` and `terms` |
| `src/i18n/translations/de.ts` | Add German `learnMore` and `terms` |
| `src/i18n/translations/nl.ts` | Add Dutch `learnMore` and `terms` |
| `src/i18n/translations/fr.ts` | Add French `learnMore` and `terms` |
| `src/i18n/translations/sv.ts` | Add Swedish `learnMore` and `terms` |
| `src/i18n/translations/da.ts` | Add Danish `learnMore` and `terms` |
| `src/i18n/translations/hu.ts` | Add Hungarian `learnMore` and `terms` |
| `src/i18n/translations/fi.ts` | Add Finnish `learnMore` and `terms` |
| `src/i18n/translations/no.ts` | Add Norwegian `learnMore` and `terms` |
| `src/components/home/sections/ReviewsAndBlog.tsx` | Update component to use translations |

## Term Translations (All 10 Languages)

| Term | English | Polish |
|------|---------|--------|
| NIE | Tax identification number required for all property transactions in Spain. | Numer identyfikacji podatkowej wymagany do wszystkich transakcji nieruchomościowych w Hiszpanii. |
| Digital Nomad Visa | Spanish visa for remote workers earning €2,520+/month from non-Spanish clients. | Hiszpańska wiza dla pracowników zdalnych zarabiających ponad €2,520/miesiąc od klientów spoza Hiszpanii. |
| IBI | Annual property tax (Impuesto sobre Bienes Inmuebles) paid to local councils. | Roczny podatek od nieruchomości (Impuesto sobre Bienes Inmuebles) płacony na rzecz lokalnych rad. |
| Escritura | Official public deed signed before a notary when purchasing property. | Oficjalny akt notarialny podpisany przed notariuszem przy zakupie nieruchomości. |
| Learn more | Learn more | Dowiedz się więcej |

*(Full translations for all 10 languages will be added)*

## Result After Implementation

- All glossary term cards will display localized descriptions
- Spanish legal terms (NIE, IBI, Escritura) remain untranslated as per project standards
- "Learn more" link text will be translated
- 100% localization integrity on the Polish homepage (and all other language versions)

