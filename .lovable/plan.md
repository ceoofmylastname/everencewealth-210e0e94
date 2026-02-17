

## Make "Wealth Architecture" & "Strategic Fiduciary" Text Larger and More Modern

These are the decorative vertical side-labels in the Hero section, currently set at `text-[10px]` -- barely visible. Making them larger and more stylish will give the hero a more modern, high-end editorial feel.

### Changes

**File: `src/components/home/sections/Hero.tsx`**

For both the left ("Wealth Architecture") and right ("Strategic Fiduciary") side text elements:

1. **Increase font size** from `text-[10px]` to `text-xs md:text-sm` (12px to 14px) for a bolder presence
2. **Increase opacity** from `text-white/20` to `text-white/30` so the text is more visible without being distracting
3. **Widen letter spacing** from `tracking-[0.4em]` to `tracking-[0.5em]` for a more spacious, editorial look

| Property | Before | After |
|---|---|---|
| Font size | `text-[10px]` | `text-xs md:text-sm` |
| Opacity | `text-white/20` | `text-white/30` |
| Letter spacing | `tracking-[0.4em]` | `tracking-[0.5em]` |

Single file, two line changes. Purely visual update.
