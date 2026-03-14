

## Plan: Redesign Slide 13 — Negative Credit (Modern Glassmorphism + AI Portrait)

### 1. Generate image via edge function
- Use Nano banana pro (`google/gemini-3-pro-image-preview`) to generate a cinematic editorial photo of a stressed husband and wife sitting at a kitchen table reviewing bills and debt notices, warm dramatic lighting
- Save to `src/assets/couple-stressed-bills.png`

### 2. Full rewrite of `src/components/presentation/slides/Slide13_NegativeCredit.tsx`

**Layout:** Two-column editorial with glassmorphism cards on the left, BlobClip portrait on the right.

**Visual upgrades:**
- Each step row becomes a **glassmorphism card** with `backdrop-filter: blur(16px)`, semi-transparent backgrounds, rounded-2xl corners (no sharp squares)
- Subtle **radial glow highlights** behind each card for depth
- **Animated counting numbers** — dollar values and percentages animate up on reveal (counter effect from 0 to target)
- 3D hover tilt on step cards (perspective transform like Slide 12's LossCard)
- Warning pill gets a pulsing red glow border instead of flat red background
- BlobClip uses the generated stressed couple image with `variant={2}` and proper `imageStyle` positioning

**Reveal flow (keep 4 reveals):**
1. Title + subtitle (slam)
2. Step cards with animated counters (cardRise)
3. Warning pill (explode)
4. BlobClip portrait (right)

### 3. No changes needed to `PresentationViewer.tsx`
- Slide 13 already has `totalReveals: 4` which matches

