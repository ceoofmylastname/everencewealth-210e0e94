

## Plan: Modernize Venue Icon Element with Hotel Image and Animated Border

The selected element (line 312) is the icon box showing a MapPin icon above "Andaz Napa" in the registration card's step 0. The project already has `/andaz-napa.png` used elsewhere on the page (line 438).

### Changes to `src/pages/TrainingEvent.tsx` (lines 312-314)

Replace the current gradient icon box with:

1. **Hotel image** instead of MapPin icon — use the existing `/andaz-napa.png` with `object-cover` in a larger container (e.g. `w-24 h-24 sm:w-28 sm:h-28`)
2. **Neon rotating border** — wrap with the existing `neon-border` class from `src/styles/neon-prestige.css` which provides a conic-gradient animated border
3. **3D depth** — add deep shadow (`shadow-[0_12px_40px_-8px_rgba(197,160,89,0.3)]`), slight hover lift, and `overflow-hidden rounded-2xl`
4. **Modern feel** — `backdrop-blur`, subtle inner glow via `ring-1 ring-white/10`

```tsx
// From (lines 312-314):
<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#1A4D3E] to-[#0A120F] rounded-2xl flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
    <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-[#C5A059]" />
</div>

// To:
<div className="neon-border w-24 h-24 sm:w-28 sm:h-28 mx-auto shadow-[0_12px_40px_-8px_rgba(197,160,89,0.3)] rounded-2xl">
    <img
        src="/andaz-napa.png"
        alt="Andaz Napa"
        className="w-full h-full object-cover rounded-[21px] relative z-0"
    />
</div>
```

The `neon-border` class (already in `src/styles/neon-prestige.css`) provides the rotating conic gold gradient border animation. The `rounded-[21px]` on the image sits inside the 24px border-radius container, accounting for the 3px border padding. No new CSS needed.

