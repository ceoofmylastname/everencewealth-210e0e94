

## Plan: Upgrade Headline Typography & Sleek Design

### Changes to `src/pages/TrainingEvent.tsx`

**1. Headline font upgrade (lines 340-355)**
- Switch to `fontFamily: "'Inter', system-ui, sans-serif"` with `fontWeight: 800` and tighter tracking `-0.04em`
- Add subtle `textShadow: '0 2px 24px rgba(200,169,110,0.15)'` for depth
- Increase `lineHeight` to `1.08` for better breathing room

**2. Content panel background — add rounded corners + glass feel (line 325)**
- Add `borderRadius: '20px'` to the right content panel div
- Add a subtle border: `border: '1px solid rgba(200,169,110,0.1)'`
- Add soft inner glow via `boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3)'`

**3. "Removes It" gradient span — smoother, wider gradient (lines 348-354)**
- Expand gradient to 5 stops for a richer sweep: `#B8945E, #F5E6C8, #EDDB77, #F5E6C8, #B8945E`
- Slow animation to `6s` for more elegance

**4. Eyebrow text (lines 331-337)**
- Bump `fontSize` to `11px` and `letterSpacing` to `0.28em` for a more refined, airy feel

### Files Modified
- `src/pages/TrainingEvent.tsx` — headline, eyebrow, content panel, gradient span

