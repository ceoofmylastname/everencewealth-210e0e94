
# Retargeting Landing Page - Phase 1 (English Only)

## Overview

Create a calm, educational retargeting landing page at `/en/welcome-back` for visitors who previously visited but didn't convert. This page emphasizes understanding over selling, with spacious design and zero-pressure approach.

## File Structure

```text
src/
├── pages/
│   └── RetargetingLanding.tsx          (main page component)
│
├── components/
│   └── retargeting/
│       ├── RetargetingHero.tsx         (Section 1)
│       ├── RetargetingIntro.tsx        (Section 2)
│       ├── RetargetingVisualContext.tsx (Section 3)
│       ├── RetargetingTestimonials.tsx  (Section 4)
│       ├── RetargetingPositioning.tsx   (Section 5 - KEY)
│       ├── RetargetingProjects.tsx      (Section 6)
│       ├── RetargetingForm.tsx          (Section 7)
│       └── RetargetingFooter.tsx        (Section 8)
```

---

## Component Specifications

### 1. RetargetingHero.tsx

**Purpose:** Calm, spacious hero with single video CTA

**Design:**
- Height: 85vh on desktop, 80vh on mobile
- Background: Soft gradient (`bg-gradient-to-br from-slate-50 via-white to-stone-100`)
- Content centered, max-width 900px

**Content:**
- H1 (Playfair Display serif, 48-56px): "Understand the Costa del Sol property market — calmly and independently."
- Subheadline (18-20px, light weight): "Clear explanations, structured insight and human expertise — before you speak to anyone."
- Single gold button: "▶ Watch the 60-second overview" (non-functional in Phase 1)

**Rules enforced:**
- NO form, NO secondary CTA, NO property images
- ONE button only

---

### 2. RetargetingIntro.tsx

**Purpose:** Single paragraph bridge after hero

**Design:**
- White background
- Centered text, max-width 700px
- Padding: 80px top/bottom (60px mobile)

**Content:**
- Body text (18px): "In one minute, you'll see how we help people understand the market before making any decisions."

---

### 3. RetargetingVisualContext.tsx

**Purpose:** Visual positioning with brand philosophy statement

**Design:**
- Background: Soft cream (`#faf9f7`) or light gray (`#f8f9fa`)
- Two-column on desktop (image left, text right), stacked on mobile
- Padding: 100px top/bottom

**Content:**
- Placeholder image (abstract research/documents visual)
- Statement: "We start with explanation, not listings."
- Typography: Serif italic, 24-28px, understated

---

### 4. RetargetingTestimonials.tsx

**Purpose:** Social proof focused on understanding, not sales

**Design:**
- White background
- Padding: 100px top/bottom
- 3-column grid on desktop, stacked on mobile

**Content:**
- Title: "Why people start with us — before looking at property"
- Subline: "Experiences from people who wanted clarity before taking the next step."
- Three testimonial cards with clean white styling, subtle shadows

**Testimonials:**
1. Michael & Sarah, UK: Process understanding focus
2. Erik, Netherlands: Trust-building focus
3. Thomas & Anna, Germany: Education-first focus

**Card styling:**
- Quote marks (subtle `"`)
- NO star ratings, NO badges
- Country flags using existing `/flags/*.svg`

---

### 5. RetargetingPositioning.tsx (KEY SECTION)

**Purpose:** Emotional center of the page - brand philosophy statement

**Design:**
- Navy background (`#1a1f2e`)
- White text (per memory: solid white requirement)
- EXTRA padding: 120px top/bottom (more than other sections)
- Centered content, very spacious

**Content:**
- Main copy (Playfair Display, 32-40px):
  ```
  "We don't begin with properties.
  We begin with understanding."
  ```
- Supporting line (18-20px, margin-top):
  "Locations, timing, legal context and lifestyle — explained first."

**Rules enforced:**
- NO CTA button
- NO links
- Maximum breathing room

---

### 6. RetargetingProjects.tsx

**Purpose:** Context examples only, NOT a sales catalogue

**Design:**
- Light background (white or `#f8f9fa`)
- Padding: 100px top/bottom
- 3-4 property cards in grid

**Content:**
- Intro copy:
  ```
  "Some visitors prefer to explore examples first."
  "Below is a small, curated selection for context only."
  ```
- Simplified property cards with:
  - Image
  - Location name
  - Brief description
  - Subtle "View details →" text link (NOT a button)

**Card styling enforced:**
- NO urgency badges
- NO price emphasis
- NO "Hot property" labels
- Muted, calm presentation

**Data source:** Fetch 3-4 properties from existing `properties` table or use static placeholder data for Phase 1

---

### 7. RetargetingForm.tsx

**Purpose:** Optional information request, zero pressure

**Design:**
- Background: Soft cream (`#faf9f7`)
- Centered form, max-width 500px
- Padding: 100px top/bottom

**Content:**
- Title: "Receive written information if and when you want it."
- Optional subline: "No obligation. No next step implied."

**Form fields:**
- First Name (text, optional)
- Email (email, required)
- "What would you like to understand better?" (textarea, optional)

**Submit button:**
- Text: "Request information" (ONLY this label)
- Style: Muted gold (`#c9a962`), NOT bright/aggressive
- Auto-width, centered

**Phase 1 behavior:**
- Show success message on submit: "Thank you. We'll send you information shortly."
- No backend integration (Phase 2)

---

### 8. RetargetingFooter.tsx

**Purpose:** Minimal, calm footer different from main site

**Design:**
- Navy background (`#1a1f2e`)
- Padding: 60px top/bottom
- Minimal content

**Content:**
- Logo: "DELSOLPRIMEHOMES" (white/gold)
- Copyright: "© 2026 Del Sol Prime Homes"
- Optional: Privacy Policy, Terms links
- NO social media icons
- NO newsletter signup

---

## Main Page Component: RetargetingLanding.tsx

**Responsibilities:**
- Assembles all 8 sections in order
- Minimal header with just logo (calmer than full nav)
- Uses existing LanguageProvider context

**Structure:**
```tsx
<div className="min-h-screen bg-white">
  {/* Minimal Header */}
  <header>...</header>
  
  {/* Sections */}
  <RetargetingHero />
  <RetargetingIntro />
  <RetargetingVisualContext />
  <RetargetingTestimonials />
  <RetargetingPositioning />
  <RetargetingProjects />
  <RetargetingForm />
  <RetargetingFooter />
</div>
```

---

## Routing Update

**File:** `src/App.tsx`

Add after landing pages section (around line 296):

```tsx
{/* Retargeting Landing Page (English) */}
<Route path="/en/welcome-back" element={<RetargetingLanding />} />
```

---

## Technical Implementation Details

### Color Palette (Muted)

| Element | Hex | Usage |
|---------|-----|-------|
| Primary Background | #ffffff | Most sections |
| Secondary Background | #f8f9fa / #faf9f7 | Alternate sections |
| Dark Section | #1a1f2e | Positioning block, footer |
| Text Primary | #1a1f2e | Headlines, body |
| Text Secondary | #6b7280 | Subtext |
| Muted Gold | #c9a962 | CTA button (softer than main site #C4A053) |

### Typography

| Element | Font | Size | Notes |
|---------|------|------|-------|
| H1 Hero | Playfair Display | 48-56px desktop, 32-40px mobile | Serif, elegant |
| H2 Sections | Sans-serif (Lato) | 32-36px desktop, 24-28px mobile | Clean |
| Body | Sans-serif (Lato) | 16-18px | Line-height 1.7 |
| Positioning | Playfair Display | 32-40px | Serif, centered |

### Animations

- Use `framer-motion` for section reveals (existing pattern)
- Subtle fade-in-up on scroll
- No aggressive animations - calm transitions

### Responsive Breakpoints

- Mobile: Default (< 768px)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/RetargetingLanding.tsx` | Main page |
| `src/components/retargeting/RetargetingHero.tsx` | Hero section |
| `src/components/retargeting/RetargetingIntro.tsx` | Intro paragraph |
| `src/components/retargeting/RetargetingVisualContext.tsx` | Visual + statement |
| `src/components/retargeting/RetargetingTestimonials.tsx` | 3 testimonials |
| `src/components/retargeting/RetargetingPositioning.tsx` | Navy positioning block |
| `src/components/retargeting/RetargetingProjects.tsx` | Property examples |
| `src/components/retargeting/RetargetingForm.tsx` | Information request form |
| `src/components/retargeting/RetargetingFooter.tsx` | Minimal footer |

**Files to modify:**
| File | Change |
|------|--------|
| `src/App.tsx` | Add route for `/en/welcome-back` |

**Total: 9 new files + 1 modification**

---

## Implementation Order

1. Create `src/components/retargeting/` directory
2. Build components in section order (Hero → Footer)
3. Create `RetargetingLanding.tsx` page
4. Add route to `App.tsx`
5. Test and verify against checklist

---

## Verification Checklist

After implementation, confirm:

**Hero:**
- [ ] ONE button only (video CTA)
- [ ] No forms
- [ ] No secondary CTAs
- [ ] 85vh height, spacious

**Language:**
- [ ] No "Book a Call" anywhere
- [ ] No "Schedule" anywhere
- [ ] No urgency language
- [ ] No "limited" or "exclusive"

**Positioning Section:**
- [ ] NO CTA button
- [ ] 120px padding (extra breathing room)
- [ ] Navy background with white text

**Projects Section:**
- [ ] Context feel, NOT sales
- [ ] No urgency badges
- [ ] Subtle "View details" links

**Form:**
- [ ] Button says "Request information" only
- [ ] Muted gold styling
- [ ] Optional feel

**Overall:**
- [ ] Calm, spacious, educational feel
- [ ] Mobile responsive
- [ ] Typography hierarchy clear
- [ ] Colors muted/soft

---

## Not Included in Phase 1

- Video modal functionality
- Form submission to backend
- Other 9 language translations
- Hreflang tags / SEO meta
- Analytics tracking
- Emma chatbot integration
