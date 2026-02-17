

# Build Strategy Page 1: Indexed Universal Life (IUL)

## Overview
Create the first of 4 premium strategy pages at `/:lang/strategies/iul`. This page will match the Philosophy page's elevated design with glassmorphism, Framer Motion animations, 3D elements, and full i18n/SEO support.

## Page Sections (7 total)

### Section 1: Hero
- Dark evergreen mesh gradient background with `MorphingBlob` elements
- Cinematic staged reveal (gold line, badge, headline, subtitle, stat badges, CTAs)
- Three animated stat badges: "Market-Linked Growth", "0% Floor Protection", "Tax-Free Withdrawals"
- Primary CTA: "Get Personalized Illustration" + Secondary: "Compare to 401k"
- Thin pulsing scroll indicator at bottom

### Section 2: Speakable Overview
- White background with subtle grid pattern
- `GlassCard` containing the speakable paragraph (educational, SEO-rich)
- Three trust badges below: "Licensed in 50 States", "75+ Carrier Partners", "1,200+ Families Served"
- JSON-LD SpeakableSpecification schema

### Section 3: How It Works (Interactive)
- Cream background, 2-column layout (left: visual, right: steps)
- Left side: Animated SVG diagram showing premium flow, index crediting, and floor protection (custom SVG, not React Three Fiber -- lighter weight and more reliable)
- Interactive slider to simulate market performance (-50% to +50%)
- Shows account value result with floor protection logic
- Right side: 5 numbered `ProcessStep` items with staggered entrance animations and Lucide icons

### Section 4: IUL vs 401k Comparison
- White background, full-width animated comparison table
- Two columns: 401k (red-tinted) vs IUL (green-tinted)
- 9 feature rows with staggered scroll reveal
- Each row shows red X or green checkmark with value text
- Winner badge at bottom with trophy icon in `GlassCard`

### Section 5: Living Benefits
- Cream-to-white gradient background
- Three `GlassCard` items: Critical Illness, Chronic Illness, Terminal Illness
- Each card with colored icon, description, benefit amount, real example
- Hover tilt effect (CSS perspective transform, no R3F needed)
- Client testimonial callout at bottom in `GlassCard`

### Section 6: Who Should Consider IUL
- White background, 2-column grid
- Left: "Perfect For" -- green border, 6 items with checkmark icons
- Right: "Not Ideal For" -- red border, 4 items with X icons
- Staggered entrance animations

### Section 7: Final CTA (Lead Capture)
- Dark evergreen-to-black gradient with `MorphingBlob`
- Headline + subtitle
- Glassmorphic dark form: Name, Email, Phone, Income Range dropdown
- Submit button with gold styling
- Privacy disclaimer text

## Technical Implementation

### New Files
- `src/pages/strategies/IndexedUniversalLife.tsx` -- page component with SEO/schemas
- `src/components/strategies/iul/IULHero.tsx`
- `src/components/strategies/iul/IULSpeakable.tsx`
- `src/components/strategies/iul/IULHowItWorks.tsx`
- `src/components/strategies/iul/IULComparison.tsx`
- `src/components/strategies/iul/IULLivingBenefits.tsx`
- `src/components/strategies/iul/IULIdealClient.tsx`
- `src/components/strategies/iul/IULCTA.tsx`
- `src/components/strategies/shared/ProcessStep.tsx` -- reusable for all strategy pages
- `src/components/strategies/shared/StatBadge.tsx` -- reusable
- `src/components/strategies/shared/TrustBadge.tsx` -- reusable
- `src/components/strategies/shared/ComparisonTable.tsx` -- reusable
- `src/components/strategies/shared/StrategyFormCTA.tsx` -- reusable lead form

### Modified Files
- `src/App.tsx` -- add route `/:lang/strategies/iul`
- `src/i18n/translations/en.ts` -- add `strategies.iul` block
- `src/i18n/translations/es.ts` -- add `strategies.iul` block

### Reused Existing Components
- `MorphingBlob` from philosophy
- `GlassCard` from philosophy
- `useAnimatedCounter` hook
- `Header` and `Footer`
- `Helmet` for SEO

### SEO & Schemas
- WebPage, Article, BreadcrumbList, Organization, and SpeakableSpecification JSON-LD
- Hreflang tags (en, es, x-default)
- Open Graph + Twitter Card meta
- Canonical URL

### Design Decisions
- Using custom SVG animations instead of React Three Fiber for the "How It Works" diagram -- significantly lighter, faster loading, and more reliable
- The comparison table is a shared component that will be reused on Whole Life, Tax-Free Retirement, and Asset Protection pages
- All elements use rounded corners (xl, 2xl, full) per the brand standard
- Form submission will log to console for now (CRM integration can be added later)

### No New Dependencies
Uses existing `framer-motion`, `lucide-react`, `react-helmet`, and project utilities.

