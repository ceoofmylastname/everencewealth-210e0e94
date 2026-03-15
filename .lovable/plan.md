

## Socorro ISD Landing Page — Modern Premium Redesign

The page currently works but feels flat and text-heavy. The reference image shows a cinematic, photo-backed editorial style. Here's a comprehensive upgrade across all sections to make it sleek, modern, and high-end.

---

### 1. Hero — Cinematic Split Layout
**File: `src/components/socorro/SocorroHero.tsx`**

- Convert from full-width text-only to a **split layout**: left side = headline + CTA, right side = a large lifestyle image masked with a soft organic blob/rounded clip-path (couples walking, retirement imagery)
- Add a **subtle noise/grain texture overlay** (CSS-only using SVG filter) for editorial depth
- Replace the dense body paragraphs with a single punchy 1-liner subheadline — move the longer copy to a dedicated section below
- Upgrade the badge to a **pill with a subtle gold border glow** and dot indicator
- Add a **gold horizontal accent line** that animates in below the headline
- Make the CTA button glow with a soft gold `box-shadow` pulse animation on idle

### 2. Social Proof — Modernize Stats Bar
**File: `src/components/socorro/SocialProof.tsx`**

- Wrap each stat in its own **glassmorphic pill card** with subtle gold top border
- Add small icons above each number (Shield, TrendingUp, Users from Lucide)
- Change font from Cormorant to **Clash Display** for the numbers to match headline energy
- Add a subtle **gradient divider** between dark hero and this section

### 3. Curiosity Cards — Editorial Upgrade
**File: `src/components/socorro/CuriosityCards.tsx`**

- Replace emoji icons with **custom SVG icons** or Lucide icons in gold circles
- Add a **numbered label** (01, 02, 03) in the top-left corner of each card
- Upgrade cards to have a **subtle gold left border accent** instead of top border
- Add a **hover glow effect** — soft gold shadow that appears on hover
- Switch card body font from Cormorant to **Space Grotesk** for modernity

### 4. How It Works — Connected Timeline
**File: `src/components/socorro/HowItWorks.tsx`**

- Redesign from grid cards to a **vertical timeline layout** on mobile, horizontal on desktop
- Replace the plain connecting line with an **animated dotted line** that draws on scroll
- Upgrade number circles to have a **ring + glow** effect instead of solid fill
- Add a subtle **background pattern** (dot grid) for texture
- Icons get a **circular glass container** with gold border

### 5. Retirement Calculator — Premium Glass Treatment  
**File: `src/components/socorro/RetirementCalculator.tsx`**

- Add a **section headline with split layout**: text left, glass calculator card right
- Style the result area with a **pulsing gold border** when value updates
- Add a **comparison visualization**: two horizontal bars (with fees vs. without) that animate to show the gap
- Upgrade slider thumb styling with a **gold gradient thumb** and track

### 6. Trust Strip — Modern Logo Bar
**File: `src/components/socorro/TrustStrip.tsx`**

- Add a **section title upgrade** with a thin gold line on each side of the text
- Increase logo sizes slightly and add **hover: scale + color** transition

### 7. Final CTA — Full-Width Cinematic
**File: `src/components/socorro/SocorroFinalCTA.tsx`**

- Make it **full-bleed** with a subtle radial gradient from center
- Add **animated gold particles/sparkles** in the background (CSS-only)
- Upgrade the glass card to have a **conic-gradient rotating border** (matching the presentation slides pattern)
- Larger headline with more whitespace

### 8. Footer — Cleaner, More Structured
**File: `src/components/socorro/SocorroFooter.tsx`**

- Add a **3-column layout**: Brand + tagline | Quick links | Contact/social
- Add a subtle **gold gradient line** at the top as separator
- Upgrade brand name font to Clash Display

### 9. Navbar — Sticky Glass Upgrade
**File: `src/components/socorro/SocorroNavbar.tsx`**

- Add a **gold scroll progress bar** at the very top (2px)
- Upgrade brand font to **Clash Display**
- Add a subtle **glow** around the CTA button

### 10. CSS Enhancements
**File: `src/styles/socorro.css`**

- Add new keyframes: `socorro-glow-pulse`, `socorro-particle-float`, `socorro-border-rotate`
- Add utility classes: `.socorro-noise-overlay`, `.socorro-gold-glow`, `.socorro-dot-grid`
- Add slider styling overrides for gold-themed thumb/track
- Add conic-gradient rotating border utility

### Files Modified
- `src/components/socorro/SocorroHero.tsx` — split layout, image, simplified copy
- `src/components/socorro/SocialProof.tsx` — pill cards, icons, font upgrade
- `src/components/socorro/CuriosityCards.tsx` — numbered cards, icons, hover glow
- `src/components/socorro/HowItWorks.tsx` — timeline layout, animated line
- `src/components/socorro/RetirementCalculator.tsx` — split layout, comparison bars
- `src/components/socorro/TrustStrip.tsx` — title lines, sizing
- `src/components/socorro/SocorroFinalCTA.tsx` — full-bleed, rotating border, particles
- `src/components/socorro/SocorroFooter.tsx` — 3-column, gold separator
- `src/components/socorro/SocorroNavbar.tsx` — progress bar, font, glow
- `src/styles/socorro.css` — new keyframes, utilities, slider styles

