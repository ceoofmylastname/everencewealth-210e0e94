

## Fix "$500M+" Clipping in Stats Cards

The "+" symbol on the "$500M+" stat is being cut off because of the `overflow-hidden` class on the card combined with text that's slightly too wide for the available space.

### Changes (single file: `src/components/homepage/Stats.tsx`)

1. **Remove `overflow-hidden`** from the card container -- it was added as a "safety net" but is actually causing the clipping problem. The `rounded-3xl` already clips children visually via border-radius.

2. **Scale down font sizes one more step** to ensure all values (especially "$500M+") fit comfortably:
   - From: `text-4xl sm:text-5xl md:text-6xl`
   - To: `text-3xl sm:text-4xl md:text-5xl`

3. **Add horizontal padding reduction on mobile** (`px-3`) so the text has proportionally more room on smaller screens while keeping the card compact.

These two small CSS tweaks will ensure the full "$500M+" value (including the "+") is visible on both desktop and mobile without any clipping.
