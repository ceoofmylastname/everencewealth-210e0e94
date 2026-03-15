

## Redesign Socorro Hero Headline — Clean 3-Line Structure

Replace the current mixed Cormorant/DM Sans italic headline with a clean 3-line block layout.

### Changes

**`src/components/socorro/SocorroHero.tsx`** (lines 63-75) — Replace headline markup:
```tsx
<motion.h1
  className="hero-headline mb-4"
  variants={headlineVariants}
  initial="hidden"
  animate="show"
>
  <motion.span className="hero-line-1" variants={lineVariant}>
    The Retirement System
  </motion.span>
  <motion.span className="hero-line-2" variants={lineVariant}>
    Was Not Built For You.
  </motion.span>
  <motion.span className="hero-line-3" variants={lineVariant}>
    It Was Built To Be Paid By You.
  </motion.span>
</motion.h1>
```

**`src/styles/socorro.css`** (lines 194-298) — Replace all `.hero-headline` rules, `.slash-word`, `.hero-sm`, shimmer keyframes, and mobile overrides with:

```css
.hero-headline {
  display: flex;
  flex-direction: column;
  max-width: 700px;
}

.hero-line-1 {
  display: block;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: clamp(1.2rem, 3vw, 2rem);
  font-weight: 300;
  color: #e8e0d0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.1;
}

.hero-line-2 {
  display: block;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: clamp(2.8rem, 7vw, 6rem);
  font-weight: 800;
  color: #C8A96E;
  line-height: 1.0;
}

.hero-line-3 {
  display: block;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: clamp(1.1rem, 2.5vw, 1.8rem);
  font-weight: 400;
  color: #9a9a8a;
  line-height: 1.1;
  margin-top: 8px;
}
```

Remove: `.line-1`, `.line-2`, `.slash-word`, `.hero-sm`, `hero-line2-shimmer` keyframe, `hero-draw-slash` keyframe, and the mobile media query for headline sizes.

