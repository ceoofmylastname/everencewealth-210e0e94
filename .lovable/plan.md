
# Improve Logo Visibility on White Backgrounds

## Problem

The gold-colored logo is difficult to see on white/light backgrounds on the Landing and Retargeting pages. The screenshot shows the logo appearing faint against the light footer area.

## Solution

Add a subtle shadow effect to the logo on white backgrounds across all affected pages. This will create visual separation without changing the logo itself.

---

## Technical Approach

We have two options:

### Option A: Drop Shadow (Recommended)
Add a subtle drop shadow using Tailwind's `drop-shadow` filter:
```tsx
className="... drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
```

### Option B: Background Container
Wrap the logo in a subtle container with a very light navy/dark background for contrast.

**Recommendation**: Option A (Drop Shadow) is cleaner and maintains the current design aesthetic while improving visibility.

---

## Files to Update

| File | Location | Change |
|------|----------|--------|
| `src/pages/RetargetingLanding.tsx` | Line 115 | Add drop-shadow to logo |
| `src/components/retargeting/RetargetingFooter.tsx` | Line 28 | Add drop-shadow to logo |
| `src/components/landing/LandingLayout.tsx` | Lines 200, 212 | Add drop-shadow to both mobile and desktop logos |
| `src/components/landing/Footer.tsx` | Line 21 | Add drop-shadow to footer logo |

---

## Code Changes

### 1. Retargeting Header (`src/pages/RetargetingLanding.tsx`)

**Line 115**:
```tsx
// Before
className="h-10 md:h-12 w-auto object-contain"

// After
className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
```

### 2. Retargeting Footer (`src/components/retargeting/RetargetingFooter.tsx`)

**Line 28**:
```tsx
// Before
className="h-12 md:h-14 w-auto object-contain"

// After
className="h-12 md:h-14 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
```

### 3. Landing Layout Header (`src/components/landing/LandingLayout.tsx`)

**Mobile Logo - Line 200**:
```tsx
// Before
className="h-8 sm:h-10 w-auto object-contain"

// After
className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
```

**Desktop Logo - Line 212**:
```tsx
// Before
className="h-12 md:h-14 w-auto object-contain"

// After
className="h-12 md:h-14 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
```

### 4. Landing Footer (`src/components/landing/Footer.tsx`)

**Line 21**:
```tsx
// Before
className="h-10 sm:h-12 w-auto object-contain"

// After
className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
```

---

## Result

The subtle drop shadow (20% opacity black) will:
- Create visual depth and separation from light backgrounds
- Make the gold logo "pop" without being too dramatic
- Maintain the premium, elegant aesthetic of the site
- Work consistently across all screen sizes and browsers
