

## Headline Typography — Mixed Sizing for Visual Hierarchy

The headline "The Retirement System Was Not Built For You. It Was Built To Be Paid By You." currently renders at uniform large sizes per line. The goal is to create a dynamic typographic rhythm where key "power words" are large and connector words are smaller.

### Approach

Break the headline into inline spans with two size classes — large (hero words) and small (connector words) — so the text reads naturally but visually emphasizes the important words.

**Line 1:** `"The Retirement System Was Not"` → "The" small, "Retirement System" large, "Was Not" small  
**Emphasis:** `"Built"` stays as the italic slash-word at large size  
**Line 2:** `"For You. It Was Built To Be Paid By You."` → "For You." small, "It Was" small, "Built To Be" small, "Paid By You." large

Simplified version — make the structural/filler words smaller and the punchy words bigger:

```
[small] The [/small] [large] Retirement System [/large] [small] Was Not [/small] [large] Built [/large]
[small] For You. It Was Built To Be [/small] [large] Paid By You. [/large]
```

### File Changes

**`src/components/socorro/SocorroHero.tsx`** (lines 69-74):
- Break each `<motion.span>` line into inner `<span>` elements with classes like `hero-sm` and `hero-lg` (or keep default as large, only wrap small words).

**`src/styles/socorro.css`** (around line 193-275):
- Add `.hero-headline .hero-sm` class — ~60% of the parent font-size, lighter weight, slightly more opacity reduction.
- Add responsive overrides in the mobile media query.
- Keep `.line-1` and `.line-2` as flex-wrap containers so words flow naturally.

### Result
Desktop: Big impactful words pop, small connector words recede — creating a magazine-style headline.  
Mobile: Both sizes scale down proportionally via `clamp()` so nothing overflows.

