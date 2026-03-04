

## Plan: Fix Build Errors + Add Confetti & Congratulations Popup

### Issues Found

1. **Build errors** in `TrainingEvent.tsx`:
   - `ChevronLeft` is used (lines 285, 313) but not imported
   - `ease: "easeOut"` / `"easeIn"` typed as `string` instead of the `Easing` literal type required by framer-motion's `Variants`

2. **Form works** -- the edge function `register-training-event` exists and correctly saves to `recruit_leads` and sends a confirmation email via Resend. No backend changes needed.

3. **Missing features**: Brand-colored confetti burst and a rich congratulations screen on success.

---

### Changes to `src/pages/TrainingEvent.tsx`

**Fix 1 -- Add missing import**
Add `ChevronLeft` to the lucide-react import on line 8.

**Fix 2 -- Fix `ease` type error**
Cast the `formVariants` object using `as const` so TypeScript infers literal types instead of `string`:

```ts
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" as const } }
};
```

**Enhancement -- Brand confetti + congratulations popup**

Replace the current plain success screen (lines 82-117) with:

- **Gold confetti burst** using `canvas-confetti` (already installed) with brand colors `#C5A059`, `#1A4D3E`, `#F2E0B2`, `#ffffff` -- multiple bursts for a dramatic effect
- **Congratulations card** showing:
  - Animated check icon
  - "Congratulations, {firstName}!" heading
  - Session highlights list from the existing `sessionHighlights` array
  - Event date: March 21, 2026
  - Event time: 11:00 AM - 4:00 PM PT
  - Venue: Andaz Napa
  - Everence Wealth branding with logo
  - "Return Home" button

The confetti fires automatically via `useEffect` when `success` becomes `true`.

