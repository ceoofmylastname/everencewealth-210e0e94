
## Add US Map Background Image to Location Hub Hero

Generate a modern, stylized US map image using Lovable AI (Gemini 3 Pro Image) that matches the Everence Wealth brand aesthetic, then place it as a subtle background element in the Location Hub hero section.

---

### Step 1: Generate the Map Image

Use an edge function (or inline AI call) with the `google/gemini-3-pro-image-preview` model to generate a modern, minimalist US map with these brand specs:
- Deep evergreen (#1A4D3E) and dark (#0a2a1f) tones
- Gold (#C5A059) accent lines or glowing dots on key city locations
- Clean, editorial, institutional feel -- no cartoonish elements
- Semi-transparent / dark enough to work as a background behind white text

Upload the result to the `article-images` storage bucket and get a public URL.

### Step 2: Update `src/pages/LocationHub.tsx` Hero Section

Add the generated map image as a background layer within the existing hero gradient:

```
<div className="absolute inset-0 bg-gradient-to-br from-[#0a2a1f] via-[#1A4D3E] to-[#0d1f1a]">
  {/* US Map Background */}
  <div className="absolute inset-0 flex items-center justify-center opacity-15">
    <img src="{MAP_URL}" alt="" aria-hidden="true" className="w-full h-full object-contain max-w-5xl" />
  </div>
  {/* Existing gold blur orbs stay on top */}
  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl" />
  ...
</div>
```

Key details:
- The map renders at low opacity (~15%) so it subtly textures the background without competing with headline text
- `aria-hidden="true"` and empty `alt` since it is decorative
- Gold blur orbs layer on top for the existing luxury effect
- The bottom gradient fade to `background` remains unchanged

### Files Changed

| File | Change |
|---|---|
| `src/pages/LocationHub.tsx` | Add `<img>` element for the US map inside the hero gradient container, between the gradient div and the gold orbs |

No database changes needed. The image will be generated once and stored as a static asset.
