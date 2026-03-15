

## Optimize SocorroHero — Tighten Copy & Fit to Viewport

The hero currently has 5 body paragraphs that push content well below the fold. The goal is to condense the narrative into 2 tight paragraphs while keeping the same punch, so the headline + body + CTA all fit within a single viewport.

### Copy Changes

**Keep headline and subheadline exactly as-is.**

**Condense 5 body paragraphs into 2:**

Paragraph 1 (white/70):
"You saw the chart — $100,000 in a variable account versus a protected indexed strategy over 26 years. That gap isn't luck. It's structure. Hidden fees, tax time bombs at 73, market crashes with no floor — most people in a 401k are on the wrong side of it and don't even know."

Paragraph 2 (gold, bold):
"You came to this workshop because something wasn't adding up. Trust that instinct. The Financial Needs Assessment is 30 minutes, your numbers, zero pressure — just a clear look at what your current strategy is actually costing you."

Remove the "No pressure. No products pushed. Just clarity." standalone paragraph — that sentiment is now baked into paragraph 2.

### Layout Tweaks

- Reduce `mb-10` on badge to `mb-6`
- Reduce `pt-32` to `pt-24`
- Reduce `mb-6` on headline to `mb-4`
- Reduce `mb-6` on subheadline to `mb-4`
- Reduce spacing between body paragraphs from `mb-4` to `mb-3`
- Last body paragraph: `mb-8` (before CTA)
- Reduce `mt-8` on detail text to `mt-5`

### File
`src/components/socorro/SocorroHero.tsx` — condense paragraphs, tighten spacing.

