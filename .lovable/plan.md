

# Slide 04 — Fix Reveal Sequencing and Restore Image

## Problem
1. All 3 mission blocks appear to load together instead of one-by-one via user clicks
2. The advisor image on the right side is not showing — its reveal index (5) exceeds the slide's `totalReveals` (4)

## Changes

### 1. Update `totalReveals` in PresentationViewer.tsx
Change slide 4 config from `{ totalReveals: 4 }` to `{ totalReveals: 5 }` so the image at index 5 gets revealed.

### 2. Verify Slide04_OurMission.tsx reveal indices
The current indices are already correct for sequential reveal:
- Index 1: Title ("Our Mission")
- Index 2: First mission block
- Index 3: Second mission block  
- Index 4: Third mission block
- Index 5: Advisor image (right side)

Each `advance()` call increments `revealIndex` by 1, so blocks reveal one at a time. The only fix needed is the totalReveals config.

## Files to Edit
1. `src/components/presentation/PresentationViewer.tsx` — line 72: change totalReveals from 4 to 5

