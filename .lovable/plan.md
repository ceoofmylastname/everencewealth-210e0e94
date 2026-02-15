

# Phase 9.2 + 9.3 -- Hero Section Update and Navbar Update

## Overview
Two changes in one phase:
1. **Hero**: Replace the current property-search-oriented hero with a wealth management hero featuring a dark gradient background, new copy, two CTAs, and three trust badges.
2. **Navbar**: Replace all Costa del Sol navigation items with Everence Wealth menu structure (Philosophy, Strategies, Education, About, Get Started, Portal Login).

---

## 9.2 -- Hero Section Update

### File: `src/components/home/sections/Hero.tsx` (rewrite)

**Remove:**
- Video background and poster image (Unsplash photo)
- `videoRef`, `videoLoaded` state, video load timeout effect
- Old trust badge content (API, Experience, Buyers references from translations)
- Old CTA buttons pointing to properties and Emma chat

**New Background:**
- Dark gradient: `bg-gradient-to-br from-[#1A4D3E] via-[#0F2E25] to-black`
- Subtle animated mesh gradient overlay using CSS radial gradients with a slow animation (keyframe-based opacity/position shift)
- Remove the `<video>` and `<img>` elements entirely

**New Content:**
- Headline: "Bridge the Retirement Gap" (serif, white, large)
- Subhead: "Tax-efficient wealth strategies. Fiduciary guidance. Zero Wall Street games." (white/90, lighter weight)
- Two CTAs using existing `Button` component:
  - Primary: "Schedule Assessment" -- navigates to `/{lang}/contact`
  - Secondary (outline): "Our Philosophy" -- navigates to `/{lang}/philosophy`
- Three trust badges below CTAs (same pill style, updated content):
  - ShieldCheck icon: "Independent Fiduciary"
  - Users icon: "75+ Carriers"
  - Calendar icon: "Since 1998"

**Simplified state:** Remove `scrollY`, `videoLoaded`, `videoRef`. Keep `useNavigate` and `useTranslation`. Add `Calendar` to lucide imports.

---

## 9.3 -- Navbar Update

### File: `src/components/home/Header.tsx` (rewrite menu structure)

**Remove:**
- `featuredCities` array and all Supabase storage URL references
- "Explore" menu with city brochures, property finder, location guides
- "Compare" menu with comparison index, city vs city
- "Learn" menu items: Property Glossary, Buyer's Guide
- Old icon imports no longer needed: `Home`, `Landmark`, `GitCompare`, `Scale`, `MapPin`

**New Desktop Menu Structure (inside `<Menu>`):**

1. **Philosophy** -- simple link (no dropdown), navigates to `/{lang}/philosophy`
2. **Strategies** dropdown:
   - Indexed Universal Life -- `/{lang}/strategies/iul`
   - Whole Life -- `/{lang}/strategies/whole-life`
   - Tax-Free Retirement -- `/{lang}/strategies/tax-free-retirement`
   - Asset Protection -- `/{lang}/strategies/asset-protection`
3. **Education** dropdown:
   - Blog -- `/{lang}/blog`
   - Q&A -- `/{lang}/qa`
   - Financial Terms -- `/{lang}/glossary`
4. **About** dropdown:
   - Our Team -- `/{lang}/team`
   - Why Fiduciary -- `/{lang}/about`
   - Client Stories -- `/{lang}/client-stories`

**Right side actions:**
- Language switcher (EN | ES) -- keep existing `LanguageSwitcher` component
- "Get Started" button -- navigates to `/{lang}/contact` (replaces "Chat with Emma")
- "Portal Login" link/button -- navigates to `/portal/login`

**New Mobile Menu Structure:**
Mirror the desktop structure with four collapsible sections:
1. Philosophy (direct link, no submenu)
2. Strategies (4 items)
3. Education (3 items)
4. About (3 items)
Bottom: Language switcher + "Get Started" button + "Portal Login" link

**New icon imports:** `Shield`, `TrendingUp`, `Umbrella`, `Lock` (for strategy items). Remove unused icons.

### Files Modified
- `src/components/home/sections/Hero.tsx` -- full rewrite
- `src/components/home/Header.tsx` -- menu structure rewrite

### No database, edge function, or translation changes required
Hardcoded English strings with fallback pattern (matching existing convention).

