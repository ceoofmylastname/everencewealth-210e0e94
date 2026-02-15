
# Phase 9.1.10 -- Testimonials Component

## Overview
Create a `Testimonials.tsx` component featuring a client testimonials carousel using `embla-carousel-react` (already installed). Positioned after `HomepageAbout` and before `WhyChooseUs` on the homepage.

## Design
- White background (`bg-white`) for contrast after the cream About section
- Embla carousel with autoplay (`embla-carousel-autoplay`, already installed)
- Large evergreen decorative quote marks
- 5-star rating display using Lucide `Star` icons
- Client avatar circles with initials
- Dot indicators for carousel navigation
- Scroll-triggered fade-in animation via framer-motion

## Technical Details

### New File: `src/components/homepage/Testimonials.tsx`

**Structure:**
1. Section wrapper: `bg-white`, responsive padding, `max-w-6xl` container
2. Centered headline: "What Our Clients Say" (serif, evergreen)
3. Embla carousel with autoplay plugin (4s delay):
   - Each slide contains:
     - Large decorative open-quote character in evergreen (`text-[#1A4D3E]/20`, `text-6xl`, serif)
     - Testimonial text (serif, italic, `text-slate-700`)
     - 5 gold star icons (`Star` from lucide-react, filled)
     - Client initials avatar circle (`bg-[#1A4D3E]`, white text)
     - Client name and location
4. Dot indicators below the carousel (active dot in evergreen)

**Testimonial Data (hardcoded array of 4):**

| Quote | Attribution |
|-------|------------|
| "Michael helped us uncover $80K in hidden 401k fees..." | Sarah and Tom K., San Francisco |
| "I never understood how much I was losing to taxes until Everence showed me the three-bucket strategy..." | David R., Los Angeles |
| "As a small business owner, I needed someone who understood both my personal and business finances..." | Jennifer L., San Diego |
| "The indexed strategy they recommended has given us peace of mind..." | Robert and Maria S., Sacramento |

**Carousel Setup:**
```
useEmblaCarousel({ loop: true, align: 'center' }, [Autoplay({ delay: 4000 })])
```

Track `selectedIndex` via embla API `on('select')` for dot indicators.

**Animation:** `containerVariants` framer-motion fade-in with `useInView`.

**Dependencies (all installed):** `embla-carousel-react`, `embla-carousel-autoplay`, `framer-motion`, `lucide-react` (`Star`, `Quote`)

### Integration into `src/pages/Home.tsx`
- Import `Testimonials` from `../components/homepage/Testimonials`
- Insert `<Testimonials />` after `<HomepageAbout />` (line 85) and before `<WhyChooseUs />` (line 88)
- Add comment: `{/* 1.12. Testimonials — client stories */}`

### No database, edge function, or translation changes required
