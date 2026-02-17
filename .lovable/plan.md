
# Phase 1: Philosophy Page -- Core Build

## Overview
Create a dedicated Philosophy page at `/:lang/philosophy` (and `/es/filosofia` alias) with hero, 4 key content sections, full SEO/structured data, and i18n support. This establishes the page skeleton; 3D elements and remaining sections come in Phase 2.

## What Gets Built

### 1. Page Component: `src/pages/Philosophy.tsx`
- Uses Header + Footer layout (same as Home, About, etc.)
- Reads `lang` from URL params
- Renders Helmet with full SEO meta tags, Open Graph, Twitter Card, hreflang, and JSON-LD schemas (WebPage, Organization, BreadcrumbList)
- Composes 5 section components below

### 2. Sections Built in Phase 1

**Hero Section** (`src/components/philosophy/PhilosophyHero.tsx`)
- Full viewport height, animated evergreen gradient background
- Floating geometric shapes (CSS-based in Phase 1, Three.js upgrade in Phase 2)
- Staggered text fade-in: badge, headline, paragraph, CTAs
- Scroll indicator at bottom
- Brand colors: `#1A4D3E` background, `#D4AF37` accent

**Three Silent Killers** (`src/components/philosophy/PhilosophyKillers.tsx`)
- Reuses the same content framework as the homepage SilentKillers but with expanded detail
- Three cards (Fees, Volatility, Taxes) with data visualizations using Recharts
- Scroll-triggered stagger animation

**Three Tax Buckets** (`src/components/philosophy/PhilosophyBuckets.tsx`)
- Three columns showing Taxable / Tax-Deferred / Tax-Free buckets
- Comparison table with pros/cons
- Highlighted "our recommendation" on Tax-Free bucket
- Animated on scroll with Framer Motion

**Cash Flow vs Net Worth** (`src/components/philosophy/PhilosophyCashFlow.tsx`)
- Side-by-side comparison (reuses the Golden Cage vs Cash Flow Mobility concept from WealthPhilosophy homepage section)
- Animated counter for key stats
- Visual bar chart comparing the two approaches

**CTA Section** (`src/components/philosophy/PhilosophyCTA.tsx`)
- "Schedule Your Strategy Session" with gold button
- Subtle gradient background
- Links to `/contact` or Calendly

### 3. i18n Translations
- Add `philosophy` key to both `src/i18n/translations/en.ts` and `src/i18n/translations/es.ts`
- Contains all section text: hero, killers, buckets, cashFlow, cta

### 4. Routing
- Add `/:lang/philosophy` route in `src/App.tsx` (in the language-prefixed public routes block)
- Add `/philosophy` legacy redirect to `/en/philosophy`
- Add `/es/filosofia` alias redirecting to `/es/philosophy` for the Spanish-friendly URL

### 5. SEO Implementation
- Helmet with meta title, description, canonical, hreflang (en + es + x-default)
- Open Graph and Twitter Card meta tags
- JSON-LD: WebPage, Organization (FinancialService), BreadcrumbList schemas
- Speakable CSS class on hero section

## Phase 2 (future message)
- 3D animated bucket models with React Three Fiber
- Interactive volatility vs floor protection 3D chart
- Remaining sections: Fiduciary Difference, Human Life Value, Living Benefits, Steven Rosenberg thought leader section
- GSAP scroll-driven parallax effects

## Technical Details

### New Files
- `src/pages/Philosophy.tsx` -- page component with SEO Helmet + section composition
- `src/components/philosophy/PhilosophyHero.tsx` -- hero with gradient + floating shapes + stagger animations
- `src/components/philosophy/PhilosophyKillers.tsx` -- 3 wealth destroyer cards with Recharts mini-charts
- `src/components/philosophy/PhilosophyBuckets.tsx` -- tax bucket comparison columns
- `src/components/philosophy/PhilosophyCashFlow.tsx` -- net worth vs cash flow side-by-side
- `src/components/philosophy/PhilosophyCTA.tsx` -- final CTA section

### Modified Files
- `src/App.tsx` -- add 3 routes (lazy import)
- `src/i18n/translations/en.ts` -- add `philosophy` translation block
- `src/i18n/translations/es.ts` -- add `philosophy` translation block

### Design System
- Background: `#F0F2F1` (cream) for light sections, `#1A4D3E` (evergreen) for dark sections
- Accent: `#D4AF37` (gold) used sparingly for highlights and CTAs
- Typography: existing `font-space` for headings, system sans for body
- Sharp edges per brand spec (no rounded corners on cards -- using `rounded-none` or minimal rounding)
- Spacing: 8px system (`p-2, p-4, p-6, p-8, p-12, p-16`)
- Animations: Framer Motion `whileInView` with `once: true`, stagger children pattern
