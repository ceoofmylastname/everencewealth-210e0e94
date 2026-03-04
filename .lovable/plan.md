

## Plan: Update Headline, Subheadline, Animated Gradient, Slash Underline & Mobile-First Optimization

### Changes to `src/pages/TrainingEvent.tsx`

**1. New Headline & Subheadline (lines 250-260)**

Replace the current headline/subheadline with:
- **Headline**: "Your Strategy Has a Ceiling. This Day Removes It."
- **"Ceiling"** gets an animated moving gradient (gold shimmer) + a modern SVG slash underline beneath it
- **"Removes It"** gets highlighted with a glowing gold background pill
- **Subheadline**: "Join Everence Wealth at Andaz Napa for a full-day intensive designed to sharpen your strategy, expand your carrier access, and position you ahead of brokers still playing the old game."

**2. Animated Gradient + Slash Underline**

Add a CSS `@keyframes gradient-shift` animation (or use inline Tailwind `animate-gradient` already referenced). The word "Ceiling" will have:
- `bg-gradient-to-r from-[#C5A059] via-[#F2E0B2] to-[#C5A059]` with `bg-clip-text text-transparent` and `animate-gradient bg-[length:200%_auto]`
- An inline SVG slash line positioned underneath via `relative` + `absolute bottom-0` styling

The word "Removes It" gets a subtle gold highlight: `bg-[#C5A059]/20 px-2 rounded`

**3. Add `@keyframes gradient-shift` to `src/index.css`**

```css
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient {
  animation: gradient-shift 3s ease infinite;
}
```

**4. Mobile-First Optimization (throughout the file)**

- **Hero section**: Change `pt-20 pb-12 lg:pt-32 lg:pb-24` to `pt-12 pb-8 lg:pt-32 lg:pb-24`, reduce `min-h-[85vh]` to `min-h-[auto] lg:min-h-[85vh]`
- **Headline**: Scale down from `text-6xl md:text-8xl` to `text-[2rem] leading-[1.15] sm:text-4xl md:text-6xl lg:text-7xl`
- **Subheadline**: `text-base sm:text-lg md:text-xl lg:text-2xl`
- **Navbar**: Reduce padding `p-4 md:p-6 md:px-12`, ensure logo + badge fit on small screens
- **Form card**: `p-6 sm:p-8 md:p-12`, `min-h-[320px] sm:min-h-[400px]`
- **Event detail grid**: Stack on mobile with `grid-cols-1 sm:grid-cols-2`
- **Info section**: `py-12 sm:py-16 lg:py-24`, `gap-10 lg:gap-20`
- **Session highlights circles**: `w-10 h-10 sm:w-12 sm:h-12`
- **Touch targets**: Ensure all buttons remain at least 44px tall (already satisfied with `h-14`/`h-16`)
- **Parallax**: Disable on mobile by conditionally applying `style={{ y: y1 }}` only on desktop, or simply keep it (framer-motion handles touch well)
- **Success screen**: `p-6 sm:p-10 md:p-14`, session highlights grid `grid-cols-1 sm:grid-cols-2`
- **Badge pill**: `text-[0.65rem] sm:text-sm` with tighter padding on mobile

