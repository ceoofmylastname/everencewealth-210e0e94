

## Fix: Mobile Agent Bottom Sheet Not Scrolling

### Root Cause
Line 295 in `src/pages/ResponseCard.tsx`:
```jsx
<div className="fixed inset-0 z-[9999]" style={{ touchAction: 'none' }}>
```

The outer overlay container has `touchAction: 'none'`, which **blocks all touch events** including scrolling on iOS Safari. Even though the inner scroll container sets `touchAction: 'pan-y'`, iOS respects the parent's restriction and prevents scrolling entirely.

This is why all 24 agents load but the user can only see the ones visible without scrolling (~7).

### Fix
In `src/pages/ResponseCard.tsx`, line 295:
- Change `touchAction: 'none'` to `touchAction: 'auto'` on the outer fixed overlay
- Keep `touchAction: 'pan-y'` on the inner scroll container
- Add `touchAction: 'none'` only on the **backdrop** div (to prevent scroll-through on the dimmed area)

### Changes (single file)
**`src/pages/ResponseCard.tsx`** — 2 small edits:

1. **Line 295** — outer overlay: remove `touchAction: 'none'`
   - Change: `style={{ touchAction: 'none' }}` → remove the style entirely (or set to `auto`)

2. **Line 298-300** — backdrop div: add `touchAction: 'none'` so tapping the backdrop still closes without scrolling through
   - Add: `style={{ touchAction: 'none' }}`

No other changes needed. The scroll container already has the correct properties (`overflow-y-scroll`, `overscroll-contain`, `WebkitOverflowScrolling: 'touch'`, `touchAction: 'pan-y'`).

