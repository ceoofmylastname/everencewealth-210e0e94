

# Redesign About Section Pages to Match Homepage Premium Style

## What We're Building
Three pages under the "About" navigation dropdown, all redesigned with the same cinematic hero reveal, rounded-corner glassmorphism, and Framer Motion animations used on the homepage and strategy pages.

1. **About Us / Why Fiduciary** (`/:lang/about`) -- full redesign of existing page
2. **Our Team** (`/:lang/team`) -- full redesign of existing page
3. **Client Stories** (`/:lang/client-stories`) -- brand new page (currently missing, navbar link is dead)

---

## Page 1: About Us / Why Fiduciary (Redesign)

### Current State
The existing About page uses an older `prime-900` gradient hero that doesn't match the dark `hsl(160,48%,...)` cinematic style of the homepage and strategy pages.

### What Changes
- **New Hero**: Replace `AboutHero` with a cinematic hero matching the strategy page pattern -- dark evergreen gradient background, MorphingBlob decorations, gold line + badge + large bold headline + subtitle, StatBadges, scroll indicator, rounded corners
- **Modernize all sections**: Update `MissionStatement`, `FounderProfiles`, `Credentials`, `AboutFAQ`, `AboutCTA` with glassmorphism cards, rounded-2xl corners, Framer Motion scroll-triggered animations
- **Page wrapper**: Add the rounded-section spacing layout from `Home.tsx` (`mx-2 md:mx-4 lg:mx-6 space-y-4 rounded-3xl overflow-hidden`)

### Components Modified
- `src/components/about/AboutHero.tsx` -- rewrite with cinematic hero pattern
- `src/components/about/MissionStatement.tsx` -- glassmorphic card treatment
- `src/components/about/FounderProfiles.tsx` -- modern card grid
- `src/components/about/Credentials.tsx` -- glassmorphic badges
- `src/components/about/AboutFAQ.tsx` -- modern accordion style
- `src/components/about/AboutCTA.tsx` -- match strategy CTA style
- `src/pages/About.tsx` -- add rounded-section layout wrapper

---

## Page 2: Our Team (Redesign)

### Current State
The Team page has a basic gradient hero and plain card grid. It works but doesn't match the premium homepage feel.

### What Changes
- **New Hero**: Replace `TeamHero` with the cinematic hero pattern (dark background, MorphingBlob, gold line, badge, large headline, StatBadges for "75+ Years Combined", "50 States", "1,200+ Families")
- **Modernize Grid**: Update `TeamGrid` with glassmorphic member cards, hover tilt effects, rounded-2xl corners
- **Update TeamMemberCard**: Add glassmorphism overlay, modern rounded styling
- **Page wrapper**: Add rounded-section spacing

### Components Modified
- `src/components/team/TeamHero.tsx` -- rewrite with cinematic hero
- `src/components/team/TeamGrid.tsx` -- modern spacing and layout
- `src/components/team/TeamMemberCard.tsx` -- glassmorphic card
- `src/pages/Team.tsx` -- add rounded-section layout wrapper

---

## Page 3: Client Stories (New Page)

### What We're Building
A brand new page showcasing client success stories / testimonials with the premium design system.

### Sections
1. **Cinematic Hero** -- "Real Stories. Real Results." headline with StatBadges ("98% Satisfaction", "$2.4B+ Protected", "1,200+ Families")
2. **Featured Story** -- large glassmorphic card with a highlighted client testimonial, before/after financial outcome
3. **Stories Grid** -- 6 client story cards with glassmorphism, each showing client type (Business Owner, Physician, etc.), challenge, outcome, and a quote
4. **By The Numbers** -- animated counter stats section (similar to HomepageAbout's FactCounter)
5. **CTA** -- "Start Your Success Story" lead capture using the strategy CTA pattern

### New Files
- `src/pages/ClientStories.tsx` -- page component
- `src/components/client-stories/CSHero.tsx`
- `src/components/client-stories/CSFeaturedStory.tsx`
- `src/components/client-stories/CSStoriesGrid.tsx`
- `src/components/client-stories/CSStats.tsx`
- `src/components/client-stories/CSCTA.tsx`

### Route Addition
- `src/App.tsx` -- add `/:lang/client-stories` and `/:lang/historias-de-clientes` routes

---

## Translations

### Modified Files
- `src/i18n/translations/en.ts` -- add `clientStories` block with all section content
- `src/i18n/translations/es.ts` -- add `clientStories` block in Spanish

---

## Technical Details

### Design System (Consistent Across All 3 Pages)
- **Hero background**: `linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 60%, hsl(160,48%,5%) 100%)`
- **MorphingBlob** decorations in hero sections
- **Gold line + badge** reveal sequence with Framer Motion
- **StatBadge** shared component for hero metrics
- **Glass cards**: `bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl`
- **Font sizes**: `text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight` for hero headlines
- **Page wrapper**: `mx-2 md:mx-4 lg:mx-6 space-y-4 md:space-y-6 py-4 md:py-6` with `rounded-3xl overflow-hidden` sections
- **Color palette**: Evergreen (#1A4D3E), Gold (#D4AF37), Cream (#F0F2F1), white/opacity layers

### Shared Components Reused
- `MorphingBlob` from philosophy
- `StatBadge` from strategies/shared
- `GlassCard` pattern (inline styled)
- Header, Footer

### No New Dependencies Required

