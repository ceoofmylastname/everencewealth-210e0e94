

## Redesign Step 1: Premium Agent Selector

### Concept
Replace the plain scrollable list with a **search-first card grid** that feels like selecting a profile on a premium platform. Think Netflix profile selection meets luxury fintech.

### Design

**Layout:**
- Search bar stays at top with a subtle glow effect on focus
- Agents displayed as a **responsive grid of cards** (2 columns on mobile, 3 on desktop)
- Each card is a **square-ish tile** with:
  - Large circular avatar with initials (gradient background per agent using name hash)
  - Agent name below in bold
  - Subtle hover: 3D tilt lift effect + gold border glow
  - Selected state: gold ring around avatar, checkmark badge overlay, card background glow
- Cards animate in with staggered scale-up (spring physics)
- Max height container with smooth scroll, visible on all devices

**Visual details:**
- Each agent gets a unique gradient on their avatar circle (derived from their name, cycling through a palette of rich greens, deep teals, warm golds, slate blues)
- On hover (desktop): card lifts with `translateY(-4px)` and a warm gold shadow
- On tap/select: gold ring pulses once, checkmark appears top-right corner of card
- Selected confirmation bar below the grid stays (with the current gold accent style)
- Search input gets a subtle gold underline glow on focus

**Mobile reliability:**
- Grid uses CSS Grid (`grid-cols-2`) — no absolute positioning, no overlays, no popups
- Container: `max-h-[50vh] overflow-y-auto overscroll-contain` with `touch-action: pan-y`
- Same `agent-picker-scroll` class for visible scrollbar
- All items render inline — no clipping possible

### File
- `src/pages/ResponseCard.tsx` — rewrite case 0 section (~60 lines replaced)

### Technical notes
- Avatar gradient colors generated from a small deterministic palette using `(firstName.charCodeAt(0) + lastName.charCodeAt(0)) % paletteLength`
- Framer Motion `whileHover` and `whileTap` for interactive feel
- No new dependencies needed

