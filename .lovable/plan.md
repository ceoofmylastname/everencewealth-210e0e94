
## Slow-Down & Pop: RETIREMENT Spotlight Refinement

### What's Changing

The current 8s cycle moves too fast — each letter only glows for ~0.32s, which reads as a flicker rather than a deliberate spotlight hit. The fix is to:

1. **Slow the total cycle to 16s** (from 8s) — forward pass takes 8s, reverse takes 8s
2. **Widen each letter's lit window** from 4% to 7% of the cycle — so each letter holds its glow for ~1.1s instead of 0.32s, long enough to read and appreciate before the light moves on
3. **Add a `translateY(-6px) scale(1.08)` pop-up transform** when lit — so the pill physically lifts and grows slightly like it's being picked up by a spotlight beam, then settles back down
4. **Soften the fade in/out** around each lit window by adding easing keyframe stops (ramp up over 1.5%, hold for 4%, ramp down over 1.5%) for a smooth bloom rather than a hard snap

### Precise Timing Math (16s cycle)

- Total = 16s, step size = 5% per letter (same percentage structure, just slower clock)
- Forward: letter 1 peaks at 3%, letter 2 at 8%, ..., letter 10 at 48%
- Reverse: letter 10 peaks at 52%, letter 9 at 57%, ..., letter 1 at 97%
- Each lit window: `pre-ramp at peak-2%`, `full bloom at peak`, `post-ramp at peak+2%`, `dark from peak+3.5% onward`

### What It Looks Like

```text
R   →   lit, lifts up 6px, glows gold for ~1.1s
    →   fades back to dark green
E   →   lit, lifts up 6px, glows gold for ~1.1s
    →   fades back
T   →   ... (continues through all 10 letters)
    
(pause at T, then reverses)

T   →   lit again on the way back
N   →   lit
E   →   lit
... back to R
(loop)
```

### Technical Changes — `src/index.css` only

**1. Update animation duration on all 10 nth-child selectors:** `8s → 16s`

**2. Update all 10 `@keyframes retirement-spot-N` blocks** to:
- Widen the lit window from 4% to 7% wide (centered on same peak percentages)
- Add `transform: translateY(-6px) scale(1.08)` on the lit peak keyframe stop
- Add `transform: translateY(0) scale(1)` on resting keyframe stops
- Increase the box-shadow intensity slightly for a more dramatic glow bloom: `0 0 28px hsla(51,78%,65%,0.55), 0 0 10px hsla(51,78%,80%,0.4), inset 0 0 12px hsla(51,78%,70%,0.15)`

**3. Update `.retirement-letter-pill` base style** to include `transform: translateY(0) scale(1)` and `will-change: transform, background, box-shadow` for smooth GPU-composited animation

### Files to Edit
- **`src/index.css`** — lines 917–1011 (the 10 keyframe blocks + nth-child animation rules)
