

## Plan: Perfect Mobile Hero Section UI

Looking at the screenshot reference and the current code, the hero needs tighter spacing and better proportions on mobile so everything fits without excessive scrolling.

### Changes to `src/pages/TrainingEvent.tsx`

**Hero section (line 235)**: Reduce top/bottom padding on mobile, tighten gap:
- `pt-12 pb-8` → `pt-6 pb-6` on mobile
- `gap-10` → `gap-6` on mobile

**Left column (line 240)**: Reduce `space-y-8` to `space-y-5` on mobile:
- `space-y-8` → `space-y-5 sm:space-y-8`

**Badge pill (line 242)**: Slightly smaller on mobile — already decent but tighten padding:
- `px-3 py-1.5` → `px-2.5 py-1`

**Headline (line 251)**: Fine-tune mobile size for perfect fit — bump slightly and tighten line-height:
- `text-[2rem] leading-[1.15]` → `text-[1.75rem] leading-[1.1]` to prevent wrapping issues on narrow screens

**Subheadline (line 266)**: Tighten on mobile:
- `text-base` → `text-[0.9rem] leading-relaxed`

**Event details grid (line 270)**: Reduce gap and padding:
- `gap-4 sm:gap-6 pt-4` → `gap-3 sm:gap-6 pt-2 sm:pt-4`
- Icon boxes `w-12 h-12` → `w-10 h-10 sm:w-12 sm:h-12`
- Date/time text `text-lg` → `text-base sm:text-lg`

**Form card (line 303)**: Reduce padding and min-height on mobile:
- `p-6 sm:p-8 md:p-12` → `p-5 sm:p-8 md:p-12`
- `min-h-[320px]` → `min-h-[280px]`
- Andaz icon `w-20 h-20` → `w-16 h-16 sm:w-20 sm:h-20`, MapPin `w-8 h-8` → `w-6 h-6 sm:w-8 sm:h-8`
- Venue title `text-3xl` → `text-2xl sm:text-3xl`
- CTA button `h-16 text-xl` → `h-14 text-lg sm:h-16 sm:text-xl`

**Navbar (line 224)**: Already fine, just ensure compact on small screens.

All changes are mobile-size reductions with `sm:` breakpoints preserving the current desktop look.

