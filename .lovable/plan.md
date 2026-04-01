

## Fix: Move Scroll Fade Cues Inside the Agent List Container

### Problem
The top/bottom gradient fade indicators ("scroll cues") are rendering on the backdrop overlay behind the bottom sheet, not inside the scrollable agent list where they belong.

### Fix
In `src/pages/ResponseCard.tsx`, add sticky top/bottom gradient fades **inside** the scrollable agent list div (lines 311-332):

1. Add `relative` to the scrollable container class
2. Add a sticky top fade: `<div className="pointer-events-none sticky top-0 h-6 bg-gradient-to-b from-white to-transparent" />`  — placed before the advisor `.map()`
3. Add a sticky bottom fade: `<div className="pointer-events-none sticky bottom-0 h-6 bg-gradient-to-t from-white to-transparent" />` — placed after the advisor `.map()`

These stay pinned at the top/bottom of the scroll viewport, giving a visual cue that more content exists above/below.

### File
- `src/pages/ResponseCard.tsx` — ~3 lines added inside the scroll container

