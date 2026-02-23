

# Workshop Landing Page -- Modern Premium Redesign

## Overview

Transform the current flat, sharp-edged workshop landing page into a modern, animated, premium experience with 3D card effects, smooth Framer Motion animations, rounded corners, and AI-generated brand imagery.

## Visual Changes

### 1. Hero Section Overhaul
- Full-width gradient hero with a subtle animated background pattern (evergreen-to-dark gradient)
- Large, bold headline with a word-by-word fade-in animation using Framer Motion
- Subheadline animates in after the headline
- Date/time badge floats in with a spring animation

### 2. Card System -- 3D with Back Shadows
- All cards (form, workshop details, advisor) use `rounded-2xl` corners
- Deep layered shadows: `shadow-[0_8px_30px_-4px_rgba(26,77,62,0.15)]`
- 3D lift on hover: `hover:translate-y-[-4px]` with intensified shadow
- Smooth 300ms transitions on all interactive elements

### 3. Registration Form Card
- Floating card with a subtle border and glassmorphism-lite effect
- Rounded-2xl inputs with smooth focus ring animations
- Submit button with hover scale + shadow deepening
- Success state: animated checkmark with confetti-style burst

### 4. Animations (Framer Motion)
- Staggered section entrance (each section fades + slides up as you scroll)
- Hero content: spring-based entrance from the left
- Form card: entrance from the right with a slight delay
- "What You'll Learn" bullets: staggered list entrance
- Trust indicators: scale-in animation
- Advisor card: fade + scale entrance

### 5. AI-Generated Brand Image
- Use Nano Banana Pro to generate a professional hero background image that fits the Everence Wealth brand (financial planning, retirement, wealth growth -- in evergreen/gold tones)
- Image is generated via a backend function, stored, and displayed as the hero background

### 6. Advisor Photo Upload
- Add a photo upload feature to the advisor portal (not on the landing page itself)
- On the landing page, display the advisor's photo prominently in the hero or advisor card section with a polished circular frame with a gold ring border

## Technical Plan

### File: `src/pages/public/WorkshopLanding.tsx` (Major rewrite)

**Layout restructure:**
- Hero: Full-width gradient bg with centered content + floating form card
- Content sections animate in on scroll using `motion.div` with `whileInView`
- Cards use consistent `rounded-2xl` + shadow system

**Key style tokens:**
- `rounded-2xl` on all cards, inputs, buttons
- Primary shadow: `0 8px 30px -4px rgba(26,77,62,0.15)`
- Hover shadow: `0 16px 40px -4px rgba(26,77,62,0.25)`
- Background gradient: `linear-gradient(135deg, #1A4D3E 0%, #0F2F27 100%)`

**Animations added:**
- `motion.div` wrappers on hero text, form, each section
- `initial={{ opacity: 0, y: 30 }}` / `whileInView={{ opacity: 1, y: 0 }}`
- Stagger children using `transition={{ staggerChildren: 0.1 }}`
- Button hover: `whileHover={{ scale: 1.02 }}` / `whileTap={{ scale: 0.98 }}`

### File: `src/pages/portal/advisor/AdvisorSettings.tsx` (or equivalent)
- Add a photo upload section where advisors can upload their headshot
- Upload goes to backend storage, URL saved to `advisors.photo_url`

### Backend Function: Generate Brand Image
- Create a backend function that calls Nano Banana Pro to generate a workshop hero image
- Prompt: "Professional financial planning illustration, wealth growth concept, evergreen and gold color palette, clean modern design, abstract geometric shapes representing financial security"
- Store generated image in backend storage
- Use as hero background on landing pages

### Database
- No schema changes needed (photo_url column already exists on advisors)

## Summary of Files

| File | Action |
|------|--------|
| `src/pages/public/WorkshopLanding.tsx` | Major rewrite -- modern 3D animated design |
| `supabase/functions/generate-workshop-image/index.ts` | New -- AI image generation |
| Advisor portal photo upload | Enhancement to existing settings page |

