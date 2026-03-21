

## Add Clicker Support to Presentation Mode

### Problem
The keyboard handler already supports Space, Enter, ArrowRight (advance) and ArrowLeft (back), which covers most clickers. However, standard presentation clickers also send **PageDown** (advance) and **PageUp** (back) — these are not currently handled, so clickers won't work.

### Change

**File: `src/components/presentation/PresentationViewer.tsx`** (lines ~142-148)

Add `PageDown` and `PageUp` to the existing keyboard handler:
- `PageDown` → advance (same as ArrowRight)
- `PageUp` → back (same as ArrowLeft)

This is a two-line addition to the existing key handler switch. No new files or components needed.

### Why this works
Presentation clickers (Logitech Spotlight, Kensington, etc.) emit standard keyboard events — typically `PageDown`/`PageUp` or `ArrowRight`/`ArrowLeft`. By adding PageDown/PageUp support, the presentation will respond to virtually all wireless clickers out of the box. The existing fullscreen mode (F key / HUD button) already hides the browser chrome for a clean presentation experience.

