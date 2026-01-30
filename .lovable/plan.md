

# Mobile UI Optimization for Brochure Pages

## Issues Identified

Based on your screenshots, I can clearly see the text overlap problem on the Marbella brochure page:

| Element | Current Position | Problem |
|---------|------------------|---------|
| Trust Signals (API Registered, 35+ Years, 1000+ Buyers) | `top-20` (80px) | Renders on same vertical space as breadcrumb on mobile |
| Breadcrumb (Home > Locations > Marbella) | `top-32` (128px) | Only 48px gap from trust signals - too close on small screens |
| Trust signals wrap to 2 lines on narrow screens | - | Creates overlap with breadcrumb below |

The Header component is `position: fixed` and takes approximately 80px of height. On mobile, the trust signals start at 80px from top, but the breadcrumb is only 48px below - when trust signals wrap to multiple lines, they overlap.

---

## Solution: Mobile-Optimized Brochure Hero

### 1. Fix Trust Signals & Breadcrumb Overlap

**File:** `src/components/brochures/BrochureHero.tsx`

- Hide trust signals on mobile (they already appear in the header area site-wide)
- On mobile, only show the breadcrumb positioned lower to avoid header overlap
- Keep trust signals visible on desktop (`md:flex`)

**Current (lines 100-116):**
```tsx
<div className={`absolute top-20 left-0 right-0 z-20 ...`}>
  <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
```

**Change to:**
```tsx
<div className={`absolute top-24 left-0 right-0 z-20 ... hidden md:block`}>
  <div className="flex items-center justify-center gap-10">
```

- Add `hidden md:block` to hide trust signals on mobile
- Increase desktop top position to `top-24` for better spacing below header

### 2. Fix Breadcrumb Mobile Positioning

**File:** `src/components/brochures/BrochureHero.tsx` (lines 118-133)

**Current:**
```tsx
<div className={`absolute top-32 left-0 right-0 z-20 ...`}>
```

**Change to:**
```tsx
<div className={`absolute top-20 md:top-36 left-0 right-0 z-20 ...`}>
```

- Mobile: `top-20` (80px) - right below header
- Desktop: `top-36` (144px) - below trust signals bar

### 3. Improve Main Content Mobile Padding

**File:** `src/components/brochures/BrochureHero.tsx` (line 136)

**Current:**
```tsx
<div className="relative z-10 container mx-auto px-4 text-center pt-40 pb-32">
```

**Change to:**
```tsx
<div className="relative z-10 container mx-auto px-4 text-center pt-32 md:pt-48 pb-24 md:pb-32">
```

- Reduce mobile top padding since we removed the trust signals bar
- Reduce mobile bottom padding for better proportions

### 4. Optimize Hero Headline Font Sizes

**File:** `src/components/brochures/BrochureHero.tsx` (line 146)

**Current:**
```tsx
<h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl ...">
```

**Change to:**
```tsx
<h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl ...">
```

- Add smaller base size (`text-3xl`) for narrow mobile screens
- Add intermediate `sm:text-4xl` breakpoint

### 5. Optimize CTA Buttons for Mobile

**File:** `src/components/brochures/BrochureHero.tsx` (lines 199-223)

**Current:**
```tsx
<div className="flex flex-col sm:flex-row gap-4 ...">
  <Button ... className="... px-10 py-7 ...">
```

**Change to:**
```tsx
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-md mx-auto sm:max-w-none ...">
  <Button ... className="... px-6 sm:px-10 py-5 sm:py-7 w-full sm:w-auto text-sm sm:text-base ...">
```

- Constrain button width on mobile with `max-w-md`
- Reduce padding on mobile
- Smaller font size on mobile

---

## Additional Mobile Optimizations

### 6. Investment Highlights Stats - Better Mobile Grid

**File:** `src/components/brochures/InvestmentHighlights.tsx` (line 136)

**Current:**
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
```

**Change to:**
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
```

- Tighter gaps on mobile for better fit

### 7. Investment Stats - Smaller Mobile Values

**File:** `src/components/brochures/InvestmentHighlights.tsx` (line 157)

**Current:**
```tsx
<div className="text-4xl md:text-5xl font-serif font-bold ...">
```

**Change to:**
```tsx
<div className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold ...">
```

- Smaller stat values on narrow mobile screens

### 8. Lifestyle Features - Better Mobile Padding

**File:** `src/components/brochures/LifestyleFeatures.tsx` (line 73)

**Current:**
```tsx
<div className="h-full p-8 rounded-2xl ...">
```

**Change to:**
```tsx
<div className="h-full p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl ...">
```

- Reduced padding on mobile
- Smaller border radius on mobile

### 9. Opt-in Form - Mobile Responsiveness

**File:** `src/components/brochures/BrochureOptInForm.tsx** (line 249)

**Current:**
```tsx
<form ... className="... p-8 md:p-10 ...">
```

**Change to:**
```tsx
<form ... className="... p-5 sm:p-8 md:p-10 ...">
```

- Reduced form padding on small mobile screens

---

## Summary of Changes

| File | Changes |
|------|---------|
| `BrochureHero.tsx` | Hide trust signals on mobile, fix breadcrumb positioning, optimize headline sizes, improve CTA buttons |
| `InvestmentHighlights.tsx` | Smaller gaps and font sizes on mobile |
| `LifestyleFeatures.tsx` | Reduced padding on mobile |
| `BrochureOptInForm.tsx` | Reduced form padding on mobile |

These changes will:
1. **Eliminate the text overlap** between trust signals and breadcrumb
2. **Improve readability** with appropriately sized text
3. **Better touch targets** with properly sized buttons
4. **Better spacing** throughout the page on mobile devices

