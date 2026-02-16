

# Phase 9.9.2 -- Hero Visual Match to Reference Screenshot

## Overview
Restyle the hero section to match the uploaded screenshot while keeping all existing stage-based animations, particles, mesh gradients, and scan line intact.

## Visual Differences from Current

The reference screenshot shows several layout and content changes:

### 1. Top Badge (NEW)
- Rounded pill/capsule at the top center: "ESTABLISHED 1998 · INDEPENDENT FIDUCIARY"
- Bordered, semi-transparent background, uppercase tracking
- Appears at stage 1

### 2. Typography Layout Change
- **"BRIDGE"** and **"the"** are on the SAME line (not stacked)
- "BRIDGE" is massive bold white (~12vw), "the" is smaller and lighter beside it
- Currently they're combined as "BRIDGE the" in one span -- needs to be split so "BRIDGE" is bolder/larger

### 3. Subline Content Change
- Replace the dot-separated tagline with a two-line message:
  - Line 1: "Stop funding Wall Street's wealth." (white, normal weight)
  - Line 2: "Start building yours." (italic, emerald/primary color)
- Below that, small caps text: "YOU'VE BEEN SOLD A MYTH. SAVE AND HOPE? THAT'S A GAMBLE. WE RECLAIM CONTROL."

### 4. Bottom HUD Panel Redesign
- Three-column layout instead of current two-part layout
- Left: "SYSTEM STATUS" label + "ANALYSIS ACTIVE" with green dot
- Center: "CURRENT PROTOCOL" label + "Tax-Free Bucket Optimization" (bold)
- Right: "BEGIN ASSESSMENT" button (dark bg, bordered, not filled green)
- Wider panel (max-w-4xl instead of max-w-2xl)

### 5. Corner Decorations
- Bottom-left: "01" in small muted text
- Top-right: "2028" in small emerald text
- Both appear at stage 4

### 6. Remove Scroll Indicator
- The chevron scroll indicator is not present in the reference -- remove it

## Technical Changes

### File: `src/components/home/sections/Hero.tsx`
- Split "BRIDGE the" into two separate motion spans on the same line -- "BRIDGE" at ~12vw bold, "the" at ~4vw lighter
- Add a top badge pill element gated on stage >= 1
- Replace subline with the two-line "Stop funding..." message + small caps manifesto line
- Redesign HUD panel to 3-column grid with labels
- Change CTA button to bordered/outline style with "BEGIN ASSESSMENT" text
- Add "01" bottom-left and "2028" top-right corner text
- Remove the ChevronDown scroll indicator

### No other files need changes -- all animations, CSS utilities, fonts, and tailwind config remain as-is.

