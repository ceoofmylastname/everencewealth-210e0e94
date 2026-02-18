
## Moving Gradient Sweep Animation on RETIREMENT Letters

### What You're Getting

Each letter pill in "RETIREMENT" will have a slow, continuous left-to-right gradient shimmer that flows across all 10 pills as one unified wave — using only your brand's dark forest green and light gold colors. The effect looks like a spotlight or a metallic sheen slowly traveling across the word.

### Visual Design

The animation uses a wide gradient band that moves from left to right across a shared background position. The color stops will be:

```text
Dark Forest Green → Mid Emerald → Light Gold → Mid Emerald → Dark Forest Green
(#09301B)           (hsl 160,48%,35%)  (#EDDB77)   (hsl 160,48%,35%)   (#09301B)
```

The entire row of pills shares the same gradient sweep timing so it reads as one cohesive, flowing motion rather than 10 individual animations. The sweep will be slow (6–8 seconds per cycle) to feel premium and professional, not flashy.

### Technical Approach

**CSS Changes (`src/index.css`)**

1. Add a new `@keyframes retirement-gradient-sweep` animation that shifts `background-position` from `0% center` to `200% center`, making the gradient band travel left to right.

2. Replace the static background on `.retirement-letter-pill` with:
   - A wide gradient (`background-size: 300% 100%`) spanning green → gold → green
   - The new sweep animation at 7s linear infinite
   - Background colors applied to the pill background itself (not text), so the letter remains white

3. The pill background will animate:
   ```css
   background: linear-gradient(
     90deg,
     hsla(160, 48%, 18%, 0.85) 0%,      /* deep forest green */
     hsla(160, 48%, 28%, 0.7) 20%,      /* mid emerald */
     hsla(51, 78%, 70%, 0.35) 40%,      /* gold shimmer peak */
     hsla(160, 48%, 28%, 0.7) 60%,      /* mid emerald */
     hsla(160, 48%, 18%, 0.85) 80%,     /* deep forest green */
     hsla(51, 78%, 70%, 0.20) 100%      /* faint gold tail */
   );
   background-size: 300% 100%;
   animation: retirement-gradient-sweep 7s linear infinite;
   ```

4. The border also gets a subtle gold shimmer to complement:
   ```css
   border: 1px solid hsla(51, 78%, 70%, 0.25);
   ```

**No React/JS changes needed** — this is entirely CSS-driven, making it lightweight and performant.

### Files to Edit

- **`src/index.css`**: Update `.retirement-letter-pill` styles and add the `@keyframes retirement-gradient-sweep` keyframe definition near the existing retirement animation block (around line 880–943).
