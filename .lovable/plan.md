

## Plan: Generate Modern Images for Fixed, Variable, and Indexed Cards

### What
Generate 3 AI images using Nano Banana Pro (google/gemini-3-pro-image-preview) via the Lovable AI Gateway to replace the plain gradient rectangles on Slide 03. Save them as static assets and update the slide component.

### Image Generation
Create a one-off edge function call (or script) to generate 3 images with these prompts:

1. **Fixed** — Abstract modern visualization of stability and security. A pristine steel vault door with soft blue-gray tones, geometric precision, clean lines, minimal composition. Ultra-realistic, 4K, no text, no watermarks.
2. **Variable** — Abstract modern visualization of market volatility. Dynamic golden stock chart lines flowing through space with warm amber tones, movement and energy. Ultra-realistic, 4K, no text, no watermarks.  
3. **Indexed** — Abstract modern visualization of protected growth. A lush green shield with upward arrow, combining nature and finance, deep emerald tones. Ultra-realistic, 4K, no text, no watermarks.

### Technical Steps

1. **Generate images** via a script that calls the `generate-image` edge function 3 times with custom prompts, using the existing Nano Banana Pro path (by passing `imageUrl` with a blank base image, or better — create a small dedicated edge function that calls `google/gemini-3-pro-image-preview` for text-to-image directly)
2. **Save images** as `src/assets/invest-fixed.jpg`, `src/assets/invest-variable.jpg`, `src/assets/invest-indexed.jpg`
3. **Update `Slide03_WaysToInvest.tsx`**: Import the 3 images and replace the gradient `<div>` with `<img>` tags using `object-cover` and `rounded-xl`

### Slide Component Changes
- Add image imports for the 3 generated assets
- Replace `style={{ background: col.gradient }}` divs with `<img src={col.image} className="w-full h-[180px] rounded-xl mb-4 object-cover" />`
- Add the image field to each column config object

