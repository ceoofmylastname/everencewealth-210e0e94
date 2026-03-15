

## Problem

The YouTube thumbnail at `https://img.youtube.com/vi/eNo9HLgbax0/maxresdefault.jpg` is an external URL that takes time to fetch on each page load, causing a gray/empty frame while it downloads.

## Solution

Generate the thumbnail once using Nano Banana Pro (AI image generation), upload it to the project's storage bucket, and reference the stored URL so it loads instantly from the CDN.

### Steps

1. **Create a backend function** to generate and store the thumbnail:
   - Add a one-time utility (or do it inline in the component on first load) that generates a high-quality "60 Minutes broadcast studio" thumbnail using `google/gemini-3-pro-image-preview`
   - Upload the resulting image to the Supabase storage bucket (e.g., `article-images/studio/slide10-thumbnail.png`)

2. **Simpler alternative — embed as a local asset**:
   - Since this thumbnail never changes, the most reliable approach is to save it as a static asset in the project (`src/assets/slide10-thumbnail.jpg`)
   - Import it directly in the component — bundled assets load instantly with no network delay

3. **Update `Slide10_SixtyMinutes.tsx`**:
   - Replace the external YouTube URL with the local import: `import slide10Thumb from "@/assets/slide10-thumbnail.jpg"`
   - Set `<img src={slide10Thumb} />` — Vite bundles this with the app, so it loads with the JS bundle (zero extra network request)

### Recommended approach

**Option A (fastest, most reliable):** Download the YouTube thumbnail and save it as a local project asset. No AI generation needed — the actual YouTube thumbnail is the right image.

**Option B (AI-generated):** Use Nano Banana Pro via an edge function to generate a cinematic "60 Minutes broadcast studio" thumbnail, upload to storage, and reference the public URL. This adds a nicer custom image but requires more setup.

Both eliminate the slow external fetch. Option A is simpler and guaranteed instant. Option B produces a custom branded image.

