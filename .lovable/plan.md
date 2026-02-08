
# Add Video Timeline Controls to Retargeting Videos

## Current Issue

The videos on the retargeting page (`/{lang}/welcome-back`) are missing visible timeline controls, making it impossible for users to see their progress or scrub through the video.

| Component | Current State | Issue |
|-----------|---------------|-------|
| `RetargetingAutoplayVideo` | No `controls` attribute | No timeline visible |
| `RetargetingVideoModal` | Has `controls` attribute | Timeline should work, but styling may hide it |

---

## Solution

Add the `controls` attribute to the autoplay video section so users can see the native browser video controls, including the progress timeline.

---

## Technical Changes

### File: `src/components/retargeting/RetargetingAutoplayVideo.tsx`

**Change 1: Add `controls` attribute to video element**

Update line 90-98:

```tsx
// Before
<video
  ref={videoRef}
  src={videoUrl || undefined}
  poster={RETARGETING_VIDEO_THUMBNAIL}
  className="w-full aspect-video object-cover"
  loop
  muted
  playsInline
  preload="auto"
/>

// After
<video
  ref={videoRef}
  src={videoUrl || undefined}
  poster={RETARGETING_VIDEO_THUMBNAIL}
  className="w-full aspect-video object-cover"
  loop
  muted
  playsInline
  preload="auto"
  controls
/>
```

This single change adds the native video controls including:
- Play/Pause button
- **Progress timeline** (scrubbing bar)
- Volume control
- Fullscreen toggle
- Current time / Duration display

---

## Video Modal Already Has Controls

The `RetargetingVideoModal.tsx` component already includes `controls` on line 106:
```tsx
<video
  src={videoUrl}
  className="w-full h-full object-cover"
  controls  // <-- Already present
  autoPlay
  muted
  playsInline
/>
```

This modal opens when users click the play button in the Hero section and already displays the timeline.

---

## Result

After this change:
- Users on all 10 language versions of `/welcome-back` will see the video timeline
- They can scrub through the video to any point
- Native browser controls will display time elapsed and total duration
- Works consistently across all browsers

---

## Summary

| Location | Change |
|----------|--------|
| `RetargetingAutoplayVideo.tsx` | Add `controls` attribute to `<video>` element |
| `RetargetingVideoModal.tsx` | No changes needed (already has controls) |
