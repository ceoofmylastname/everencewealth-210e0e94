
## Slow-Down & Pop: RETIREMENT Spotlight Refinement

### What You're Getting

The spotlight will move at a deliberate, cinematic pace — each letter has the light land on it, hold for a beat, and physically lift out of the row before the light drifts to the next letter. Then it reverses back. Feels premium, not flashy.

### Precise Changes

**Speed: 8s → 20s**
Each percentage point of the keyframe now equals 0.2s of real time. A 5% step between letters = 1s between each spotlight hit.

**Lit window: 3% wide → 8% wide**
Each letter's glow now lasts ~1.6s (vs the current ~0.24s flicker), giving the eye time to register and appreciate the gold bloom before it moves on.

**Pop transform added to each keyframe peak**
At the lit peak, each pill gains:
- `transform: translateY(-8px) scale(1.1)` — lifts up 8px and grows 10%
- Resting state: `transform: translateY(0) scale(1)`
- The `.retirement-letter-pill` base gets `transition: none` removed and `will-change: transform, background, box-shadow, border-color` added for smooth GPU rendering

**Gold glow intensity upgraded**
The peak `box-shadow` becomes:
```
0 0 32px hsla(51,78%,65%,0.6),
0 0 12px hsla(51,78%,80%,0.45),
inset 0 0 16px hsla(51,78%,70%,0.2)
```
The `background` at peak becomes richer gold: `hsla(51, 80%, 55%, 0.75)` (brighter, more saturated).

### Timing Math (20s cycle)

```
Forward pass (0%–50%):   Letter 1 peaks at 3%,  Letter 2 at 8%, ... Letter 10 at 48%
Reverse pass (50%–100%): Letter 10 peaks at 52%, Letter 9 at 57%, ... Letter 1 at 97%
Each lit window: ramp-up at peak-2%, full bloom at peak, ramp-down at peak+2%, dark from peak+4%
Gap between lit windows: ~0.4s of darkness between each letter
```

### Files to Edit

- **`src/index.css`** — Update all 10 `@keyframes retirement-spot-N` blocks to add `transform` stops, widen the lit window, intensify gold glow; update all 10 `nth-child` animation durations from `8s → 20s`; update `.retirement-letter-pill` base to add `will-change`
