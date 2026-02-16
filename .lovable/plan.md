

## Stacking Card Scroll Effect for Three Sections

Transform the three consecutive sections -- **Silent Killers**, **Tax Buckets**, and **Indexed Advantage** -- into scroll-driven stacking cards where each section rises from below to cover the one before it.

### How It Works

Each section becomes a sticky card pinned to the top of the viewport. As the user scrolls, the next card slides up from below and overlaps the previous one, creating a layered "deck of cards" effect. Scrolling back down reverses the animation naturally.

### Changes

**1. New wrapper component: `src/components/homepage/StackingCards.tsx`**

A container that wraps the three sections and applies the stacking behavior:
- Each card gets `position: sticky` with `top: 0` so it pins at the top of the viewport
- Each successive card has a slightly higher `z-index` so it visually covers the previous
- Cards have `rounded-3xl`, a `shadow-[0_-8px_30px_rgba(0,0,0,0.3)]` (top shadow / backlight), and `overflow: hidden`
- The wrapper has enough vertical padding/spacing so the scroll distance allows each card to fully cover the previous before the next begins
- Each card is wrapped in a `div` with `min-height: 100vh` to provide scroll space

**2. Update `src/pages/Home.tsx`**

Replace the three individual section imports with a single `<StackingCards />` component that renders them together:

```
Before:
  <SilentKillers />
  <TaxBuckets />
  <IndexedAdvantage />

After:
  <StackingCards />
```

**3. Modify each section component slightly**

- **SilentKillers.tsx**: Remove the outer `<section>` wrapper's top/bottom padding and let the stacking container control layout. Add `rounded-3xl` and the backlight shadow.
- **TaxBuckets.tsx**: Same treatment -- remove outer section padding, add rounded corners and shadow.
- **IndexedAdvantage.tsx**: Same treatment.

Each section will accept an optional `className` prop to receive the stacking styles from the parent wrapper.

### Technical Approach

The stacking effect uses pure CSS `position: sticky` -- no JavaScript scroll listeners needed. This is the most performant approach:

```text
+---------------------------+
|  Section 1 (sticky, z-10) |  <-- pins at top
|  rounded-3xl + shadow     |
+---------------------------+
         |
         v  (user scrolls)
+---------------------------+
|  Section 2 (sticky, z-20) |  <-- rises up, covers Section 1
|  rounded-3xl + shadow     |
+---------------------------+
         |
         v  (user scrolls more)
+---------------------------+
|  Section 3 (sticky, z-30) |  <-- rises up, covers Section 2
|  rounded-3xl + shadow     |
+---------------------------+
```

### Visual Styling per Card

- **Rounded corners**: `rounded-3xl` (24px radius)
- **Backlight shadow**: `shadow-[0_-8px_30px_rgba(0,0,0,0.3)]` -- a top-facing shadow creating the "backlit" effect as it slides over the previous card
- **Glassmorphic edge**: A subtle `border border-white/10` for depth separation
- **Smooth scroll**: Each card's container provides scroll breathing room via `min-height: 100vh`

### Files to Change

| File | Change |
|---|---|
| `src/components/homepage/StackingCards.tsx` | New wrapper with sticky + z-index logic |
| `src/pages/Home.tsx` | Replace 3 sections with `<StackingCards />` |
| `src/components/homepage/SilentKillers.tsx` | Accept className prop, remove outer padding |
| `src/components/homepage/TaxBuckets.tsx` | Accept className prop, remove outer padding |
| `src/components/homepage/IndexedAdvantage.tsx` | Accept className prop, remove outer padding |
