

# Add State-Specific Hero Images to State Page Generator

## Problem
State guide pages currently show a plain evergreen gradient fallback in the hero because no featured image is ever generated for them. The `LocationHero` component already supports displaying images -- the pipeline just never creates them for state pages.

## Solution
Trigger image generation automatically after a state page is created, so the hero displays a professional AI-generated visual specific to each state. This happens transparently during the admin generation flow.

## Changes

### 1. Admin State Page Generator (`src/pages/portal/admin/AdminStatePages.tsx`)
After a state page is successfully created (both single and batch modes), call the existing `generate-location-image` edge function with a state-appropriate prompt.

- **Single mode (line ~229-236)**: After the page is inserted into the DB, fire a background call to `generate-location-image` with the new page's ID, state name, and a prompt like "Professional aerial photography of [State Name], modern cityscape, institutional financial planning imagery."
- **Batch mode (line ~167-177)**: After the generation job completes successfully, query the newly created state pages and trigger image generation for any that lack a `featured_image_url`.

### 2. Image Prompt for States
Use a state-tailored prompt template:
```
Professional aerial photography of [State Name], USA. 
Modern cityscape skyline, institutional financial district, 
wealth management and retirement planning imagery.
Ultra high resolution, corporate marketing style, clean professional lighting.
```

### 3. Storage Bucket
Images will be stored in the existing `location-images` bucket under `[state-slug]/[topic-slug]-[timestamp].png` -- exactly how the existing `generate-location-image` function already works.

### 4. No Hero Component Changes Needed
`LocationHero` already renders the image when `featuredImageUrl` is provided and falls back to the gradient when it's not. Once the DB row gets a `featured_image_url`, the hero automatically displays it.

## Technical Details

### File Modified
- `src/pages/portal/admin/AdminStatePages.tsx`
  - After single-mode insert: add async call to `generate-location-image` (fire-and-forget with toast notification)
  - After batch-mode completion: query pages without images, trigger image generation for each
  - Add a "Generate Image" button on each state page card in the manage tab for manual regeneration

### Flow

1. Admin selects state and clicks Generate
2. Page content is generated via `generate-location-page`
3. Page is saved to DB
4. Immediately after, `generate-location-image` is called with the page ID
5. Image is generated, uploaded to storage, and the `featured_image_url` column is updated
6. Next time the state page is viewed, the hero shows the AI-generated state visual

### Manual Regeneration
Add a small image icon button on each state page card in the "Manage" tab. Clicking it calls `generate-location-image` for that specific page, allowing admins to regenerate images on demand.

