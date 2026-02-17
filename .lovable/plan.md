

# Build Strategy Page 2: Whole Life Insurance

## Overview
Create the second strategy page at `/:lang/strategies/whole-life` following the exact same architecture and component patterns established by the IUL page.

## Page Sections (7 total)

### Section 1: Hero
- Same cinematic staged reveal pattern as IUL (gold line, badge, headline, subtitle, stat badges, CTAs)
- Three stat badges: "Guaranteed Growth", "Tax-Free Dividends", "Infinite Banking"
- Primary CTA: "Get Your Whole Life Quote" / Secondary: "Compare to IUL"

### Section 2: Speakable Overview
- GlassCard with educational paragraph about whole life insurance
- Same three trust badges (Licensed in 50 States, 75+ Carrier Partners, 1,200+ Families Served)
- SpeakableSpecification JSON-LD

### Section 3: How It Works (Interactive)
- 2-column layout reusing ProcessStep shared component
- Left side: Interactive SVG showing guaranteed vs. projected cash value growth over time (year slider from 1 to 30)
- Visualization shows guaranteed cash value line vs. dividend-enhanced projection
- Right side: 5 steps -- Pay Premium, Guaranteed Cash Value, Dividend Crediting, Policy Loans (Infinite Banking), Death Benefit

### Section 4: Whole Life vs IUL Comparison
- Reuses StrategyComparisonTable shared component
- Left column: IUL (context: variable growth, market-linked)
- Right column: Whole Life (context: guaranteed, conservative, dividend-paying)
- Winner badge: "Choose Based on Your Goals"

### Section 5: Infinite Banking Concept
- Replaces the "Living Benefits" section with content unique to whole life
- Three GlassCards: "Be Your Own Bank", "Recapture Interest", "Generational Wealth"
- Each with icon, description, and real example
- Testimonial callout about infinite banking success story

### Section 6: Who Should Consider Whole Life
- Same pattern as IUL (GlassCard grid, Perfect For / Not Ideal For)
- Perfect For: Conservative investors, business owners for buy-sell agreements, estate planning, infinite banking enthusiasts, those wanting guaranteed growth, high-net-worth legacy planning
- Not Ideal For: Those seeking maximum growth potential, budget-conscious (higher premiums), young investors with long time horizon, those prioritizing flexibility over guarantees

### Section 7: Final CTA (Lead Capture)
- Reuses StrategyFormCTA shared component
- Headline: "Get Your Personalized Whole Life Illustration"

## Technical Implementation

### New Files
- `src/pages/strategies/WholeLife.tsx` -- page component with SEO/schemas
- `src/components/strategies/wholelife/WLHero.tsx`
- `src/components/strategies/wholelife/WLSpeakable.tsx`
- `src/components/strategies/wholelife/WLHowItWorks.tsx`
- `src/components/strategies/wholelife/WLComparison.tsx`
- `src/components/strategies/wholelife/WLInfiniteBanking.tsx`
- `src/components/strategies/wholelife/WLIdealClient.tsx`
- `src/components/strategies/wholelife/WLCTA.tsx`

### Modified Files
- `src/App.tsx` -- add routes `/:lang/strategies/whole-life` and `/:lang/estrategias/seguro-vida-entera`
- `src/i18n/translations/en.ts` -- add `strategies.wholeLife` block
- `src/i18n/translations/es.ts` -- add `strategies.wholeLife` block

### Reused Components
- MorphingBlob, GlassCard, StatBadge, TrustBadge, ProcessStep, StrategyComparisonTable, StrategyFormCTA (all from IUL build)
- Header, Footer, Helmet

### SEO and Schemas
- WebPage, Article, BreadcrumbList, Organization, SpeakableSpecification JSON-LD
- Hreflang tags (en, es, x-default)
- Open Graph + Twitter Card meta
- Canonical URL

### Interactive Element: Cash Value Growth Simulator
- Year slider (1-30 years) showing guaranteed cash value vs. dividend-projected value
- SVG line chart with two curves
- Starting premium of $25,000/year
- Shows guaranteed values and dividend-enhanced projections
- Whole life specific: no floor/cap like IUL, instead guaranteed minimums plus non-guaranteed dividends

### Design
- All rounded corners (xl, 2xl, full) per brand standard
- Same glassmorphism, Framer Motion animations, and color palette
- No new dependencies needed

