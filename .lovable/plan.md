

## Redesign Slide 25 — "The Opportunity"

**Current state**: Basic layout with flat benefit rows (all revealed together at index 2), a simple CTA, and a BlobClip image. Lacks the glassmorphism, 3D tilt, and cinematic quality of other slides.

**Goal**: Match the premium aesthetic of Slides 18/23 — glassmorphism cards, 3D tilt interactions, individual click-to-reveal benefits, light sweep effects, and a generated cinematic team image.

### Changes

**1. Generate a new 4K team image via Nano Banana Pro**
- Prompt: Ultra-realistic 4K cinematic photo of a diverse professional team in a modern glass-walled office, golden hour lighting, warm tones, shallow depth of field
- Replace the existing `team-collaboration.jpg` asset

**2. Rewrite `Slide25_TheOpportunity.tsx`**
- **Reveal sequence** (update `totalReveals` from 4 to 7):
  - Index 1: Title + subtitle (slam)
  - Index 2: "Build a business on your own schedule" card (cardRise)
  - Index 3: "Help families protect their retirement" card (cardRise)
  - Index 4: "Uncapped earning potential" card (cardRise)
  - Index 5: "Full training and mentorship provided" card (cardRise)
  - Index 6: CTA button (explode)
  - Index 7: Right-side image (right)

- **Benefit cards**: Each gets a `TiltCard` wrapper (mouse-tracking `perspective(800px) rotateX/rotateY`), glassmorphism styling (`backdrop-filter: blur(16px)`, semi-transparent white bg, subtle borders), icon accent (using lucide icons: Calendar, Shield, TrendingUp, GraduationCap), floating number badge, and a diagonal light-sweep on reveal.

- **Layout**: Keep the split editorial layout (left content, right image). Left side: stacked benefit cards with staggered individual reveals. Right: BlobClip with the new cinematic image.

- **Styling**: Match `#FAFAF8` background, `rounded-3xl` cards, gold/evergreen accents, `var(--font-display)` headings.

**3. Update `PresentationViewer.tsx`**
- Change Slide 25 config from `{ totalReveals: 4 }` to `{ totalReveals: 7 }`.

### Files to modify
- `src/components/presentation/slides/Slide25_TheOpportunity.tsx` — full rewrite
- `src/components/presentation/PresentationViewer.tsx` — totalReveals update
- New asset generated via AI image model

