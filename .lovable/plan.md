

# Phase 9.8 -- Integrate Uploaded Everence Wealth Structure

## Overview
Align the homepage with the uploaded Everence Wealth reference project. This means:
1. Creating 5 new section components (TheGap, Stats, Assessment, FAQ, CTA)
2. Removing old real-estate sections from the homepage flow
3. Updating global styling to match the dark aesthetic (fonts, grain overlay, glass-card utility)
4. Restructuring the Home.tsx section order

---

## What Changes

### Sections to KEEP (already built):
- Hero, WakeUpCall, SilentKillers, TaxBuckets, IndexedAdvantage, WealthPhilosophy, FiduciaryDifference, HomepageAbout, Header, Footer, CursorGlow

### Sections to REMOVE from homepage (files stay, just unused):
- WhyChooseUs, QuickSearch, MiniAbout, USPSection, FeaturedAreas, Process, Reviews, BlogTeaser, GlossaryTeaser, Testimonials, Final CTA block

### New Sections to CREATE:

**1. TheGap** (`src/components/homepage/TheGap.tsx`)
- Visual section showing the "retirement gap" concept
- Split layout: left side with a dramatic stat (e.g., "The average American has a $1.2M retirement shortfall"), right side with a simple line/bar visualization
- Dark background (#020806), glass-card styling
- Scroll-triggered animation via ScrollReveal

**2. Stats** (`src/components/homepage/Stats.tsx`)
- Social proof / credibility metrics in a horizontal row
- 4 animated counters: "27+ Years", "1,200+ Families Served", "75+ Carriers", "$500M+ Protected"
- Uses existing `useAnimatedCounter` hook
- Dark section with subtle border separators

**3. Assessment** (`src/components/homepage/Assessment.tsx`)
- Call-to-action for the retirement gap assessment tool
- Headline: "Find Out Where You Stand"
- Brief 3-step process description (Answer Questions, Get Analysis, See Your Plan)
- Primary CTA button: "Start Your Free Assessment" linking to /assessment
- Dark gradient background with glass-card styling

**4. FAQ** (`src/components/homepage/FAQ.tsx`)
- Accordion-style FAQ section using Radix Accordion (already installed)
- 6-8 common questions about fiduciary duty, IUL, fees, tax strategies
- Dark background, white text, evergreen accents
- Staggered reveal animation

**5. CTA** (`src/components/homepage/CTA.tsx`)
- Final call-to-action replacing the old Final CTA block
- Headline: "Your Retirement Deserves Better"
- Two buttons: "Schedule Assessment" and "Call Us Direct"
- Dark background with radial glow effect
- Replaces the old translation-dependent Final CTA

### Updated Home.tsx Section Order:
```
Header
CursorGlow
Hero
WakeUpCall
SilentKillers
TaxBuckets
IndexedAdvantage
WealthPhilosophy
FiduciaryDifference
TheGap        (NEW)
HomepageAbout  (KEEP)
Stats          (NEW)
Assessment     (NEW)
FAQ            (NEW)
CTA            (NEW)
Footer
```

### Global Styling Updates

**index.html:**
- Update `<title>` to "Everence Wealth - Bridge the Retirement Gap"
- Add Sora and Outfit font imports alongside existing fonts
- Remove old LCP hero image preload (no longer used)

**tailwind.config.ts:**
- Add `evergreen: '#1A4D3E'` and `dark-bg: '#020806'` to colors
- Add Sora to `fontFamily.sans` and Outfit as heading alternative
- Add `glass-card` plugin utility (backdrop-blur + semi-transparent bg + border)

**src/index.css (or global styles):**
- Add `.grain-overlay::after` pseudo-element for film grain texture
- Add `.glass-card` utility class
- Add `::selection` color override (evergreen)
- Hide scrollbar styling

**Home.tsx:**
- Remove all old real-estate section imports and JSX
- Remove the legacy `reveal-on-scroll` IntersectionObserver useEffect (already mostly superseded by framer-motion)
- Remove `useTranslation` import (no longer needed for final CTA)
- Remove `LanguageSuggestionBanner` and `BlogEmmaChat` imports
- Import the 5 new components
- Set root div background to `bg-[#020806]` instead of `bg-slate-50`

---

## Technical Details

### Files Created (5):
- `src/components/homepage/TheGap.tsx`
- `src/components/homepage/Stats.tsx`
- `src/components/homepage/Assessment.tsx`
- `src/components/homepage/FAQ.tsx`
- `src/components/homepage/CTA.tsx`

### Files Modified (3):
- `src/pages/Home.tsx` -- restructured section order, removed old imports
- `tailwind.config.ts` -- new colors and font families
- `index.html` -- updated title, added Sora/Outfit fonts

### No database, edge function, or RLS changes required.
