

## Plan

### 1. Fix Build Error in `SocorroHero.tsx`
The `ease: [0.22, 1, 0.36, 1]` array in the `lineVariant` object needs to be cast as a tuple for framer-motion's TypeScript types. Change line 18 to use `as const` or cast explicitly:
```typescript
transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
```

### 2. Redesign `Slide01_Hero.tsx`
Replace the current plain dark gradient slide with a modern, creative hero featuring:

- **Background**: A lifestyle stock image of retirees on a beach (use an Unsplash URL of a retired couple walking on a beach at sunset), with a dark gradient overlay for text legibility
- **Logo**: Use the actual Everence Wealth logo from `src/assets/logo-new.png` (rendered as an `<img>` instead of text), displayed prominently at the top
- **Layout**: Split or centered layout — logo top-center, headline centered with the existing "BRIDGING THE RETIREMENT GAP" text, presenter badge at bottom
- **Styling**: Keep the existing reveal animations (RevealElement, ClipReveal, GradientText, GoldUnderline) but add the beach image as the full-bleed background with a cinematic dark-to-transparent gradient overlay

The background image will use a high-quality Unsplash photo URL for a beach retirement scene, styled as `object-cover` behind the existing content.

