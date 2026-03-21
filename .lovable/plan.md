

## Add Fullscreen Presentation Mode

### What it does
Adds a "Fullscreen" button to the HUD that uses the browser's native Fullscreen API to make the presentation take over the entire screen — hiding the browser address bar, tabs, and OS taskbar. Escape or a button press exits fullscreen.

### Changes

**1. `src/components/presentation/PresentationViewer.tsx`**
- Add `isFullscreen` state tracking via `fullscreenchange` event listener
- Add `toggleFullscreen` function using `document.documentElement.requestFullscreen()` / `document.exitFullscreen()`
- Pass `isFullscreen` and `toggleFullscreen` down to `HUD`
- Map `f` key to toggle fullscreen

**2. `src/components/presentation/HUD.tsx`**
- Accept new `isFullscreen` and `onFullscreenToggle` props
- Add a fullscreen toggle button (Maximize2 / Minimize2 icons from lucide) next to the existing grid/sound/exit buttons

### Technical detail
- The `.antigravity-shell` already uses `position: fixed; inset: 0; z-index: 50`, so once the browser enters native fullscreen the presentation fills the entire display with no browser chrome visible.
- The `fullscreenchange` event keeps React state in sync if the user exits via Escape (browser-level).

