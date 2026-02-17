
# Reimagine Privacy Policy Page -- Premium Editorial Experience

## Problem
The current privacy policy is a plain dark page with basic alternating icon/text rows. It feels generic and disconnected from the bold, tactical aesthetic of the Everence Wealth homepage.

## New Design Concept: "Magazine-Style Editorial Layout"

Instead of a boring scrolling list, the page will feel like opening a premium financial magazine -- using the same Evergreen (#1A4D3E), Gold (#C5A059), and White palette with glassmorphic cards, staggered grid layouts, and scroll-triggered animations.

### Layout Structure

1. **Full-viewport Hero** -- Deep evergreen background with mesh gradient blobs (matching homepage). Large bold "YOUR PRIVACY" headline in the homepage's uppercase tactical font style. A gold horizontal rule and subtitle. The Everence Wealth logo sits in a fixed top bar with a "Back to Home" link.

2. **Bento Grid Sections** -- Instead of boring vertical rows, the 6 privacy sections are arranged in a responsive bento-style grid (2-column on desktop, single on mobile). Each card is a glassmorphic panel (`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl`) with:
   - A large gold icon in the top-left
   - Bold white section title
   - Body text in muted white
   - Hover effect: subtle border glow with gold accent and slight scale-up

3. **Scroll Progress Bar** -- A thin gold horizontal progress indicator at the very top of the viewport (matching the homepage's scroll-progress pattern).

4. **Animated Number Badges** -- Each section card gets a large, faded "01" through "06" watermark number in the background for visual hierarchy.

5. **Footer CTA** -- A glassmorphic card at the bottom with the "Contact Us" email, styled as a magnetic-hover gold button (consistent with homepage CTAs).

6. **Bottom Bar** -- Copyright, Privacy, Terms, Disclosures links.

### Key Visual Differences from Current
- White on deep evergreen (not dark navy)
- Bento grid cards instead of alternating rows
- Mesh gradient blobs instead of flat dark background
- Bold uppercase tactical typography (matching homepage `font-hero` if available, else `font-bold tracking-wider uppercase`)
- Gold accents on hover states and decorative elements
- No floating particles (cleaner, more editorial)
- Scroll-triggered stagger animations via framer-motion `whileInView`

### Content
All 6 sections keep the same Everence Wealth financial advisory text (already correct from previous rewrite). No content changes needed.

## Technical Details

**File changed:** `src/pages/PrivacyPolicy.tsx` (full rewrite)

- Replace the entire component with the new bento-grid editorial layout
- Use `framer-motion` for scroll-triggered card reveals (staggered `whileInView`)
- Use `useScroll` + `useTransform` for the gold scroll-progress bar at top
- Mesh gradient background divs matching the homepage's `radial-gradient` + `blur(80px)` pattern
- Glassmorphic card styling: `bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl`
- Gold (#C5A059) for icons, progress bar, hover borders, CTA button
- Evergreen (#1A4D3E) for background tones and gradient accents
- White for headlines, muted white (white/60, white/40) for body text
- Responsive: 2-column bento grid on `lg:`, single column on mobile
- Keep the same header (logo + back link) and footer (copyright + links)
