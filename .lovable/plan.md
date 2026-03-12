

## Plan: Modernize Headline Typography & "REMOVES IT" Animation

### Changes to `src/pages/TrainingEvent.tsx`

**1. "REMOVES IT" — All Caps with Rich Gradient Animation (lines 349-360)**
- Change text to `REMOVES IT` (all caps)
- Expand gradient to a 6-stop rainbow-gold sweep: `#B8945E → #F5E6C8 → #EDDB77 → #FFD700 → #F5E6C8 → #B8945E`
- Add a second layered animation: a pulsing `text-shadow` glow (`te-gold-glow`) that breathes alongside the gradient shift
- Speed up gradient to `3s` for more energy, add `backgroundSize: '600% 100%'` for wider travel

**2. New keyframe: `te-gold-glow` (add after line 250)**
- Pulsing gold text-shadow: `0 0 20px rgba(237,219,119,0.6)` → `0 0 40px rgba(200,169,110,0.8)` → back
- 3s cycle, synced with gradient

**3. Headline font upgrade (lines 340-346)**
- Switch to `fontWeight: 900` (black) for maximum impact
- Tighten tracking to `-0.05em`
- Add `fontFeatureSettings: "'ss01'"` for alternate stylistic set (Inter supports this)

**4. Mobile optimization (lines 340-360)**
- Headline `fontSize`: change clamp to `clamp(28px, 7vw, 54px)` — better scaling on small screens
- "REMOVES IT" span: add `padding: '2px 0'` to prevent gradient clipping on mobile
- Ensure `display: 'inline-block'` is preserved for proper rendering

### Files Modified
- `src/pages/TrainingEvent.tsx` — keyframes block, headline styles, gradient span

