

# Phase 9.1.8 -- Homepage About Component

## Overview
Create a new `HomepageAbout.tsx` component (named to avoid collision with the existing `src/pages/About.tsx` page) that provides a brief Everence Wealth origin story. Positioned after `FiduciaryDifference` and before `WhyChooseUs` on the homepage.

## Design
- Cream background (`bg-[#F0F2F1]`) for contrast after the dark evergreen FiduciaryDifference section
- Two-column layout: text left, decorative image placeholder right (stacks on mobile)
- Evergreen accent on key facts
- Testimonial quote overlay on the right column

## Technical Details

### New File: `src/components/homepage/HomepageAbout.tsx`

**Structure:**
1. Section wrapper: `bg-[#F0F2F1]`, responsive padding, `max-w-6xl` container
2. Two-column grid (`grid-cols-1 lg:grid-cols-2 gap-12`):

**Left Column -- Story**
- Headline: "Everence Wealth: Built on Independence" (serif, evergreen)
- Two paragraphs of origin story text (as specified in the brief)
- Four key facts in a 2x2 grid below the text, each with:
  - Bold value ("Since 1998", "75+", etc.)
  - Descriptor label below
  - Left border accent in evergreen (`border-l-2 border-[#1A4D3E] pl-4`)

**Right Column -- Visual**
- Rounded placeholder card with `bg-[#1A4D3E]/10` and a subtle gradient, representing where a team photo or SF skyline would go
- Overlaid testimonial quote at the bottom of the card:
  - Italic serif text in a semi-transparent white card
  - Attribution line

**Key Facts Data:**
```
Since 1998 | Founded
75+        | Carrier Partnerships
Fiduciary  | Independent Advisor
San Francisco, CA | Headquarters
```

**Animation:** Same `containerVariants`/`cardVariants` framer-motion stagger pattern. Left column fades from left, right column fades from right.

**Dependencies (all installed):** `framer-motion`, `lucide-react` (`MapPin`, `Building2`, `Calendar`, `Users`)

### Integration into `src/pages/Home.tsx`
- Import `HomepageAbout` from `../components/homepage/HomepageAbout`
- Insert `<HomepageAbout />` after `<FiduciaryDifference />` (line 81) and before `<WhyChooseUs />` (line 83)
- Add comment: `{/* 1.11. About — origin story */}`

### No database, edge function, or translation changes required

