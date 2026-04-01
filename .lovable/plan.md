

## Update Response Card — White Background with Subtle Green Gradients

### What changes
Restyle `src/pages/ResponseCard.tsx` from the current dark theme (`#080f0b`) to a **white background** with subtle green gradient accents bleeding in from corners/edges.

### Color swap overview
| Element | Current | New |
|---|---|---|
| Page background | `#080f0b` (dark) | `white` with faint green radial gradients in corners |
| Text (headings) | `text-white` | `text-[#1A4D3E]` (evergreen) |
| Text (body/labels) | `text-white/40`, `text-white/30` | `text-[#4A5565]`, `text-gray-400` |
| Inputs | `bg-white/5 border-white/10 text-white` | `bg-gray-50 border-gray-200 text-gray-900` |
| Pills/cards unselected | `bg-white/5 border-white/10 text-white/60` | `bg-gray-50 border-gray-200 text-gray-600` |
| Pills/cards selected | `bg-[#C8A96E]/15 border-[#C8A96E]` | Keep gold accent, slightly stronger on white |
| Nav bar | `border-white/5` dark | `border-gray-100` light, logo normal (remove `invert`) |
| Progress bar track | `bg-white/5` | `bg-gray-100` |
| Footer nav | `border-white/5` | `border-gray-100` |
| Back button | `text-white/40` | `text-gray-400` |
| Continue/Submit | Keep gold `#C8A96E` | Same, adjust shadow for light bg |
| Error text | `text-red-400` | `text-red-500` |
| Success screen | Dark glassmorphism | White card with soft green gradient bg, green shadow |

### Green gradient accents
Add decorative radial gradients using absolute-positioned divs:
- Top-right corner: faint `#1A4D3E` at ~5-8% opacity, large blur
- Bottom-left corner: faint `#1A4D3E` at ~3-5% opacity, large blur
- Creates a subtle, organic "barely coming in" effect

### File modified
- `src/pages/ResponseCard.tsx` — full color/style update, no logic changes

