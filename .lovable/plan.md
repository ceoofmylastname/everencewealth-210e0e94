

# Phase 9.9 -- Visual Redesign: Apply Uploaded Reference Components

## Overview
Replace 8 existing homepage components with the bold, editorial-style designs from the uploaded reference files. This is a major visual overhaul that shifts from the current conservative aesthetic (light backgrounds, serif headers, standard cards) to an aggressive, institutional design language (dark backgrounds, Space Grotesk typography, glass morphism, oversized type, editorial side-text).

## What Changes

### New Font: Space Grotesk
The reference files use `font-space` extensively. We need to add Space Grotesk to the project.

**index.html**: Add Google Fonts import for Space Grotesk (alongside existing Sora/Outfit/Playfair).

**tailwind.config.ts**: Add `space: ['Space Grotesk', 'sans-serif']` to `fontFamily`.

### New CSS Utilities
The reference files use several CSS classes not yet in the project:

**src/index.css** -- add:
- `.glass` utility (similar to `.glass-card` but without border): `backdrop-filter: blur(16px); background: hsla(0, 0%, 100%, 0.03);`
- `.text-outline` class: `-webkit-text-stroke: 1px rgba(255,255,255,0.15); color: transparent;`
- `.hero-glow` text shadow effect
- `.animate-text-gradient` keyframe for the gradient text animation on "RETIREMENT"
- `.scroll-reveal` base class (CSS fallback for JS-driven reveals): `opacity: 0; transform: translateY(40px); transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);`

### New Tailwind Colors
**tailwind.config.ts** -- add:
- `slate: '#4A5565'` (used as text color in reference)
- `light-gray: '#F5F5F0'` (used as section backgrounds)

### Component Replacements (8 files)

**1. Hero** (`src/components/home/sections/Hero.tsx`)
- Replace the current gradient-bg hero with the uploaded editorial design
- Full-viewport height with parallax scroll effect
- Stacked typography: "BRIDGE the RETIREMENT GAP" in oversized vw-based font sizes
- Gradient text animation on "RETIREMENT"
- Outline text effect on "GAP"
- Decorative side text (WEALTH ARCHITECTURE / STRATEGIC FIDUCIARY) on xl screens
- Bottom "Tactical HUD" glass panel with system status + CTA button
- Staggered entrance animations via `isLoaded` state
- Remove `useTranslation`, `useNavigate`, `Button` imports
- Keep as named export `Hero`

**2. Header/Navbar** (`src/components/home/Header.tsx`)
- Add scroll progress bar (2px height, evergreen color with glow shadow)
- Update text styling: nav links become `text-[10px] font-black uppercase tracking-[0.3em]`
- Logo text: "EVERENCE" + green "WEALTH" using font-space
- Update CTA button styling: `bg-evergreen text-white rounded-xl`
- Mobile menu: full-screen overlay with large font-space text
- Keep existing dropdown menu structure (Strategies, Education, About) but adapt styling
- Keep react-router `Link` usage (not plain `a` tags)

**3. WakeUpCall** (`src/components/homepage/WakeUpCall.tsx`)
- Switch from dark evergreen bg to white bg with evergreen text
- Add AlertCircle icon with red-50 badge
- Oversized font-space heading: "Your Retirement Account Has a Silent Partner: The IRS"
- Two-column layout: left = copy + evergreen quote card (rounded-[40px]), right = tax trap list + 80-90% stat + CTA button
- Replace framer-motion with `scroll-reveal` CSS classes
- Remove `useAnimatedCounter` stat cards

**4. SilentKillers** (`src/components/homepage/SilentKillers.tsx`)
- Switch from light slate-50 bg to `bg-evergreen text-white`
- Add background radial gradient texture
- Oversized font-space heading with `text-outline` on "Attack."
- Card design: glass morphism cards with rounded-[60px], large ID numbers (01/02/03) as watermarks
- Bottom: massive "RECLAIM CONTROL" watermark text + white CTA button
- Replace inline SVG visuals with simpler icon-based cards
- Remove FeesVisual/VolatilityVisual/TaxesVisual sub-components

**5. TaxBuckets** (`src/components/homepage/TaxBuckets.tsx`)
- Switch from cream bg to dark `bg-[#020806] text-white`
- Add decorative blur gradients in corners
- Oversized heading with `text-outline` on "Tax Buckets"
- Cards: glass-card morphism with rounded-[50px], colored accent icons
- Tax-Free bucket gets `lg:scale-105` highlight with "Strategic Priority" badge
- Bottom: italic quote + bordered CTA button
- Replace color-coded light cards with dark glass cards

**6. IndexedAdvantage** (`src/components/homepage/IndexedAdvantage.tsx`)
- Switch to `bg-white text-evergreen`
- Remove recharts AreaChart, replace with a styled comparison table inside an evergreen rounded-[50px] card
- Performance comparison: S&P 500 vs IUL showing +30%, -40%(2008), +25%, -20% vs capped/floored returns
- "Who This Is For" section with 4 audience types in a grid
- Large CTA: "Model Your Indexed Strategy"
- Remove `ChartContainer` and recharts imports

**7. WealthPhilosophy** (`src/components/homepage/WealthPhilosophy.tsx`)
- Switch from cream bg to dark `bg-[#020806] text-white`
- Add background image layer (Unsplash architecture photo at 4% opacity)
- Two major sub-sections: Cash Flow comparison + Human Life Value
- Cash Flow: "Net Worth Is Vanity" heading with gradient text, side-by-side glass cards (Golden Cage vs Cash Flow Mobility)
- Human Life Value: "You Are Your Greatest Asset" with income valuation calculator card (white bg, evergreen text)
- Living Benefits grid with glass icon cards
- Remove simple Traditional vs Everence comparison and Buffett quote

**8. TheGap** (`src/components/homepage/TheGap.tsx`)
- Switch from dark bg to `bg-light-gray` (light)
- Three gap cards (Savings, Income, Tax) with white bg, rounded-[40px], hover shadow
- Each card: icon, title, description, red stat number
- Bottom: "The Bridge Strategy" section in evergreen rounded-[60px] card with 5-step grid
- CTA: "Bridge Your Retirement Gap" white button
- Remove bar chart visualization

**9. Services** (NEW: `src/components/homepage/Services.tsx`)
- New section from uploaded reference
- Three service cards: Retirement Planning, Wealth Protection, Legacy Planning
- White bg, bordered cards with rounded-[30px], hover lift effect
- Icon badges that change color on hover (bg-evergreen + white icon)
- Bullet points with evergreen dots
- "Learn More" links with chevron

**10. Stats** (`src/components/homepage/Stats.tsx`)
- Switch from dark bg to white bg
- Replace glass-card container with simple divided grid
- Larger counter text: `text-5xl md:text-7xl font-space font-bold text-evergreen`
- Different metrics: $500M+ AUM, 98% Satisfaction, 25+ Years, 75+ Carriers
- Use built-in IntersectionObserver counter instead of `useAnimatedCounter` hook

### Updated Home.tsx Section Order
```
Header
CursorGlow
Hero
WakeUpCall
SilentKillers
TaxBuckets
IndexedAdvantage
WealthPhilosophy
FiduciaryDifference (KEEP as-is)
TheGap
Services (NEW)
HomepageAbout (KEEP as-is)
Stats
Assessment (KEEP as-is)
FAQ (KEEP as-is)
CTA (KEEP as-is)
Footer
```

---

## Technical Details

### Files Created (1):
- `src/components/homepage/Services.tsx`

### Files Modified (11):
- `src/components/home/sections/Hero.tsx` -- full rewrite to editorial design
- `src/components/home/Header.tsx` -- add scroll progress bar, update typography
- `src/components/homepage/WakeUpCall.tsx` -- full rewrite to white/editorial layout
- `src/components/homepage/SilentKillers.tsx` -- full rewrite to dark glass cards
- `src/components/homepage/TaxBuckets.tsx` -- full rewrite to dark glass cards
- `src/components/homepage/IndexedAdvantage.tsx` -- remove recharts, add comparison table
- `src/components/homepage/WealthPhilosophy.tsx` -- full rewrite with two sub-sections
- `src/components/homepage/TheGap.tsx` -- rewrite to light 3-card + bridge strategy
- `src/components/homepage/Stats.tsx` -- switch to white bg, new metrics
- `src/pages/Home.tsx` -- add Services import, update section order
- `tailwind.config.ts` -- add Space Grotesk font, slate/light-gray colors
- `index.html` -- add Space Grotesk font import
- `src/index.css` -- add glass, text-outline, hero-glow, scroll-reveal, animate-text-gradient utilities

### Dependencies: No new npm packages. Space Grotesk loaded via Google Fonts CDN.

### No database, edge function, or RLS changes required.

