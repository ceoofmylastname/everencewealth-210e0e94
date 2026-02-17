

# Build Strategy Page 4: Asset Protection

## Overview
Create the fourth and final strategy page at `/:lang/strategies/asset-protection` following the same architecture as IUL, Whole Life, and Tax-Free Retirement pages. Content focuses on protecting wealth from lawsuits, creditors, divorce, and estate taxes using trusts, LLCs, IUL, and annuities.

## Page Sections (7 total)

### Section 1: Hero
- Same cinematic staged reveal pattern (gold line, badge, headline, subtitle, stat badges, CTAs)
- Headline: "Protect Everything You've Built"
- Three stat badges: "Lawsuit-Proof", "Creditor-Protected", "Estate Tax-Free"
- Primary CTA: "Get Your Protection Plan" / Secondary: "See How It Works"

### Section 2: Speakable Overview
- GlassCard with educational paragraph about asset protection strategy
- Same three trust badges (Licensed in 50 States, 75+ Carrier Partners, 1,200+ Families Served)
- SpeakableSpecification JSON-LD

### Section 3: The Threat Landscape (Interactive)
- 2-column layout
- Left side: Interactive SVG showing 5 threat vectors as concentric rings around a central "Your Wealth" node -- Lawsuits, Creditors, Divorce, Estate Taxes, Nursing Home Costs
- Clicking/hovering a ring highlights it and shows the risk percentage / average cost
- Right side: 5 ProcessSteps explaining each threat -- Frivolous Lawsuits, Business Creditors, Divorce Asset Splitting, Estate Tax Erosion, Long-Term Care Drain

### Section 4: Protection Vehicles (Animated Layers)
- Similar to Tax-Free Retirement's Income Stacking but for protection layers
- Layer 1: Irrevocable Life Insurance Trust (ILIT)
- Layer 2: Family Limited Partnership (FLP)
- Layer 3: IUL Cash Value (creditor-protected in most states)
- Layer 4: Annuities (protected in many states)
- Each layer is a GlassCard with details, animates in sequentially on scroll

### Section 5: Protected vs Unprotected Comparison
- Reuses StrategyComparisonTable shared component
- Left column: Unprotected (assets in personal name, 401k, taxable accounts)
- Right column: Protected (ILIT, FLP, IUL, Annuities, LLCs)
- 8 feature rows
- Winner badge: "Proper Structure Protects Your Legacy"

### Section 6: Who Should Consider Asset Protection
- Same pattern as other pages (Perfect For / Not Ideal For grid)
- Perfect For: Business owners, medical professionals, real estate investors, high-net-worth families, those in litigious professions, estate planners
- Not Ideal For: Those with minimal assets, early career with low net worth, those already in active litigation (too late), those unwilling to restructure ownership

### Section 7: Final CTA (Lead Capture)
- Reuses StrategyFormCTA shared component
- Headline: "Get Your Personalized Asset Protection Blueprint"

## Technical Implementation

### New Files
- `src/pages/strategies/AssetProtection.tsx` -- page component with SEO/schemas
- `src/components/strategies/assetprotection/APHero.tsx`
- `src/components/strategies/assetprotection/APSpeakable.tsx`
- `src/components/strategies/assetprotection/APThreatLandscape.tsx` (interactive SVG + steps)
- `src/components/strategies/assetprotection/APProtectionVehicles.tsx` (animated layers)
- `src/components/strategies/assetprotection/APComparison.tsx`
- `src/components/strategies/assetprotection/APIdealClient.tsx`
- `src/components/strategies/assetprotection/APCTA.tsx`

### Modified Files
- `src/App.tsx` -- add routes `/:lang/strategies/asset-protection` and `/:lang/estrategias/proteccion-de-activos`
- `src/i18n/translations/en.ts` -- add `strategies.assetProtection` block
- `src/i18n/translations/es.ts` -- add `strategies.assetProtection` block

### Reused Components
- MorphingBlob, GlassCard, StatBadge, TrustBadge, ProcessStep, StrategyComparisonTable, StrategyFormCTA

### SEO and Schemas
- WebPage, Article, BreadcrumbList, Organization, SpeakableSpecification JSON-LD
- Hreflang tags (en, es, x-default)
- Open Graph + Twitter Card meta
- Canonical URL

### Interactive Element: Threat Landscape Visualization
- SVG with concentric rings representing 5 threat categories
- Hover/click highlights a ring and displays cost data (e.g., "Average lawsuit: $54K", "Estate tax: 40% over $13.6M")
- Central node pulses with gold glow when a ring is selected
- Framer Motion entrance animations

### Design
- All rounded corners (xl, 2xl, full) per brand standard
- Same glassmorphism, Framer Motion animations, and color palette (Evergreen, Gold, Cream)
- No new dependencies needed

