

## Fix Homepage Translation: Connect All Sections to the i18n System

### What's Wrong

I tested the language switcher and found two major issues:

1. **Homepage sections are hardcoded in English** -- All 15 homepage components (`Hero`, `WakeUpCall`, `SilentKillers`, `TaxBuckets`, `IndexedAdvantage`, `WealthPhilosophy`, `FiduciaryDifference`, `TheGap`, `Services`, `HomepageAbout`, `Stats`, `Assessment`, `FAQ`, `BlogPreview`, `CTA`) have text written directly in the code. They don't use the translation system at all. When a user switches to Spanish, nothing changes.

2. **Spanish translations are outdated** -- The `es.ts` file still contains old real estate content ("DelSolPrimeHomes", "Costa del Sol", "Marbella", apartments, property buying). It was never updated to match the Everence Wealth brand and the new homepage sections.

### What Needs to Happen

#### Phase 1: Update Spanish Translations (`src/i18n/translations/es.ts`)
- Completely rewrite the `es.ts` file to match the Everence Wealth brand
- Add Spanish translations for all new homepage sections that currently only exist as hardcoded English:
  - `wakeUpCall` (tax traps, retirement gap warnings)
  - `silentKillers` (hidden fees, tax exposure)
  - `taxBuckets` (tax-free bucket strategy)
  - `indexedAdvantage` (indexed strategies explanation)
  - `wealthPhilosophy` (fiduciary philosophy)
  - `fiduciaryDifference` (fiduciary vs broker comparison)
  - `theGap` (retirement gap visualization)
  - `services` (service offerings)
  - `homepageAbout` (about section)
  - `stats` (key statistics)
  - `assessment` (CTA for assessment)
  - `faq` (frequently asked questions)
  - `blogPreview` (blog section)
  - `cta` (final call to action)
- Remove all old real estate references (Costa del Sol, Marbella, property finder, etc.)

#### Phase 2: Add Translation Keys to English File (`src/i18n/translations/en.ts`)
- Add matching translation keys for all homepage sections using the current hardcoded English text
- This ensures both languages use the same key structure

#### Phase 3: Connect Homepage Components to Translation System
Update each of the 15 homepage components to:
- Import `useTranslation` from the i18n system
- Replace all hardcoded strings with `t.sectionName.key` references

Files to update:
- `src/components/home/sections/Hero.tsx`
- `src/components/homepage/WakeUpCall.tsx`
- `src/components/homepage/SilentKillers.tsx`
- `src/components/homepage/TaxBuckets.tsx`
- `src/components/homepage/IndexedAdvantage.tsx`
- `src/components/homepage/WealthPhilosophy.tsx`
- `src/components/homepage/FiduciaryDifference.tsx`
- `src/components/homepage/TheGap.tsx`
- `src/components/homepage/Services.tsx`
- `src/components/homepage/HomepageAbout.tsx`
- `src/components/homepage/Stats.tsx`
- `src/components/homepage/Assessment.tsx`
- `src/components/homepage/FAQ.tsx`
- `src/components/homepage/BlogPreview.tsx`
- `src/components/homepage/CTA.tsx`

#### Phase 4: Clean Up Old Real Estate References
- Remove unused translation keys from `es.ts` (property finder, Costa del Sol areas, brochures, etc.)
- Ensure the `en.ts` file also has no leftover real estate content in the homepage sections

### Additional Issues Found (Logo)
The logo in the header still shows the old "DELSOL" branding image. This is a separate issue from translations -- it's an external image URL that needs to be replaced with an Everence Wealth logo.

### Result
After this work, switching from EN to ES will translate the entire homepage -- every heading, paragraph, button, badge, and CTA -- into Spanish with Everence Wealth branding.
