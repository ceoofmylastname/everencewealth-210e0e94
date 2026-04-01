
Fix the mobile agent picker by changing its layout strategy, not the data query.

What I found
- The advisor data load is simple and likely correct: `src/pages/ResponseCard.tsx` fetches all active advisors from `advisors` and stores them in `advisors`.
- The current picker is rendered as an absolutely positioned dropdown inside the step content:
  - `src/pages/ResponseCard.tsx:291-314`
- The page shell itself uses `overflow-hidden`:
  - success screen: `src/pages/ResponseCard.tsx:478`
  - main page: `src/pages/ResponseCard.tsx:518`
- The step content is also inside a Framer Motion animated container:
  - `src/pages/ResponseCard.tsx:554-565`

Why live mobile is failing
- This is most likely not “missing names in the database”.
- On iPhone/Safari, a scrollable absolute dropdown inside ancestors with `overflow-hidden` and animated/transformed containers is a common clipping/touch-scroll failure.
- That matches the screenshot and the fact that preview shows more names than live phone.

What to change
1. Keep the existing advisor query exactly as-is.
2. Replace the current absolute dropdown panel with an in-flow mobile-safe list pattern:
   - keep the trigger button
   - when opened, render the advisor list below it in normal document flow instead of `absolute`
   - give the list its own bounded height with `max-h-*` and `overflow-y-auto`
3. Close the dropdown after selection, same as now.
4. Keep the selected-agent badge and validation exactly as they are.

Recommended implementation
- In `src/pages/ResponseCard.tsx`, update step 0:
  - remove `absolute left-0 right-0 top-full z-50` from the opened menu
  - render the opened list as a regular block with margin-top
  - add a visible border/dividers between names for easier mobile scanning
  - preserve `WebkitOverflowScrolling: "touch"`
- Example structure:
```text
Trigger button
Opened list container (in flow)
  advisor button
  advisor button
  advisor button
```

Why this should solve it
- An in-flow scroll container is much more reliable on iOS than an absolutely positioned menu nested inside transformed/overflow-hidden parents.
- It avoids clipping from the page wrapper and animation container.
- It will still support 10, 50, or 100+ names.

Optional hardening
- If needed, also close the list when advancing steps or when clicking Back.
- If the animated step container still interferes, render step 0 without horizontal motion animation while the dropdown is open.

Files to update
- `src/pages/ResponseCard.tsx`

Technical details
- Root issue: mobile Safari clipping/touch-scroll behavior caused by the combination of:
  - `overflow-hidden` page wrappers
  - absolutely positioned dropdown
  - Framer Motion animated step wrapper
- No database changes needed.
- No advisor sync logic changes needed.
- The live mobile bug is a UI container/scroll bug, not a data source bug.
