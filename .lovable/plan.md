
# Sync Retargeting Video Section with Language-Specific Videos + Generate Thumbnail

## Problem

Looking at the Polish retargeting page (`/pl/witamy-ponownie`), there are two issues:

1. **Video Not Loading in Inline Section**: The autoplay video section below the hero shows a gray placeholder instead of the actual video
2. **Different Video Sets**: The hero modal uses the new welcome-back videos (from `retargetingWelcomeBackVideos.ts`), but the inline autoplay section uses a different hardcoded set of videos
3. **No Poster Image**: Unlike the landing page, the retargeting video has no `poster` attribute, so users see a gray box while loading

## Solution

### 1. Unify Video Sources

Update `RetargetingAutoplayVideo.tsx` to use the same video configuration as the hero section:

| Before | After |
|--------|-------|
| Hardcoded URLs in component (lines 12-23) | Import from `retargetingWelcomeBackVideos.ts` |
| Different videos for hero vs inline | Same videos used consistently |

### 2. Generate Costa del Sol Thumbnail

Create a new edge function to generate a beautiful thumbnail using Nano Banana Pro:

**Prompt for AI image generation:**
```
Stunning aerial view of Costa del Sol luxury beachfront villa with infinity pool overlooking the Mediterranean Sea. 
Golden hour lighting, whitewashed Spanish architecture, palm trees, turquoise water, 
pristine beach. Modern luxury real estate photography style, 16:9 aspect ratio, 
professional drone shot, warm sunset tones, high-end lifestyle magazine quality.
```

The generated image will be:
- Uploaded to Supabase storage
- Saved as a permanent asset for video thumbnails

### 3. Add Poster Attribute to Video

Update the video element to show the thumbnail while loading:

```tsx
<video
  poster={thumbnailUrl}
  // ... other attributes
>
```

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `supabase/functions/generate-retargeting-thumbnail/index.ts` | **CREATE** | New edge function using Nano Banana Pro to generate Costa del Sol thumbnail |
| `src/config/retargetingWelcomeBackVideos.ts` | **MODIFY** | Add thumbnail URL export |
| `src/components/retargeting/RetargetingAutoplayVideo.tsx` | **MODIFY** | Import video config, add poster attribute |

---

## Technical Implementation

### Step 1: Create Thumbnail Generation Edge Function

```typescript
// supabase/functions/generate-retargeting-thumbnail/index.ts

const prompt = `Stunning aerial view of Costa del Sol luxury beachfront villa with infinity pool 
overlooking the Mediterranean Sea. Golden hour lighting, whitewashed Spanish architecture, 
palm trees, turquoise water, pristine beach. Modern luxury real estate photography style, 
16:9 aspect ratio, professional drone shot, warm sunset tones, high-end lifestyle magazine quality. 
No text, no logos, no people.`;

// Use google/gemini-3-pro-image-preview (Nano Banana Pro)
// Upload to Supabase storage: retargeting/video-thumbnail.jpg
// Return public URL
```

### Step 2: Update Video Configuration

```typescript
// src/config/retargetingWelcomeBackVideos.ts

// Add thumbnail URL (will be populated after generation)
export const RETARGETING_VIDEO_THUMBNAIL = 
  "https://kazggnufaoicopvmwhdl.supabase.co/storage/v1/object/public/article-images/retargeting/video-thumbnail.png";
```

### Step 3: Update Autoplay Video Component

```typescript
// src/components/retargeting/RetargetingAutoplayVideo.tsx

import { 
  getWelcomeBackVideoUrl, 
  RETARGETING_VIDEO_THUMBNAIL 
} from "@/config/retargetingWelcomeBackVideos";

// Inside component:
const videoUrl = getWelcomeBackVideoUrl(language);

// In JSX - add poster:
<video
  ref={videoRef}
  src={videoUrl || undefined}
  poster={RETARGETING_VIDEO_THUMBNAIL}
  className="w-full aspect-video object-cover"
  loop
  muted
  playsInline
  preload="auto"
/>
```

---

## Graceful Handling

For languages without videos (English, Spanish):
- Video element still renders with poster thumbnail visible
- Play button shows but clicking does nothing harmful
- Alternative: Hide the entire section if no video exists

---

## Expected Result

| Language | Video in Hero Modal | Video in Autoplay Section | Thumbnail |
|----------|---------------------|---------------------------|-----------|
| Polish | ✅ Polish video | ✅ Same Polish video | ✅ Costa del Sol image |
| Dutch | ✅ Dutch video | ✅ Same Dutch video | ✅ Costa del Sol image |
| German | ✅ German video | ✅ Same German video | ✅ Costa del Sol image |
| English | Hidden button | Poster only (no video) | ✅ Costa del Sol image |

---

## Workflow

1. Create and deploy thumbnail generation edge function
2. Run the function once to generate and store the thumbnail
3. Update the config file with the stored thumbnail URL
4. Update RetargetingAutoplayVideo to use unified video config + poster
5. Test across all language pages
