

## Redesign Slide 01 Hero — Premium Cinematic Opening

The current hero slide is just a full-bleed beach photo with centered text. For a presentation opener, it needs to feel cinematic, editorial, and set the tone. Here's the redesign:

### Design Concept

A **split-composition** hero with the beach image on the right half (masked with a rounded clip), and the left side featuring a dark editorial layout with layered typographic reveals, floating gold particles, and a subtle animated border accent.

### Changes

**`src/components/presentation/slides/Slide01_Hero.tsx`** — Full rewrite:

- **Background**: Deep evergreen (`#0D1F1A`) base with a subtle radial gradient glow in gold
- **Left side** (60%): Stacked reveal content:
  - Reveal 1: Animated gold horizontal line + "EVERENCE WEALTH" eyebrow in Space Grotesk, letter-spaced
  - Reveal 2: "BRIDGING THE" in white, clean weight 300
  - Reveal 3: "RETIREMENT GAP" — "RETIREMENT" in bold white, "GAP" in animated gold gradient (GradientText), with a gold underline that wipes in
  - Reveal 4: Glassmorphic pill badge with "Retirement Planning Workshop" + a subtle floating particle field behind
- **Right side** (40%): The beach image in a tall rounded rectangle (`border-radius: 32px 80px 32px 80px` — organic asymmetric shape) with:
  - A 2px gold border accent at 20% opacity
  - A soft gold glow shadow behind the image
  - Subtle slow `scale(1.02)` breathing animation
- **Decorative elements**:
  - Two or three small floating gold dots/orbs that drift slowly (CSS animation)
  - A thin vertical gold line on the far left that draws downward on reveal 1

### Reveal Sequence (4 reveals, unchanged count)
1. Gold line + eyebrow text + image fades in
2. "BRIDGING THE" slams in
3. "RETIREMENT GAP" with gold gradient + underline
4. Badge pill drifts in + particles appear

### Files Modified
- `src/components/presentation/slides/Slide01_Hero.tsx` — full redesign with split layout, floating orbs, organic image mask

