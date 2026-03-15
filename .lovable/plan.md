

# Slide 10 — 60 Minutes: Modern Redesign with YouTube Video & AI Thumbnail

## Overview
Complete redesign of `Slide10_SixtyMinutes.tsx`: white background, rounded corners throughout, embedded YouTube video (click-to-play), and an AI-generated thumbnail via the existing `generate-image` edge function. Quote cards get glassmorphism + animated rotating borders matching Slide 07's pattern.

## Changes

### 1. White Background & Modern Layout
- Switch from `#1A4D3E` to white (`#FAFAF8`)
- All text colors updated for light background contrast
- All corners fully rounded (`rounded-2xl`, `rounded-full` for pill)

### 2. YouTube Video Embed (Click to Play)
- Embed `https://www.youtube.com/embed/eNo9HLgbax0` with no autoplay
- Show an AI-generated thumbnail as a poster overlay; user must click a play button to start
- Play button: centered, rounded, semi-transparent overlay with a play icon
- On click, replace thumbnail with the iframe (state toggle)

### 3. AI-Generated Thumbnail
- On first mount, call `supabase.functions.invoke('generate-image')` with a prompt like: *"60 Minutes CBS news broadcast studio set with dramatic lighting, television screens showing 401k retirement crisis headlines, professional news desk, cinematic broadcast atmosphere, ultra-realistic, 4K resolution, crisp sharp details, no text, no watermarks"*
- Dimensions: `16:9`
- Cache the generated URL in component state; show a subtle loading shimmer while generating
- Fallback: a styled gradient placeholder if generation fails

### 4. Quote Cards — Glassmorphism + Animated Borders
- Reuse the animated `conic-gradient` rotating border pattern from Slide 07
- Each card: `backdrop-filter: blur(16px)`, `rgba(255,255,255,0.7)` bg, `rounded-2xl`
- CSS keyframe `@keyframes slide10BorderRotate` (or reuse slide07's)

### 5. Bottom Pill
- Fully rounded (`rounded-full`), gold gradient, no sharp corners

### 6. Reveal Sequence (4 reveals, unchanged count)
1. Video player with thumbnail
2. Quote cards
3. Divider
4. Bottom pill

## Files to Edit
1. **`src/components/presentation/slides/Slide10_SixtyMinutes.tsx`** — Full rewrite with video embed, AI thumbnail, glassmorphism cards, animated borders
2. No change to `PresentationViewer.tsx` (totalReveals stays at 4)

