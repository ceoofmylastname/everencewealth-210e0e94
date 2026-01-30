
Goal: Fix the mobile navbar overlay so it always opens in front of the page (especially on the Location Guides page), and ensure the language dropdown stays clickable and visible above the overlay.

What’s happening (based on your screenshots + code review)
- The mobile menu is rendered inside `src/components/home/Header.tsx` as a `position: fixed` element.
- On some mobile browsers (commonly iOS/Safari, and sometimes Chrome with certain CSS effects), a “fixed” element can incorrectly behave like it’s constrained to an ancestor when that ancestor (or a nearby ancestor) has effects like `backdrop-filter` / “glass” styling.
- Result: the menu appears “behind” / doesn’t cover the full page, even though the close (X) button shows.

Why the previous z-index tweak wasn’t enough
- We changed `z-40 → z-[45]`, but the screenshots show the menu still not fully overlaying the page.
- This strongly suggests a “fixed positioning containing block / stacking context” issue (not just z-index).

Implementation approach (robust fix)
We’ll move the Mobile Menu overlay out of the header DOM tree by rendering it in a portal attached to `document.body`. This avoids browser quirks where “fixed” gets constrained by an ancestor with blur/filter/backdrop effects.

Files to change
1) `src/components/home/Header.tsx`
2) `src/components/LanguageSwitcher.tsx` (small improvement to dropdown z-index/background so it remains usable above overlays)
3) `src/components/ContentLanguageSwitcher.tsx` (same improvement for its dropdown)

Step-by-step changes

A) Render the mobile overlay using a React Portal (Header.tsx)
- Import `createPortal` from `react-dom`.
- Replace the current inline “Mobile Menu - CSS animated” `<div className="fixed inset-0 ...">` with a component that returns a portal:
  - `createPortal(<div className="fixed inset-0 ...">...</div>, document.body)`
- Add a defensive guard for environments where `document` doesn’t exist:
  - if `typeof document === 'undefined'`, render nothing (or render inline fallback).

B) Adjust layering (z-index) so it always sits above page content
- Keep the header itself on top so the hamburger/X remains tappable:
  - Header root: change `z-50` → `z-[100]`
  - Mobile overlay: use something like `z-[90]`
- This ensures:
  - Overlay covers all page content
  - Header stays above overlay controls (if we keep the close button in the header)

C) Ensure overlay is fully opaque (not see-through)
- Keep `bg-card` (it maps to a solid color via CSS variables) or switch to `bg-background`.
- Avoid using transparent backgrounds on the full-screen overlay.
- If we want a slightly “premium” look, we can do `bg-background/95 backdrop-blur` but only if you explicitly want a semi-transparent overlay. For your issue, we’ll keep it opaque.

D) Prevent the underlying page from scrolling when the menu is open
- Add a `useEffect` tied to `isMobileMenuOpen`:
  - when open: `document.body.style.overflow = 'hidden'`
  - when closed/cleanup: restore `document.body.style.overflow = ''`
- This makes the menu feel “native” and prevents accidental page scrolling behind it.

E) Make language dropdowns reliably appear above everything (Language switcher improvements)
This is important once the overlay has a higher z-index. Some dropdown components render in a portal and use `z-50` by default; if our overlay is `z-[90]`, the dropdown could appear behind it unless we raise dropdown z-index.

- `src/components/LanguageSwitcher.tsx`
  - Add an explicit class to `SelectContent`, e.g.:
    - `className="bg-popover border border-border z-[120]"`
  - This also addresses the “dropdowns becoming see-through” issue.

- `src/components/ContentLanguageSwitcher.tsx`
  - Its `DropdownMenuContent` already sets `bg-popover ... z-50`
  - Increase to `z-[120]` to ensure it always appears above the overlay.

How we’ll confirm it’s fixed (acceptance checks)
1) On mobile, go to `/en/locations`
   - Tap hamburger
   - Menu should cover the entire viewport (no page visible behind it)
   - You can scroll the menu if needed
   - Tap X to close

2) Repeat on a few other pages (like `/en/properties`, blog, brochure pages)
   - Confirm consistent behavior

3) Language switching
   - Open mobile menu → open Language dropdown → pick another language
   - Confirm it routes correctly (e.g. `/en/locations` → `/<newlang>/locations`)
   - Confirm dropdown is visible and clickable (not behind anything)

Notes / edge cases we’ll handle
- If `createPortal` is unavailable or `document` is undefined, we’ll fail gracefully.
- We’ll keep the change scoped to the site header (won’t affect CRM/admin layouts).
- We’ll keep dropdowns with solid backgrounds and high z-index to avoid transparency/stacking issues.

Scope summary
- Primary fix: portal-based mobile menu overlay + z-index layering + scroll lock
- Secondary reliability: raise language dropdown z-index so it always works “perfectly” on mobile even when overlays are open
