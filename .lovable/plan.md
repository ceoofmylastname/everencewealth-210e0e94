

## Upgrade Socorro Hero Headline — Dual Font + Gradient Treatment

### Current State
The headline uses DM Sans for all three lines. Fonts already loaded in the project include: **Space Grotesk**, **Clash Display**, **Sora**, **Outfit**, **Playfair Display**, **Inter Tight**, and **Cormorant Garamond**.

### Design

Use **two contrasting fonts** for visual impact:
- **Lines 1 & 3** (connector text): **Space Grotesk** — clean, geometric, modern sans-serif
- **Line 2** (power line): **Clash Display** — bold, editorial display font with character

Apply a **gold shimmer gradient** to Line 2 using the existing `socorro-shimmer` keyframe animation, creating an animated sweep from gold → light gold → white → gold.

Line 3 gets a **subtle static gradient** (muted warm tones) instead of flat color.

### Changes

**`src/styles/socorro.css`** — Update the three `.hero-line-*` rules:

```css
.hero-line-1 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  /* keep existing size/weight/color/spacing/uppercase */
}

.hero-line-2 {
  font-family: 'Clash Display', system-ui, sans-serif;
  /* keep existing size, weight 700, line-height */
  background: linear-gradient(90deg, #C8A96E 0%, #E2C896 30%, #FFFAF0 50%, #E2C896 70%, #C8A96E 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: socorro-shimmer 6s linear infinite;
}

.hero-line-3 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  /* keep existing size/weight/margin */
  background: linear-gradient(90deg, #9a9a8a, #b8a88a);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**No changes needed** to `SocorroHero.tsx` — the markup stays the same, only CSS styling updates.

### Files Modified
- `src/styles/socorro.css` — update 3 class rules

