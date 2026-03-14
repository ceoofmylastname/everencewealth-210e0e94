

## Plan: Redesign Slide 12 — Loss Impact (Modern, Staggered Reveals, 3D)

Completely redesign the Loss Impact slide with sequential click-triggered reveals, modern 3D glassmorphism cards, and a more dramatic presentation flow.

### Reveal Flow (6 reveals total)

1. **Reveal 1** — Headline only: "Traditional Approach to *Investing*" with subtitle
2. **Reveal 2** — First loss scenario: $100k → -25% → $75k with "+33% needed to recover"
3. **Reveal 3** — Second loss scenario: $100k → -33% → $67k with "+50% needed"
4. **Reveal 4** — Third (danger) scenario: $100k → -50% → $50k with "+100% needed"
5. **Reveal 5** — Gold divider wipe
6. **Reveal 6** — Bottom dark card: "100% gains take years..."

### Visual Upgrades

Each loss scenario becomes a **3D glassmorphism card** instead of flat colored circles:
- Frosted glass background with `backdrop-filter: blur(16px)`, semi-transparent borders
- 3D perspective hover tilt effect (CSS `perspective: 800px`, `rotateX`/`rotateY` on hover)
- Large animated counter-style numbers with the starting amount at top
- Red loss percentage with a downward arrow icon
- Result amount below
- Recovery text as a subtle pill badge beneath the card
- Progressive danger coloring: card 1 has gold-green accent border, card 2 has amber, card 3 has red glow/border
- Each card uses `cardRise` or `explode` animation direction for dramatic entry

### Changes

**1. `src/components/presentation/slides/Slide12_LossImpact.tsx`** — Full rewrite:
- Each bubble becomes its own `RevealElement` (indexes 2, 3, 4) instead of all appearing at once
- Replace circle bubbles with tall glassmorphism cards featuring 3D hover transforms
- Add subtle radial gradient backgrounds behind each card for depth
- Use `TrendingDown` icon from lucide-react for visual impact
- The danger card (50% loss) gets a pulsing red border glow

**2. `src/components/presentation/PresentationViewer.tsx`** — Update `SLIDE_CONFIGS`:
- Change Slide 12 totalReveals from `4` to `6`

