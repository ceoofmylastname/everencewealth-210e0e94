

## Add Rounded Corners to All Sections with White Background

Change the homepage so each section appears as a rounded "card" floating on a white page background, similar to the screenshot reference.

### Approach

Instead of modifying every individual section component (15+ files), we make two targeted changes:

1. **`src/pages/Home.tsx`** -- Change the outer container background from `bg-dark-bg` to `bg-white`, and wrap each section in the `<main>` with spacing so the white gaps show between sections.

2. **`src/pages/Home.tsx`** -- Add a wrapper `<div>` around each section component with `rounded-3xl overflow-hidden` so the sections get clipped to rounded corners, plus vertical margin (`my-4 md:my-6`) to create visible white gaps between them.

### Technical Details

**File: `src/pages/Home.tsx`**

- Change outer div from `bg-dark-bg` to `bg-white`
- Wrap each section component (Hero through CTA) in a `<div className="rounded-3xl overflow-hidden">` container
- Add `mx-2 md:mx-4 lg:mx-6` horizontal margin to the main element so the rounded edges are visible on the sides too
- Add `space-y-4 md:space-y-6` to the main element for consistent vertical gaps
- The StackingCards component needs special handling since it uses sticky positioning -- wrap the entire StackingCards in one rounded container rather than individual cards

**File: `src/components/home/Footer.tsx`** -- Also wrap in a rounded container for consistency

This approach requires editing only 1-2 files rather than touching all 15 section components, since the `overflow-hidden` on the wrapper will clip each section's content to rounded corners regardless of the section's own styles.
