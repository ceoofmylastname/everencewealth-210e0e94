

## Redesign "Three Silent Killers" Section

Elevate the current section with richer animations, glassmorphism, depth, and a more cinematic feel -- matching the brand's tactical institutional aesthetic.

### What Changes

**File: `src/components/homepage/SilentKillers.tsx`**

#### Cards
- Replace flat `glass-card rounded-[60px]` with a deeper glassmorphic style: `bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]`
- Add a subtle inner glow gradient at the top of each card using a pseudo-element (`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent`)
- On hover: card lifts (`y: -8`), border brightens (`border-white/15`), and a soft emerald glow appears behind the card via framer-motion `whileHover`
- The big ghost number (01, 02, 03) gets slightly brighter on hover (`text-white/[0.06]`)

#### Icon Container
- Change from `bg-white/10 rounded-2xl` to a gradient ring: `bg-gradient-to-br from-white/15 to-white/5 rounded-2xl ring-1 ring-white/10`
- Add a subtle pulse animation on the icon when the card enters viewport

#### Headline Area
- Add a thin horizontal gold accent line (`w-16 h-[2px] bg-gradient-to-r from-[#C5A059] to-transparent`) above the badge text
- The "Attack." outline text gets a shimmer animation using a background-clip text gradient that translates on loop

#### Watermark + CTA
- The "RECLAIM CONTROL" watermark gets a slow horizontal drift animation (translateX oscillation)
- The CTA button gets a gold gradient border on hover with a smooth transition, plus a subtle arrow icon that slides in from the left on hover

#### Background
- Add floating particle dots (3-4 small circles) that drift slowly using framer-motion infinite animations, colored emerald/gold at very low opacity
- Add a subtle noise/grain texture overlay at 2-3% opacity for depth

#### Stagger Timing
- Increase stagger delay from 0.15s to 0.2s for more dramatic reveal
- Cards enter with a slight scale-up (`scale: 0.95 -> 1`) in addition to the existing `y` translation

### Technical Details

All changes are contained in a single file: `src/components/homepage/SilentKillers.tsx`. The existing `glass-card` CSS class will be replaced with inline Tailwind utilities for more granular control. Framer-motion (already imported) handles all animations. No new dependencies needed.

| Element | Current | New |
|---|---|---|
| Card shape | `rounded-[60px]` flat glass | `rounded-3xl` deep glassmorphism with hover lift + glow |
| Icon box | Plain `bg-white/10` | Gradient ring with pulse |
| Headline accent | None | Gold gradient bar |
| "Attack." text | Static outline | Shimmer animation |
| Watermark | Static | Slow horizontal drift |
| CTA button | Plain white fill | Gold border hover + slide-in arrow |
| Background | Two radial gradients | + floating particles + grain overlay |
| Card entry | Fade + translateY | Fade + translateY + scale |

