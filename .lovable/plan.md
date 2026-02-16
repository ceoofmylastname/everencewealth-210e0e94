

## Add AI-Generated Homepage Images with Nano Banana Pro

### Overview
Generate 5 professional images using the existing fal.ai Nano Banana Pro integration (already configured with `FAL_KEY`) for 5 homepage sections. Store them in the `article-images` bucket, persist URLs in a new `homepage_images` table, and update each component to display them with graceful fallbacks.

### Step 1: Create `homepage_images` Database Table

SQL migration to create the table with RLS (public read, service_role write):

```sql
CREATE TABLE public.homepage_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view homepage images"
  ON public.homepage_images FOR SELECT USING (true);

CREATE POLICY "Service role manages homepage images"
  ON public.homepage_images FOR ALL USING (auth.role() = 'service_role');
```

### Step 2: Create Edge Function `generate-homepage-images`

New file: `supabase/functions/generate-homepage-images/index.ts`

- Reuses the exact same fal.ai pattern from `generate-hero-image` (FAL_KEY, `fal-ai/nano-banana-pro`, upload to `article-images` bucket)
- Generates 5 images with these prompts:

| Key | Prompt Summary | Ratio |
|-----|---------------|-------|
| `about` | Professional advisor reviewing plans with client couple in modern glass office, warm golden lighting, editorial photography | 4:3 |
| `services` | Wide cinematic shot of premium wealth management office, warm ambient lighting, bookshelves, city skyline views | 16:9 |
| `philosophy` | Aerial golden-hour cityscape of financial district skyline, dramatic clouds, modern skyscrapers | 16:9 |
| `cta` | Happy retired couple walking on beach at sunset, lifestyle photography, warm tones | 16:9 |
| `assessment` | Close-up of hands reviewing financial documents on mahogany desk, pen and glasses, professional setting | 16:9 |

- Downloads each fal.ai image, uploads to `article-images` bucket with prefix `homepage-{key}`
- Upserts all 5 URLs into `homepage_images` table
- One-time run -- URLs are permanent after generation

### Step 3: Create `useHomepageImages` Hook

New file: `src/hooks/useHomepageImages.ts`

- Queries `homepage_images` table via Supabase client (using `.from()` with type cast since table is new)
- Returns `Record<string, string>` mapping section_key to image_url
- Cached with React Query (24h stale time)
- Returns empty object if no images exist yet (graceful fallback)

### Step 4: Update 5 Homepage Components

All components import `useHomepageImages` and conditionally render images:

**HomepageAbout.tsx**
- Replace the placeholder gradient `div` with `Building2` icon (line 65) with an `<img>` tag showing the `about` image
- Keep the testimonial overlay card positioned on top
- Fallback: current gradient placeholder if no image

**Services.tsx**
- Add a full-width rounded banner image above the service cards grid (between heading and cards)
- Gradient overlay on the banner for text contrast
- Fallback: no banner shown, cards render as before

**WealthPhilosophy.tsx**
- Replace the Unsplash URL (line 16) with the `philosophy` image URL
- Increase opacity slightly from 4% to 8% for the generated image
- Fallback: keep current Unsplash URL

**CTA.tsx**
- Add a background image layer behind the content with dark gradient overlay
- Fallback: current gradient-only background

**Assessment.tsx**
- Add a low-opacity background image for atmospheric depth
- Fallback: current appearance unchanged

### Step 5: Deploy and Trigger

- Deploy `generate-homepage-images` edge function
- Call it once to generate all 5 images
- Images persist permanently in storage and database

### Design Principles
- All background images use low opacity (4-10%) or dark gradient overlays to maintain text readability
- HomepageAbout gets a fully visible image (replacing placeholder)
- Services gets a prominent decorative banner
- Components fall back gracefully to current appearance if images don't exist
- No new API keys needed -- uses existing `FAL_KEY` and `article-images` bucket
