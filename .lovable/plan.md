

## Add Professional AI-Generated Images to the Homepage

### Overview
Create an edge function that generates high-quality images using Nano Banana Pro for 5 key homepage sections, stores them in storage, and update each component to display them. The current homepage is mostly text and icons -- these images will bring it to life while keeping the modern, professional aesthetic.

### Images to Generate

| Section | Image Concept | Placement |
|---------|--------------|-----------|
| **HomepageAbout** | Professional advisor in a modern glass office reviewing financial plans with a client couple | Replace the placeholder gradient/Building2 icon |
| **Services** | Wide cinematic shot of a modern wealth management office with warm lighting | Banner image above the 3 service cards |
| **WealthPhilosophy** | Aerial cityscape of a financial district at golden hour | Full-width subtle background replacing the current Unsplash texture |
| **CTA** | Happy retired couple walking on a beach at sunset, lifestyle shot | Subtle background behind the call-to-action |
| **Assessment** | Close-up of hands reviewing financial documents on a premium desk | Background accent image |

### Technical Approach

**1. New Edge Function: `generate-homepage-images`**
- Uses Nano Banana Pro (`fal-ai/nano-banana-pro`) via existing FAL_KEY
- Generates 5 images with tailored prompts for each section
- Uploads each to the `article-images` storage bucket with predictable filenames (e.g., `homepage-about.png`, `homepage-services.png`)
- Returns all URLs in a single response
- One-time generation -- run once, then URLs are permanent

**2. New Database Table: `homepage_images`**
- Columns: `id`, `section_key` (text, unique), `image_url` (text), `prompt` (text), `created_at`
- Stores the generated image URLs mapped to section keys
- No RLS needed (public read, admin write via service role in edge function)

**3. New Hook: `useHomepageImages`**
- Fetches all rows from `homepage_images` table
- Returns a map of `section_key -> image_url`
- Cached via React Query with long stale time (images rarely change)

**4. Component Updates (5 files)**

- **HomepageAbout.tsx**: Replace the gradient placeholder `div` (line 65) with an `<img>` tag using the `homepage-about` image. Keep the testimonial overlay card.
- **Services.tsx**: Add a full-width rounded image above the service cards grid with a gradient overlay.
- **WealthPhilosophy.tsx**: Replace the Unsplash URL (line 16) with the generated cityscape image at slightly higher opacity (~8%).
- **CTA.tsx**: Add a subtle background image behind the CTA content with a dark gradient overlay to maintain text readability.
- **Assessment.tsx**: Add a subtle background image with low opacity to add depth.

### Execution Order
1. Create `homepage_images` database table
2. Create `generate-homepage-images` edge function
3. Create `useHomepageImages` hook
4. Update all 5 component files to use images from the hook
5. Deploy edge function and trigger it once to generate all images

### Design Principles
- Images use low opacity or gradient overlays on dark sections to maintain text contrast
- The HomepageAbout section gets a full, visible image (replacing the placeholder)
- Services gets a prominent banner image
- All other sections use images as subtle atmospheric backgrounds
- Fallbacks: components render normally if images haven't been generated yet (graceful degradation)

