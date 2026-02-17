

# Build Strategy Page 3: Tax-Free Retirement

## Overview
Create the third strategy page at `/:lang/strategies/tax-free-retirement` following the same architecture as IUL and Whole Life pages, but with content focused on combining multiple tax-free vehicles into a cohesive retirement strategy.

## Page Sections (7 total)

### Section 1: Hero
- Same cinematic staged reveal pattern (gold line, badge, headline, subtitle, stat badges, CTAs)
- Headline: "How to Retire with $0 in Income Taxes"
- Three stat badges: "$0 Tax Bill, Multiple Vehicles, No RMDs"
- Primary CTA: "Build Your Tax-Free Plan" / Secondary: "See the Math"

### Section 2: Speakable Overview
- GlassCard with educational paragraph about tax-free retirement strategy
- Same three trust badges
- SpeakableSpecification JSON-LD

### Section 3: The Tax Time Bomb (Interactive)
- 2-column layout
- Left side: Interactive SVG chart comparing 401k withdrawals (taxed) vs. tax-free income over 30 years of retirement
- Slider to adjust annual withdrawal amount ($50K-$200K)
- Shows cumulative taxes paid with 401k vs. $0 with tax-free strategy
- Right side: 5 ProcessSteps explaining the tax time bomb -- RMDs, tax bracket creep, Social Security taxation, Medicare surcharges, estate tax exposure

### Section 4: Tax-Free Income Stacking (Animated Layers)
- Visual showing 4 income layers stacking up like building blocks
- Layer 1: Roth IRA ($7K/year)
- Layer 2: IUL ($50K-$100K/year)
- Layer 3: Municipal Bonds (as needed)
- Layer 4: HSA (triple tax-free)
- Each layer is a GlassCard with details, animates in sequentially on scroll
- Total combined income projection at the top

### Section 5: Tax-Free vs Taxable Comparison
- Reuses StrategyComparisonTable shared component
- Left column: Traditional (401k + Pension + Social Security -- all taxed)
- Right column: Tax-Free Stack (Roth + IUL + Munis + HSA -- all tax-free)
- Winner badge: "Tax-Free Strategy Wins Over Time"

### Section 6: Who Should Consider Tax-Free Retirement
- Same pattern as IUL/Whole Life (GlassCard grid, Perfect For / Not Ideal For)
- Perfect For: High earners in high-tax states, those maxing out 401k/Roth, business owners, those worried about future tax rate increases, retirees wanting predictable income, estate planners
- Not Ideal For: Those in low tax brackets with no expectation of increase, those needing all income now, those close to retirement without existing tax-free vehicles, heavily indebted individuals

### Section 7: Final CTA (Lead Capture)
- Reuses StrategyFormCTA shared component
- Headline: "Get Your Personalized Tax-Free Retirement Blueprint"

## Technical Implementation

### New Files
- `src/pages/strategies/TaxFreeRetirement.tsx` -- page component with SEO/schemas
- `src/components/strategies/taxfree/TFRHero.tsx`
- `src/components/strategies/taxfree/TFRSpeakable.tsx`
- `src/components/strategies/taxfree/TFRTaxTimeBomb.tsx` (interactive chart + steps)
- `src/components/strategies/taxfree/TFRIncomeStacking.tsx` (animated layers)
- `src/components/strategies/taxfree/TFRComparison.tsx`
- `src/components/strategies/taxfree/TFRIdealClient.tsx`
- `src/components/strategies/taxfree/TFRCTA.tsx`

### Modified Files
- `src/App.tsx` -- add routes `/:lang/strategies/tax-free-retirement` and `/:lang/estrategias/retiro-libre-impuestos`
- `src/i18n/translations/en.ts` -- add `strategies.taxFreeRetirement` block
- `src/i18n/translations/es.ts` -- add `strategies.taxFreeRetirement` block

### Reused Components
- MorphingBlob, GlassCard, StatBadge, TrustBadge, ProcessStep, StrategyComparisonTable, StrategyFormCTA

### SEO and Schemas
- WebPage, Article, BreadcrumbList, Organization, SpeakableSpecification JSON-LD
- Hreflang tags (en, es, x-default)
- Open Graph + Twitter Card meta
- Canonical URL

### Interactive Element: Tax Savings Calculator
- Withdrawal amount slider ($50K-$200K/year)
- SVG bar chart showing annual taxes paid (401k) vs. $0 (tax-free)
- Cumulative 30-year tax savings counter with animated number
- Assumes 24% federal + 9.3% CA state tax rates as defaults

### Design
- All rounded corners (xl, 2xl, full) per brand standard
- Same glassmorphism, Framer Motion animations, and color palette
- No new dependencies needed

