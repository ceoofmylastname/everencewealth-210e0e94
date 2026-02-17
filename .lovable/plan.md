
## Rebrand Location Hub to Everence Wealth

The Location Hub page currently references "Real Estate Intelligence," "Costa del Sol," "Del Sol Prime Homes," property buying, and Mediterranean real estate throughout. This plan replaces all of that with Everence Wealth financial advisory content.

---

### Scope of Changes

**4 files** need updates:

### 1. `src/pages/LocationHub.tsx` (Hero Section)
- Replace the Unsplash coastal image with a professional financial/advisory gradient background (matching the brand's tactical institutional aesthetic -- deep Evergreen gradient with gold accents, no external image needed)
- Update the hidden speakable summary to reference Everence Wealth financial guides for US cities
- Remove "Costa del Sol" and "real estate" references
- Update stats labels context (keep dynamic -- cities/guides/languages/data points are fine)

### 2. `src/lib/locationHubSchemaGenerator.ts` (All Localized Content + Schema)
- Update `BASE_URL` from `delsolprimehomes.com` to the correct Everence Wealth domain
- Update `ORGANIZATION_SCHEMA` -- name to "Everence Wealth", address to San Francisco, remove Spanish real estate credential
- Replace `LOCALE_MAP` -- limit to `en` and `es` (the two supported languages)
- Update `SUPPORTED_LANGUAGES` to `['en', 'es']`
- **English content**: Title to "Location Guides | Everence Wealth", description about financial planning guides for US cities, heroTitle to "Financial Intelligence", heroSubtitle to "for {count} Markets", CTA text about scheduling a consultation
- **Spanish content**: Matching Spanish translations
- Remove all other languages (nl, de, fr, sv, no, da, fi, pl, hu) -- platform only supports English and Spanish
- Update FAQs to match the already-rebranded FAQ content (en/es only)
- Update schema "about" from Costa del Sol/Spain to United States

### 3. `src/components/location-hub/SpeakableHubIntro.tsx`
- Replace all `LOCALIZED_CONTENT` entries: remove Costa del Sol and real estate references
- Update English intro to describe Everence Wealth location guides covering US cities with financial planning, retirement, tax strategies, and insurance insights
- Update highlights to reflect financial advisory topics (e.g., "50 states served", "Bilingual guidance", "Updated quarterly")
- Keep only `en` and `es` locales, remove all others

### 4. `src/components/location-hub/WhatToExpectSection.tsx`
- Replace real-estate-focused intelligence cards with financial advisory equivalents:
  - Price Analysis -> Tax Analysis
  - School Zones -> Estate Planning
  - Rental Yields -> Retirement Projections
  - Safety Data -> Risk Assessment
  - Healthcare Access -> Insurance Coverage
  - Lifestyle -> Cash Flow Planning
  - Transport -> Market Access (local advisor availability)
  - Legal Guide -> Regulatory Compliance
- Keep only `en` and `es` locales, remove all others

---

### Technical Details

- The hero background will switch from an Unsplash image to a CSS gradient matching the brand (Evergreen-to-dark with gold blur orbs), consistent with the blog hero pattern already established
- All schema.org JSON-LD will reference "Everence Wealth" and US geography
- The `SUPPORTED_LANGUAGES` array reduction to `['en', 'es']` will also reduce hreflang tags output
- No database changes needed -- this is purely a frontend/content rebrand
