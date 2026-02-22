

# Embed Videos Inline + Confirm Active Links

## Current Behavior
All three buttons open links in a new tab via `window.open()`. The buttons are active and working correctly with tracking.

## Changes to `SureLCSetup.tsx`

### 1. Embed YouTube Videos Inline
For the two video buttons (Video 1 and Video 2), clicking will:
- Still track the click in `contracting_activity_logs` (same as now)
- Instead of opening a new tab, toggle an embedded YouTube iframe directly below the button card
- The iframe uses the YouTube embed URL with autoplay enabled
- A second click collapses the video
- The video stays visible and playable within the dashboard -- no navigation away

The YouTube URLs will be converted to embed format:
- `https://www.youtube.com/watch?v=6Sc1qas71SU` becomes `https://www.youtube.com/embed/6Sc1qas71SU?autoplay=1`
- `https://www.youtube.com/watch?v=xWrbs1tcxsI` becomes `https://www.youtube.com/embed/xWrbs1tcxsI?autoplay=1`

### 2. SureLC Register Button Stays as External Link
The third button ("Create Your SureLC Profile") continues to open in a new tab since it's an external registration portal, not a video.

### 3. State Management
- Add `activeVideo` state (`string | null`) to track which video is currently expanded
- Clicking a video button toggles that video's iframe visibility
- Only one video can be open at a time (clicking another collapses the first)

### Visual Design
- The iframe appears with a smooth expand animation below the clicked card
- 16:9 aspect ratio, rounded corners, subtle shadow
- Matches the existing brand aesthetic with the green/gold palette

## Files Modified

| File | Action |
|---|---|
| `SureLCSetup.tsx` | Add inline video iframe toggle for video buttons, keep external redirect for register button |

No database or routing changes needed.

