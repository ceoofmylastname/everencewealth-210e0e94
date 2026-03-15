

# Glassmorphism Upgrade — All Presentation Slides

## Overview
Apply consistent glassmorphism styling across all 26 presentation slides. Many slides currently use opaque `.antigravity-card` (solid white) and flat colored backgrounds. The update will replace these with frosted glass effects: semi-transparent backgrounds, `backdrop-filter: blur(12px)`, and subtle 1px white/translucent borders.

## What Changes

### 1. Update Global CSS (antigravity.css)
Modify `.antigravity-card` and `.antigravity-card-dark` base classes to use glassmorphism:

- `.antigravity-card`: `background: rgba(255,255,255,0.45)` → `backdrop-filter: blur(12px)` → `border: 1px solid rgba(255,255,255,0.5)` → soft shadow
- `.antigravity-card-dark`: `background: rgba(26,77,62,0.75)` → `backdrop-filter: blur(12px)` → `border: 1px solid rgba(255,255,255,0.1)`
- Add new `.antigravity-glass` utility class for reuse

### 2. Slides with Solid-Color Card Backgrounds (Inline Styles)
These slides use inline `background` colors on cards and need conversion to frosted glass:

**Slide03_WaysToInvest** — Replace solid `#E8EBF0`, `#F5E6C8`, `#E8F0EC` card backgrounds with translucent `rgba()` equivalents + blur + white border

**Slide07_CompoundInterest** — Convert `.antigravity-card` usage (already covered by global CSS change)

**Slide11_HiddenFees** — Convert fee table wrapper and cost pills to glass styling; warning callouts get frosted red glass

**Slide15_SideBySide** — Replace solid `#FEF2F2` and `#E8F0EC` column backgrounds with translucent versions + blur

**Slide19_TaxDeepDive** — Cards already use `.antigravity-card` (covered globally); warning badges get glass treatment

**Slide20_TaxComparison** — Cards use `.antigravity-card` (covered globally); highlighted card ring stays

**Slide22_PlanAdvantage** — Cards use `.antigravity-card` (covered globally); keep colored top border accents

### 3. Slides Already Partially Glass (Verify/Enhance)
These already have some `backdrop-filter` but need consistency check:

- **Slide02** — Glass cards already styled, ensure border consistency
- **Slide05** — Carrier cards have glass, verify blur value matches 12px standard
- **Slide12** — Loss cards have `blur(16px)`, normalize to consistent style
- **Slide13** — Step cards have `blur(16px)`, normalize
- **Slide17** — Tax bucket cards already glass, verify
- **Slide23** — Benefit cards already glass, verify

### 4. Dark/Image Background Slides (Light Glass)
- **Slide09, Slide21, Slide26** — These have dark backgrounds. Any cards on top get light frosted glass: `rgba(255,255,255,0.08)` + `blur(12px)` + `border: 1px solid rgba(255,255,255,0.15)`

### 5. Slides with Flat Step Rows
- **Slide14_IndexingSolution** — Convert flat colored step rows to glass rows with translucent backgrounds
- **Slide18_ThreeBuckets** — TaxBuckets component cards get glass treatment (update TaxBuckets.tsx)

## Technical Approach

The most impactful change is updating the **global CSS** for `.antigravity-card` and `.antigravity-card-dark`, which will cascade to ~10 slides automatically. Then individually update ~6 slides that use inline backgrounds. Slides with existing glass effects just need minor normalization.

### Glass Recipe (consistent across all)
```css
background: rgba(255, 255, 255, 0.35);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.45);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
```

### Dark Glass Recipe
```css
background: rgba(26, 77, 62, 0.7);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
```

## Files to Edit
1. `src/styles/antigravity.css` — Global card classes
2. `src/components/presentation/slides/Slide03_WaysToInvest.tsx`
3. `src/components/presentation/slides/Slide07_CompoundInterest.tsx` (minor)
4. `src/components/presentation/slides/Slide11_HiddenFees.tsx`
5. `src/components/presentation/slides/Slide14_IndexingSolution.tsx`
6. `src/components/presentation/slides/Slide15_SideBySide.tsx`
7. `src/components/presentation/slides/Slide18_ThreeBuckets.tsx` (via TaxBuckets.tsx)
8. `src/components/presentation/slides/Slide19_TaxDeepDive.tsx`
9. `src/components/presentation/slides/Slide20_TaxComparison.tsx`
10. `src/components/presentation/slides/Slide22_PlanAdvantage.tsx`
11. `src/components/presentation/TaxBuckets.tsx`

