
# Unify Apartments Page UI with Landing Page Design

## Overview

The apartments page (`/:lang/apartments`) currently has a simpler, standalone design. This plan aligns it with the landing page design system by:
1. Upgrading the header to match the landing page header style
2. Replacing the `ExplainerVideo` section with the `AutoplayVideo` component (with video player, checkmarks, and golden CTA)
3. Adding the `EmmaSection` ("Start with clarity, not listings") between video and properties
4. Restyling the property cards to match the landing page card design (image carousel with dots, price badge overlay, description, "View" CTA button)
5. Integrating the `EmmaChat` component so "Speak with Emma" and CTA buttons work

## Detailed Changes

### 1. Update the Header (`ApartmentsLanding.tsx`)

Replace the current simple header with one matching the landing page:
- Center logo (desktop), left logo (mobile)
- Left nav: "Apartments" link scrolling to properties
- Right nav: language selector + golden "Speak with Emma" CTA button
- Same glass styling: `bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100`

### 2. Replace ExplainerVideo with AutoplayVideo (`ApartmentsLanding.tsx`)

- Swap `import ExplainerVideo` for `import AutoplayVideo`
- `AutoplayVideo` provides the inline video player with thumbnail, checkmark bullets ("Emma answers questions first", "Human experts review everything"), golden "Ask Emma All Your Questions" CTA, and "You remain in control" reassurance text -- matching screenshot 2

### 3. Add EmmaSection (`ApartmentsLanding.tsx`)

- Import and add the `EmmaSection` component between the video and the properties section
- This renders the "Start with clarity, not listings" card with chat icon, description, and "Get clarity with Emma" CTA button -- matching screenshot 1

### 4. Restyle Property Cards (`ApartmentsPropertiesSection.tsx`)

Redesign property cards to match the landing page's `PropertiesShowcase` style (screenshot 4):
- Use the `PropertyImageCarousel` component (Embla-based) instead of a single static image, with dot indicators and arrow navigation
- Price badge overlay in bottom-right of image (`bg-white/95 backdrop-blur-sm rounded-lg`)
- Card layout: title, location with pin icon (uppercase), description text (line-clamp-2), bottom row with bed/bath/sqm specs + golden "View" CTA button
- Clean card styling: `rounded-xl border border-gray-100 hover:border-gray-200` instead of heavy shadow
- Section background: `bg-gray-50/50` to match

### 5. Add EmmaChat Integration (`ApartmentsLanding.tsx`)

- Import `EmmaChat` from `@/components/landing/EmmaChat`
- Add `isEmmaOpen` state, pass to `EmmaChat`
- Wire the header "Speak with Emma" button, `AutoplayVideo`'s `onOpenEmmaChat`, and `EmmaSection`'s `onStartChat` to toggle Emma open
- Listen for `openEmmaChat` custom events (for consistency)

### 6. Update Section Order

The final page order will be:
1. Header (fixed, matching landing page)
2. Hero (existing `ApartmentsHero` -- unchanged)
3. AutoplayVideo (replaces ExplainerVideo)
4. EmmaSection ("Start with clarity, not listings")
5. Properties Section (restyled cards)
6. Google Reviews / Elfsight (unchanged)
7. Footer (already using homepage footer)
8. EmmaChat overlay + LeadFormModal

---

### Technical Notes

- `PropertyImageCarousel` is already built and uses Embla Carousel -- it will be imported into the apartments properties section to provide the same image carousel with dots/arrows as the landing page cards.
- `EmmaSection` and `AutoplayVideo` are self-contained components that accept language and callback props -- no additional database changes needed.
- The `apartments_properties` table only has a single `featured_image_url` column, not an images array. The property cards will render a single image using the existing field (no carousel arrows/dots for single images, handled gracefully by `PropertyImageCarousel`).
- No database migrations are required.
