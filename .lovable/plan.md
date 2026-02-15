

# Phase 1: Foundation -- Branding, Colors, and Language Reduction

This is the first of ~8-10 phases to transform Del Sol Prime Homes into Everence Wealth. Phase 1 focuses on the structural foundation that everything else builds on.

---

## What Phase 1 Covers

1. **Brand colors and CSS variables** -- Replace the gold/navy palette with Evergreen/Slate
2. **Language reduction** -- Strip 8 of 10 languages, keeping only English and Spanish
3. **Site title, metadata, and SEO defaults** -- Replace "Del Sol Prime Homes" references
4. **Navigation labels** -- Rename menu items (Properties to Strategies, etc.)
5. **Homepage hero content** -- Replace real estate copy with insurance/wealth copy

## What Phase 1 Does NOT Cover (future phases)

- Database schema changes (Phase 2)
- Edge function prompt updates (Phase 3)
- CRM terminology updates (Phase 4)
- Admin CMS label updates (Phase 5)
- Chatbot personality swap (Phase 6)
- Content page rewrites (Phase 7)
- SEO schema and hreflang cleanup (Phase 8)

---

## Detailed Changes

### 1. Color Palette Update

**File: `src/index.css`** -- Update CSS custom properties:

```text
Current                          New (HSL)
--primary: 42 58% 60% (gold)    --primary: 160 48% 21% (Evergreen #1A4D3E)
--accent: 42 58% 60% (gold)     --accent: 160 48% 21% (Evergreen)
--background: 40 20% 98%        --background: 100 8% 95% (Cream #F0F2F1)
--secondary: 204 35% 88%        --secondary: 215 10% 35% (Slate #4A5565)
```

Also update custom colors:
- `landing-navy` stays similar (dark text)
- `landing-gold` / `prime-gold` to Evergreen tones
- Add `everence-green`, `everence-slate`, `everence-cream` utility colors

### 2. Language Reduction (10 to 2)

**Files affected:**
- `src/types/home.ts` -- Remove 8 enum values, keep EN + ES (add ES to enum)
- `src/i18n/translations/index.ts` -- Remove 8 imports, keep en + es
- `src/i18n/translations/en.ts` -- Update content to Everence Wealth
- `src/i18n/translations/es.ts` -- Update content to Everence Wealth (Spanish)
- Remove translation files: `nl.ts`, `fr.ts`, `de.ts`, `fi.ts`, `pl.ts`, `da.ts`, `hu.ts`, `sv.ts`, `no.ts`
- `src/components/landing/LanguageSelector.tsx` -- Only show EN/ES
- `src/components/retargeting/RetargetingLanguageSelector.tsx` -- Only EN/ES
- `src/types/hreflang.ts` -- Reduce SUPPORTED_LANGUAGES to ['en', 'es']
- `src/App.tsx` -- Remove 8 landing page routes, 8 retargeting routes, keep EN/ES only
- Remove landing page directories: `src/pages/landing/nl/`, `fr/`, `de/`, etc. (keep `en/` and add `es/`)

### 3. Navigation Labels

Update the navigation/header translations:

```text
Properties     -> Strategies
Locations      -> States  
Blog           -> Education
Buyer's Guide  -> Client Guide
Glossary       -> Financial Terms
About          -> Our Philosophy
Team           -> Our Advisors
Contact        -> Get Started
```

### 4. Homepage Hero Content

**File: `src/components/home/sections/Hero.tsx`** and translation files:

- Replace headline: "Your trusted partner in Costa del Sol real estate" with "Bridge the Retirement Gap. Protect What Matters."
- Replace tagline with wealth management messaging
- Replace CTAs: "Find Properties" to "Explore Strategies", "Talk to Emma" to "Get Started"
- Replace trust badges: "API Connected" to "75+ Carriers", "35+ Years" stays, "500+ Buyers" to "Fiduciary Advisors"
- Replace background video/image with professional financial imagery

### 5. SEO Metadata

Update default site metadata across:
- Page titles
- Meta descriptions
- OG images reference
- Organization info (San Francisco address)

---

## Technical Notes

- The `tailwind.config.lov.json` is auto-generated and should not be edited directly; color changes go through `src/index.css` CSS variables
- Language enum changes will cause TypeScript errors in many files -- these will be addressed by updating all references from removed languages
- Landing page routes in App.tsx for removed languages will be deleted
- The retargeting routes config (`src/lib/retargetingRoutes.ts`) needs to be reduced to EN/ES only
- ES (Spanish) exists in some files already (retargeting) but needs to be added to the main i18n system

---

## Estimated Scope

- ~30 files modified
- ~10 files deleted (unused language translations and landing pages)
- Zero database changes
- Zero edge function changes

This phase creates a clean foundation so all subsequent phases build on the correct brand identity and language configuration.

