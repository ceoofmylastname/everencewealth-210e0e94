

## Mobile-First Optimization for Socorro Advisors Page

### Changes

**1. AdvisorCard.tsx — Mobile touch targets & image loading**
- Add `loading="eager"` and `fetchpriority="high"` to headshot images so they render instantly without lazy-load delay
- Add `decoding="async"` for smooth rendering
- Set a background color placeholder on the image container so layout doesn't shift
- Increase card padding from `p-6` to `p-4 sm:p-6` for tighter mobile spacing
- Ensure CTA button meets 44px minimum touch target
- Disable 3D hover effect on mobile (touch devices) — pass `hover3d={false}` conditionally or handle via CSS `@media (pointer: coarse)`

**2. AdvisorGrid.tsx — Mobile-first grid layout**
- Change grid from `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` to a 2-column mobile layout: `grid-cols-2 lg:grid-cols-3`
- Reduce gap on mobile: `gap-3 sm:gap-6`
- Update skeleton loading to match the 2-col layout
- Update skeleton aspect ratio to `aspect-[3/4]` to match actual cards

**3. SocorroAdvisors.tsx — Tighter mobile header**
- Reduce header padding on mobile: `pt-24 pb-10 sm:pt-28 sm:pb-16 px-4 sm:px-6`
- Reduce grid section padding: `py-10 sm:py-14 px-4 sm:px-6`

**4. AdvisorCard.tsx — Responsive text sizing**
- Scale down name font on mobile: `fontSize: "18px"` on small screens via clamp or responsive class
- Reduce card info padding and CTA size for compact 2-col mobile view

### Technical details
- `fetchpriority="high"` + `loading="eager"` ensures images load immediately without Intersection Observer delay
- 2-column grid on mobile shows more advisors above the fold, reducing scroll
- No new dependencies needed

