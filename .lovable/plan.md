
# Fix "Years of Experience" Values Across Site

## Problem Summary

The screenshot shows **two incorrect values** on the About page:
- Hero text shows "**15+** years of expertise" → should be "**35+**"
- Stats card shows "**9+** YEARS EXPERIENCE" → should be "**35+**"

## Root Cause Analysis

| Location | Current Value | Source |
|----------|---------------|--------|
| Hero subheadline "15+" | Database: `about_page_content.hero_subheadline` | Hardcoded string |
| Stats "9+" | Database: `about_page_content.years_in_business` | Integer value |
| Code constant | `COMPANY_FACTS.yearsExperience = 35` | ✅ Correct |

The database record overrides the correct code constants.

---

## Solution

### 1. Database Update (Critical)

Update the `about_page_content` table where `slug = 'main'`:

```sql
UPDATE about_page_content 
SET 
  years_in_business = 35,
  hero_subheadline = 'Three founders, 35+ years of expertise, and one mission: making your Spanish property dreams a reality.'
WHERE slug = 'main';
```

### 2. Fix Hardcoded "15+" in Static Scripts

**File:** `scripts/generateStaticHomePage.ts`

Update hero descriptions for all 10 languages from "15+" to "35+":
- Line 46: English
- Line 55: German  
- Line 64: Dutch
- Line 73: French
- (and 6 more languages)

### 3. Fix Buyer's Guide Translation Files

Update `trustSignals.experience` in all 10 language files:

| File | Current | Updated |
|------|---------|---------|
| `buyersGuide/en.ts` | "15+ Years Experience" | "35+ Years Experience" |
| `buyersGuide/de.ts` | "15+ Jahre Erfahrung" | "35+ Jahre Erfahrung" |
| `buyersGuide/nl.ts` | "15+ Jaar Ervaring" | "35+ Jaar Ervaring" |
| `buyersGuide/fr.ts` | "15+ Ans d'Expérience" | "35+ Ans d'Expérience" |
| `buyersGuide/fi.ts` | "15+ Vuoden Kokemus" | "35+ Vuoden Kokemus" |
| `buyersGuide/pl.ts` | "15+ Lat Doświadczenia" | "35+ Lat Doświadczenia" |
| `buyersGuide/da.ts` | "15+ Års Erfaring" | "35+ Års Erfaring" |
| `buyersGuide/hu.ts` | "15+ Év Tapasztalat" | "35+ Év Tapasztalat" |
| `buyersGuide/sv.ts` | "15+ Års Erfarenhet" | "35+ Års Erfarenhet" |
| `buyersGuide/no.ts` | "15+ Års Erfaring" | "35+ Års Erfaring" |

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Update `about_page_content` record |
| `scripts/generateStaticHomePage.ts` | Replace "15+" → "35+" in hero descriptions (10 languages) |
| `src/i18n/translations/buyersGuide/en.ts` | `experience: "35+ Years Experience"` |
| `src/i18n/translations/buyersGuide/de.ts` | `experience: "35+ Jahre Erfahrung"` |
| `src/i18n/translations/buyersGuide/nl.ts` | `experience: "35+ Jaar Ervaring"` |
| `src/i18n/translations/buyersGuide/fr.ts` | `experience: "35+ Ans d'Expérience"` |
| `src/i18n/translations/buyersGuide/fi.ts` | `experience: "35+ Vuoden Kokemus"` |
| `src/i18n/translations/buyersGuide/pl.ts` | `experience: "35+ Lat Doświadczenia"` |
| `src/i18n/translations/buyersGuide/da.ts` | `experience: "35+ Års Erfaring"` |
| `src/i18n/translations/buyersGuide/hu.ts` | `experience: "35+ Év Tapasztalat"` |
| `src/i18n/translations/buyersGuide/sv.ts` | `experience: "35+ Års Erfarenhet"` |
| `src/i18n/translations/buyersGuide/no.ts` | `experience: "35+ Års Erfaring"` |

---

## Result

After implementation:
- About page hero: "Three founders, **35+** years of expertise..."
- About page stats: "**35+** YEARS EXPERIENCE"
- Home page static HTML: "35+ years of expertise" (all 10 languages)
- Buyer's Guide CTA: "35+ Years Experience" (all 10 languages)
- Full consistency with `COMPANY_FACTS.yearsExperience = 35`
