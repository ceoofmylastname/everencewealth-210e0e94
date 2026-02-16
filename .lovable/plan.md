

## Add AI-Generated Images to the Homepage with Nano Banana Pro

### Overview
Generate 5 professional, high-quality images using Nano Banana Pro (`google/gemini-3-pro-image-preview` via Lovable AI gateway) for key homepage sections. Store them in the `article-images` storage bucket and persist URLs in a new `homepage_images` database table. Each component will gracefully fall back to its current appearance if images haven't been generated yet.

### Images to Generate

| Section | Image Concept | Aspect Ratio |
|---------|--------------|-------------|
| **HomepageAbout** | Professional financial advisor reviewing plans with a client couple in a modern glass office, warm lighting, editorial style | 4:3 |
| **Services** | Wide cinematic shot of a premium wealth management office with warm ambient lighting, bookshelves, and city views | 16:9 |
| **WealthPhilosophy** | Aerial golden-hour cityscape of a financial district skyline, dramatic clouds | 16:9 |
| **CTA** | Happy retired couple walking on a beach at sunset, lifestyle photography | 16:9 |
| **Assessment** | Close-up of hands reviewing financial documents on a premium mahogany desk with a pen and glasses | 16:9 |

### Technical Approach

**1. Database Table: `homepage_images`**
- `id` (UUID, PK), `section_key` (TEXT, unique), `image_url` (TEXT), `prompt` (TEXT), `created_at` (TIMESTAMPTZ)
- RLS: public SELECT, service_role full access

**2. Edge Function: `generate-homepage-images`**
- Uses Lovable AI gateway (`google/gemini-3-pro-image-preview`) -- no extra API key needed
- Generates 5 images with tailored prompts
- Extracts base64 image data from the response, uploads each to `article-images` storage bucket
- Upserts URLs into `homepage_images` table
- One-time generation -- run once, URLs are permanent

**3. React Hook: `useHomepageImages`**
- Fetches from `homepage_images` table via Supabase client
- Returns `Record<string, string>` mapping section_key to image_url
- Cached with React Query (24h stale time)

**4. Component Updates (5 files)**

- **HomepageAbout.tsx**: Replace the `Building2` icon placeholder with an `<img>` tag. Keep the testimonial overlay card. Add a subtle parallax hover effect.
- **Services.tsx**: Add a full-width rounded banner image above the service cards with a gradient overlay.
- **WealthPhilosophy.tsx**: Replace the Unsplash URL with the generated cityscape at ~8% opacity.
- **CTA.tsx**: Add a subtle background image with dark gradient overlay to maintain text readability.
- **Assessment.tsx**: Add a low-opacity background image for atmospheric depth.

All components fall back gracefully (current appearance) if no image URL is available.

### Execution Order
1. Create `homepage_images` database table (migration)
2. Create `generate-homepage-images` edge function
3. Create `useHomepageImages` hook
4. Update 5 homepage components
5. Deploy edge function and trigger once to generate all images

### Design Principles
- Images use low opacity or gradient overlays on dark sections to maintain text contrast
- HomepageAbout gets a full, visible image (replacing the placeholder icon)
- Services gets a prominent banner
- All other sections use images as subtle atmospheric backgrounds
- No extra API keys required -- uses the pre-configured Lovable AI gateway

