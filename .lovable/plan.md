
## Goal
Restore property images immediately by reverting `src/lib/imageUrlTransformer.ts` to the safe pass-through implementation (no URL rewriting). After images are confirmed working again, we will attempt a **separate** change to test `w1200` for cards (instead of `w800`).

## What’s happening (why images broke again)
- Property card components call `getHighResImageUrl(..., 'card')`.
- Those `<img>` tags have `onError` handlers that replace the image with `'/placeholder.svg'`.
- When the transformer rewrites `/w400/` → `/w800/`, the CDN returns errors for many images, triggering `onError` and causing placeholders.

## Phase 1 (Immediate): Revert transformer to working state (ONE change only)
### File to change
- `src/lib/imageUrlTransformer.ts`

### Exact code to apply (as requested)
```ts
export function getHighResImageUrl(
  url: string | undefined | null, 
  size: 'thumbnail' | 'card' | 'hero' | 'lightbox' = 'hero'
): string {
  if (!url) return '/placeholder.svg';
  return url; // Back to working state
}
```

### Scope
- Only this one file.
- No other logic, no other components, no additional fallbacks.

## Phase 1 Verification (must pass before any next step)
On the route you’re currently on:
- `/en/properties?transactionType=sale&newDevs=only`

Check:
1. Property cards show real photos (not placeholders).
2. In DevTools → Network → Img (or filter “jpg”), confirm image requests are hitting URLs with `/w400/` (not `/w800/`).
3. No widespread 404s for image files.

If you still see placeholders after the revert:
- Do a hard refresh (to avoid cached broken `/w800/` URLs).
- If still broken, we’ll inspect the failing image URLs in the Network tab to confirm whether the API is returning missing/empty URLs vs. CDN failures.

## Phase 2 (Separate follow-up, after Phase 1 passes): Try `w1200` for cards instead of `w800`
This will be a **new** approved change after you confirm images are back.

### Why we won’t do it in the same change
- You requested an immediate revert first and to avoid bundling changes.
- `w1200` may or may not exist for the specific “card” filenames returned by the listings API (they can differ from detail-page filenames).

### Proposed approach for the follow-up
Option A (minimal but risky): transform `card` from `/w400/` → `/w1200/` in the transformer (same pattern as before).
Option B (recommended and safest): attempt `/w1200/` for cards but add an automatic fallback back to `/w400/` before showing the placeholder (requires a tiny change in the card `<img onError>` handlers).

We’ll decide between A vs B after we confirm Phase 1 stability and after we spot-check a few `w1200` URLs in the browser Network tab.

## Rollback / Emergency path
If any change re-breaks images:
- Immediately revert the transformer back to `return url;` (pass-through), or use the project History restore to jump back to the last known-good state.
