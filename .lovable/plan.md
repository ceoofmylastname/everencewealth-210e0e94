

## Plan: Add Darren Hardy Portrait with Blob Clip

Generate a professional portrait of Darren Hardy using nano banana pro and display it with the same organic BlobClip border used on the Warren Buffett slide.

### Changes

**1. Generate image via `generate-image` edge function**
- Use nano banana pro (google/gemini-3-pro-image-preview) to generate a professional editorial portrait of Darren Hardy — business attire, confident pose, clean background
- Save the base64 result to `src/assets/darren-hardy-portrait.png`

**2. Update `src/components/presentation/slides/Slide08_DarrenHardy.tsx`**
- Import the generated portrait and `BlobClip` component
- Restructure layout: keep left side (title + quote card), add a `BlobClip` with the portrait on the right bottom area or reposition the layout to a 3-column feel
- Use `BlobClip` with a different `variant` (e.g. variant={2}) for visual variety, matching the Warren Buffett pattern
- Add as Reveal index 4 with `direction="right"` animation
- The quote card and attribution stay above/alongside, with the portrait complementing the slide's evergreen background

