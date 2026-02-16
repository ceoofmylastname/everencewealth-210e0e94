

# Replace Footer with Interactive Hover Footer

## Overview
Replace the current `src/components/home/Footer.tsx` with a new interactive hover footer featuring an SVG text hover effect ("EVERENCE") and the site's dark evergreen/gold brand styling. This involves creating a new UI component and rewriting the footer.

## What Changes

### 1. New file: `src/components/ui/hover-footer.tsx`
Create the `TextHoverEffect` and `FooterBackgroundGradient` components:
- Port the provided code, changing `import { motion } from "motion/react"` to `import { motion } from "framer-motion"` (project standard)
- `TextHoverEffect`: SVG-based text with mouse-tracking radial gradient reveal -- on hover, a gradient mask follows the cursor revealing colorful text beneath a neutral outline
- `FooterBackgroundGradient`: Decorative gradient overlay using brand colors (`#1A4D3E` evergreen, `#C5A059` gold) instead of the generic ones in the demo
- Brand the gradient stops: replace generic greens/blues with evergreen tones and gold accents

### 2. Rewrite: `src/components/home/Footer.tsx`
Replace the current static footer with the hover footer layout from the demo, adapted for the brand:
- **Background**: Dark `bg-neutral-950` with the `FooterBackgroundGradient` overlay
- **Grid layout**: 5-column grid (Brand, Company, Strategies, Resources, Get Started) matching current link structure
- **Links**: Use `react-router-dom` `Link` components with language prefix (`/{lang}/...`) instead of plain `<a>` tags, preserving existing routes
- **Brand section**: Logo image (existing URL), tagline, and address with `Shield` icon and evergreen accent
- **Colors**: Link hover color changed to `text-prime-gold` (gold `#C5A059`) instead of `text-[#1A4D3E]` -- on dark background, gold hover is more visible
- **"Schedule Assessment" button**: Styled with `bg-evergreen` and `hover:bg-prime-gold` for brand consistency
- **Social links**: LinkedIn, Twitter, YouTube icons with gold hover states
- **Bottom bar**: Copyright, legal links (Privacy, Terms, Disclosures), and social icons
- **TextHoverEffect**: Large "EVERENCE" text with mouse-tracking gradient reveal at the bottom, using brand gradient colors (evergreen-to-gold spectrum)
- **Pulse indicator**: Keep the animated pulse dot on "Retirement Gap Calculator" link from the demo

### 3. No changes to:
- Any pages importing the Footer (they all import `{ Footer } from '@/components/home/Footer'`)
- `tailwind.config.ts` (brand colors already defined)
- `framer-motion` (already installed)

## Technical Details

### Import fix
The provided code uses `from "motion/react"` which is the Motion v11+ import path. This project uses `framer-motion`, so all imports will use `from "framer-motion"`.

### Brand color mapping (demo to site)
| Demo | Site |
|---|---|
| `text-[#1A4D3E]` hover links | `text-prime-gold` hover (better contrast on dark bg) |
| `bg-[#1A4D3E]` button | `bg-evergreen` button |
| Generic gradient blobs | Evergreen (`#1A4D3E`) and gold (`#C5A059`) tinted blobs |
| Shield icon in brand green | Shield icon in `text-prime-gold` |

### SVG TextHoverEffect gradient
The reveal gradient will use:
- Stop 1: `#C5A059` (gold)
- Stop 2: `#1A4D3E` (evergreen) 
- Stop 3: `#E5C687` (light gold)
- Stop 4: `#0f172a` (prime-900)
- Stop 5: `#C5A059` (gold)

This creates an evergreen-gold shimmer when hovering over "EVERENCE".

### Responsive behavior
- On mobile: columns stack vertically, text effect scales down
- Footer maintains full-width dark background with gradient overlay at all breakpoints
