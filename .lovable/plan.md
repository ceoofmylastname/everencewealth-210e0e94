

## Homepage Premium Overhaul -- $100K Webflow-Level Experience

Transform every section below the hero and stacking cards into a cohesive, cinematic experience with layered animations, glassmorphism, parallax depth, and interactive micro-interactions.

---

### Section-by-Section Upgrades

#### 1. WakeUpCall (White section with quote + stats)

**Current**: Plain white background, basic IntersectionObserver fade-in, flat styling.

**Upgrade**:
- Add a subtle animated grid pattern background (CSS-only, low opacity) for texture
- Quote card: glassmorphic treatment with `backdrop-blur`, rounded-3xl, inner glow gradient border, and a slow breathing scale animation on hover
- Stat number ($682 billion): animated counter with a spring-physics overshoot effect using framer-motion `useSpring`
- Tax trap bullet points: staggered slide-in from left with 50ms delays
- CTA button: magnetic hover effect (subtle pull toward cursor) + gold shimmer on hover
- Replace basic `useScrollReveal` with framer-motion `whileInView` for smoother orchestration

#### 2. WealthPhilosophy (Dark section with two comparison cards)

**Current**: Glass cards with basic x-axis slide-in animations.

**Upgrade**:
- Cards: Add hover tilt effect using `onMouseMove` to calculate rotation (3D perspective transform, max 4deg)
- Golden Cage vs Cash Flow cards: on hover, a colored glow appears behind the card (red glow for cage, emerald glow for cash flow)
- Income valuation table: rows animate in one by one with a typewriter-like number reveal
- Living benefits grid: cards float upward with scale on hover, icons get a 360deg spin animation on viewport entry
- Add a horizontal scroll marquee of brand trust badges between the comparison cards and the HLV section

#### 3. FiduciaryDifference (Evergreen background section)

**Current**: Flat `bg-white/10` cards, basic stagger.

**Upgrade**:
- Cards: deep glassmorphism (`bg-white/[0.06] backdrop-blur-xl rounded-3xl`) with inner top glow line
- Each card gets a numbered watermark (01, 02, 03) in the background at low opacity
- Hover: card lifts with emerald glow behind it (same pattern as SilentKillers)
- Badge row at bottom: each badge pulses once sequentially on viewport entry
- Add floating particles similar to SilentKillers for visual consistency

#### 4. TheGap (Light gray section with 3 stat cards + bridge steps)

**Current**: White rounded cards on light gray, basic motion.

**Upgrade**:
- Background: switch from flat `bg-light-gray` to a subtle gradient with a radial glow
- Stat cards: glassmorphic with colored top border (each card gets a different accent color)
- The stat numbers animate with a dramatic count-up + scale pulse when they land
- Cards hover: lift + shadow deepens + a subtle gradient sweep across the surface
- Bridge steps section: convert from flat grid to a connected timeline with animated connector lines that draw on scroll
- The numbered steps get a sequential "light up" animation as user scrolls through

#### 5. Services (White section with image banner + 3 cards)

**Current**: Standard bordered cards, basic stagger.

**Upgrade**:
- Image banner: add parallax scroll effect (image moves slower than content) + a glassmorphic overlay with the section title
- Service cards: glassmorphic dark treatment (`bg-dark-bg text-white`) instead of white-on-white, with rounded-3xl and the established inner glow pattern
- Icon containers: gradient ring with pulse on entry (matching SilentKillers pattern)
- Each card has a subtle gradient sweep animation on hover (left to right shine)
- "Learn More" link: animated underline that draws on hover + arrow slides

#### 6. HomepageAbout (Light section with image + facts)

**Current**: Basic two-column with a floating testimonial card.

**Upgrade**:
- Image: add a subtle Ken Burns (slow zoom) effect using CSS animation
- Testimonial card overlay: enhance with deeper glassmorphism and a gold left-border accent
- Facts grid: each fact animates its value with a counter (like Stats section) when entering viewport
- Add a decorative geometric shape (circle or rounded rectangle) behind the image that parallax-scrolls at a different rate
- The entire section gets a subtle warm gradient overlay

#### 7. Stats (Counter section)

**Current**: Plain white, basic counter animation, bordered container.

**Upgrade**:
- Dark background treatment to break the visual rhythm (dark section between light sections)
- Each stat gets its own glassmorphic card instead of a shared bordered container
- Numbers: add a glow effect behind the number text using text-shadow
- Add a subtle particle or sparkle effect that fires when counters complete
- Separator lines between stats become animated gradient lines that draw on scroll

#### 8. Assessment (Dark section with 3 step cards)

**Current**: Glass cards, decent but could be more dramatic.

**Upgrade**:
- Steps: add connected numbered circles with animated lines between them (horizontal on desktop, vertical on mobile)
- Each step card gets the deep glassmorphism + inner glow treatment
- Step numbers: large, styled as pill badges with gradient backgrounds
- CTA button: add a ripple effect on click + pulsing glow ring around it
- Background: add a slowly rotating radial gradient for depth

#### 9. FAQ (Accordion section)

**Current**: Basic glass-card accordion items.

**Upgrade**:
- Accordion items: enhanced glassmorphism with hover border brightening
- When an item opens, a subtle emerald glow pulses once behind it
- The trigger text gets a gold accent on the active/open state
- Add a decorative side element (vertical text or geometric accent)
- Smoother accordion animation with spring physics instead of basic ease

#### 10. CTA (Final call-to-action)

**Current**: Basic centered text + two buttons.

**Upgrade**:
- Add a large, animated gradient orb in the background (slowly morphing shape using CSS animation)
- Headline: words reveal one at a time with a stagger effect
- Primary CTA button: pulsing glow ring + magnetic hover effect
- Secondary CTA button: glass treatment with animated border gradient
- Add floating geometric shapes (subtle, low opacity) that drift slowly
- A subtle "scroll down to discover more" indicator if this isn't the last visible section

---

### Global Enhancements (Applied Across All Sections)

1. **Section Transitions**: Add smooth gradient dividers between sections instead of hard color cuts. Use CSS `background: linear-gradient()` on a thin strip between sections.

2. **Scroll Progress Indicator**: A thin gold progress bar at the very top of the page that fills as user scrolls.

3. **Consistent Animation Language**: All sections use the same easing curve `[0.16, 1, 0.3, 1]` for entries, spring physics for interactive hover states.

---

### Files to Change

| File | Change |
|---|---|
| `src/components/homepage/WakeUpCall.tsx` | Replace scroll reveal with framer-motion, add grid bg, enhance quote card, animated counter |
| `src/components/homepage/WealthPhilosophy.tsx` | Add 3D tilt hover, colored glows, icon spin, marquee |
| `src/components/homepage/FiduciaryDifference.tsx` | Deep glassmorphism, watermarks, particles, glow hover |
| `src/components/homepage/TheGap.tsx` | Gradient bg, glassmorphic stat cards, timeline bridge steps |
| `src/components/homepage/Services.tsx` | Dark glassmorphic cards, parallax image, gradient sweep hover |
| `src/components/homepage/HomepageAbout.tsx` | Ken Burns image, enhanced testimonial, counter facts |
| `src/components/homepage/Stats.tsx` | Dark bg, individual glass cards, glow numbers |
| `src/components/homepage/Assessment.tsx` | Connected step timeline, enhanced glass cards, ripple CTA |
| `src/components/homepage/FAQ.tsx` | Enhanced glassmorphism, glow on open, gold active state |
| `src/components/homepage/CTA.tsx` | Morphing gradient orb, staggered headline, pulsing CTA |
| `src/pages/Home.tsx` | Add scroll progress bar, section transition dividers |

No new dependencies required -- all effects use framer-motion (already installed) and Tailwind CSS.

