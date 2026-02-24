

## Fix Image Studio to Use Fal.ai Nano Banana Pro with 4K Output

### Current Problem

The `generate-image` edge function currently uses **Lovable AI Gateway** (`google/gemini-3-pro-image-preview`), not **Fal.ai**. The project already has `FAL_KEY` configured as a secret and uses Fal.ai's Nano Banana Pro model in another edge function (`generate-10lang-qa`). The Image Studio needs to be switched to use Fal.ai for crisp, clear, 4K images.

### Changes Required

#### 1. Rewrite `supabase/functions/generate-image/index.ts` to use Fal.ai

- Import and configure `@fal-ai/client` with the existing `FAL_KEY` secret
- Use `fal-ai/nano-banana-pro` model (same pattern as `generate-10lang-qa`)
- For **generation**: Send prompt with high-resolution settings (4K: `image_size: { width: 3840, height: 2160 }` for 16:9, scaled proportionally for other ratios)
- For **editing**: Use `fal-ai/nano-banana-pro/image-to-image` (or the appropriate Fal.ai edit endpoint) with the uploaded `imageUrl`
- Map dimension choices from the frontend (`1:1`, `16:9`, `9:16`, `4:1`) to pixel dimensions at 4K scale
- Keep the existing prompt-generation logic via Lovable AI for the `headline` flow (prompt writing only), but switch image generation to Fal.ai
- Maintain existing CORS headers and error handling (429/402)

#### 2. Update `ImageStudio.tsx` prompt to request 4K quality

- Append `4K resolution, ultra-sharp, crisp details` to all prompts sent from the frontend
- The `uploadBase64ToStorage` function may need adjustment since Fal.ai returns a URL (not base64) — download from `fal.media` URL and upload to storage (same pattern as `generate-10lang-qa`)

#### 3. Add `generate-image` to `supabase/config.toml`

- Currently missing from config — add `[functions.generate-image]` with `verify_jwt = false`

### Technical Details

**Fal.ai Nano Banana Pro API call pattern** (from existing codebase):
```typescript
import { fal } from "https://esm.sh/@fal-ai/client@1.2.1";
fal.config({ credentials: Deno.env.get("FAL_KEY") });

const result = await fal.subscribe("fal-ai/nano-banana-pro", {
  input: {
    prompt,
    negative_prompt: "blurry, low quality, text, watermark, logo",
    image_size: { width: 3840, height: 2160 }, // 4K for 16:9
    num_images: 1,
    num_inference_steps: 40,
    guidance_scale: 7.5,
  }
});
// result.data.images[0].url → fal.media URL
```

**4K dimension mapping:**
- `1:1` → 2160×2160
- `16:9` → 3840×2160
- `9:16` → 2160×3840
- `4:1` → 3840×960

**Files to modify:**
- `supabase/functions/generate-image/index.ts` — Switch from Lovable AI to Fal.ai
- `supabase/config.toml` — Add missing function entry
- `src/pages/portal/advisor/ImageStudio.tsx` — Update `uploadBase64ToStorage` to handle URL-based images from Fal.ai, enhance prompt quality strings

**Secrets needed:** `FAL_KEY` — already configured.

