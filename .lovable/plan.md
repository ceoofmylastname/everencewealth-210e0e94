

## Fix Image Studio — Full Functional Implementation

The Image Studio page (`/portal/advisor/image-studio`) currently renders as a static mockup with no working functionality. All buttons, upload zones, and download actions are decorative. Here's the plan to make it fully functional.

---

### What's Broken / Missing

1. **No image upload** — The dropzone in the Edit tab is a styled div with no file input or handler
2. **No AI image generation** — The "Generate Image" button does nothing; no connection to the `generate-image` edge function
3. **No AI image editing** — The "Apply AI Edits" button is non-functional
4. **No download capability** — Download buttons have no logic
5. **No image persistence** — Generated/edited images aren't saved anywhere
6. **No state management** — No state for generated images, uploaded files, loading states, or errors
7. **Before & After comparison** — Only shows placeholder gradients, not real images

---

### Implementation Plan

#### 1. Add State Management
- Add state for: `prompt`, `uploadedImage`, `generatedImages`, `editedImage`, `isGenerating`, `isEditing`, `selectedPreset`, `selectedDimension`, `editInstructions`
- Track original and edited images for the comparison slider

#### 2. Wire Up Image Upload (Edit Tab)
- Add a hidden `<input type="file">` accepting PNG/JPG/WEBP up to 10MB
- On file select or drag-and-drop, read the file and display a preview
- Upload to `article-images` storage bucket (already exists with proper RLS policies)
- Show the uploaded image in the comparison slider's "Original" side

#### 3. Wire Up AI Image Generation (Generate Tab)
- Connect the "Generate Image" button to the existing `generate-image` edge function
- Pass the user's prompt text, selected style preset, and dimensions
- On success, download the base64 result, upload to storage, and display in the output gallery
- Show loading spinner during generation
- Display the generated image replacing the CSS gradient placeholder
- Enable the Download button to trigger a browser download of the generated image

#### 4. Wire Up AI Image Editing (Edit Tab)
- Connect "Apply AI Edits" to the `generate-image` edge function (it already supports `imageUrl` for editing)
- Pass the uploaded image URL + edit instructions
- On success, display the edited image in the "After" side of the comparison slider
- Enable Download Original / Download Edited buttons

#### 5. Download Functionality
- Implement `downloadImage()` helper that fetches the image URL and triggers `<a download>` click
- Wire to all Download buttons (Generate tab download, Edit tab download original/edited)

#### 6. Save to Storage
- All generated and edited images are uploaded to `article-images` bucket with descriptive filenames
- Images get permanent public URLs for reuse

#### 7. Visual Fixes
- Replace CSS gradient placeholders with actual image previews when images exist
- Show empty/placeholder state only when no images have been generated yet
- Add loading states with skeleton animations during AI processing
- Add error toasts for failed generations/uploads

---

### Technical Details

**Files to modify:**
- `src/pages/portal/advisor/ImageStudio.tsx` — Major rewrite to add all functional state and handlers

**Edge function used:**
- `supabase/functions/generate-image/index.ts` — Already supports both generation (prompt only) and editing (prompt + imageUrl)

**Storage bucket:**
- `article-images` — Already exists, public, with authenticated upload/delete RLS policies

**No new database tables or edge functions needed.**

