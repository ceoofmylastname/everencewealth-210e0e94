

## Plan: Cinematic "REMOVES IT" with Letter-by-Letter Spotlight Animation

Transform "REMOVES IT" into individually animated letters with a sequential highlight sweep using evergreen, white, and gold colors.

### Changes to `src/pages/TrainingEvent.tsx`

**1. New Keyframes (add near line 250)**
- `te-letter-highlight`: A per-letter color cycle — starts white, shifts to gold (`#EDDB77`), then evergreen (`#1A4D3E`), then back to gold. Uses `background-position` shift on a 3-color gradient.
- `te-letter-pop`: Subtle scale+lift (1→1.08→1) synced with the color change for physical emphasis.

**2. Replace the single `<span>REMOVES IT</span>` (lines 354-362)**
- Split "REMOVES IT" into individual `<span>` elements per character (R, E, M, O, V, E, S, space, I, T)
- Each letter gets:
  - `background: linear-gradient(90deg, #FFFFFF, #EDDB77, #1A4D3E, #EDDB77, #FFFFFF)` with `background-clip: text` and `color: transparent`
  - `backgroundSize: '500% 100%'` for wide gradient travel
  - `animation: te-letter-highlight 4s ease infinite, te-letter-pop 4s ease infinite`
  - Staggered `animation-delay`: each letter offset by `0.25s` (so the highlight "sweeps" left-to-right, then loops)
- Font: `fontWeight: 900`, `textTransform: 'uppercase'`, `letterSpacing: '0.04em'` for a wide, modern display look
- `display: 'inline-block'` on each letter (required for individual transforms)
- Space character rendered as a `0.3em`-wide empty span

**3. Wrapper styling**
- Wrap all letter spans in a parent `<span style={{ display: 'inline-flex' }}>` for alignment
- The period (`.`) after "REMOVES IT" stays as plain white text

### Result
A modern, cinematic effect where each letter sequentially illuminates through white → gold → evergreen → gold in a continuous wave, with a subtle pop/lift on the active letter — creating a "marquee spotlight" feel.

### Files Modified
- `src/pages/TrainingEvent.tsx`

