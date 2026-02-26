

## Redesign: Portal Onboarding Tour — Modern, Creative, Design-First

### Problems with current design
- Basic white card with flat layout — looks like a generic tooltip
- Bulky icon grid takes up space without adding visual impact
- Simple dots stepper feels dated
- No visual connection (arrow/line) between the spotlight and the tooltip
- Static, boxy feel — no personality or delight

### New design concept: **"Floating Command Card" with SVG connector arrow**

A sleek, glassmorphic card connected to the spotlight via an animated SVG curved arrow. Minimal text, bold typography, cinematic micro-animations.

#### Visual language
- **Glassmorphism card**: `backdrop-blur-xl bg-white/90 border border-white/20` with a subtle gold gradient top-edge accent line
- **SVG curved arrow**: An animated bezier path drawn from spotlight edge to card, using `stroke-dasharray` animation (draws itself on each step transition) in brand gold
- **Step counter**: Large bold `01` / `05` typography instead of dots — split number with gold active digit + muted total
- **Compact icon strip**: Tiny pill badges in a single horizontal row, no borders — just icon + label in muted tones
- **Progress bar**: Thin gold gradient line at bottom of card that fills per step (not dots)
- **Spotlight**: Replace rectangular cutout with a **rounded-2xl** cutout with animated gold gradient border (matches portal design system)
- **Entry animation**: Card slides in from the side with spring physics + the SVG arrow draws itself

#### Card layout (top to bottom)
1. **Gold accent line** — 2px gradient bar at card top
2. **Step number + group label** — `01` large bold | "Portal" small caps
3. **Title** — Bold serif, brand green, 18px
4. **Description** — 1-2 lines max, trim current verbose text
5. **Icon strip** — Compact horizontal pills
6. **Bottom bar** — Progress fill line + Skip / Next button (pill-shaped, gold gradient on last step)

#### SVG Arrow connector
- Compute bezier control points from spotlight rect center-right to card left edge
- Animate `stroke-dashoffset` from full to 0 on each step
- Arrow tip at card end
- Gold color with slight glow filter

#### Shorter copy per step
- Portal: "Your operations hub — clients, policies, coverage needs & messaging."
- Market: "Carrier intel, industry news & performance tracking."
- Resources: "Tools, training, marketing & scheduling."
- Contracting: "Agent onboarding pipeline, files & analytics."
- Compliance: "Licensing, documents & account settings."

### Implementation steps

1. **Rewrite `PortalOnboardingTour.tsx`** — New glassmorphic card component with SVG arrow connector, rounded spotlight cutout, progress bar, trimmed copy, spring animations
2. **Update spotlight rendering** — Use `border-radius` in clip-path (switch to SVG mask or inset with round) for rounded-2xl cutout, gold animated border
3. **Add SVG arrow component** — Compute path from rect edge to tooltip position, animate stroke-dashoffset on step change
4. **Responsive handling** — On mobile, arrow hidden, card renders as bottom sheet with swipe-to-dismiss feel

No database or schema changes needed. Single file modification.

