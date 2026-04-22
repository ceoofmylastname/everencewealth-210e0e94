

## Migrate all image generation from Fal.ai → Kie.ai (Nano Banana 2)

Replace every `FAL_KEY` / `falainanobananaproedit` call with the Kie.ai Nano Banana 2 model using `KIE_API_KEY`. One shared client, async polling pattern, identical inputs/outputs at the call sites so nothing else has to change.

### Kie.ai Nano Banana 2 API (confirmed from docs)

- **Submit:** `POST https://api.kie.ai/api/v1/jobs/createTask`
  - Headers: `Authorization: Bearer <KIE_API_KEY>`, `Content-Type: application/json`
  - Body: `{ "model": "nano-banana-2", "input": { "prompt": "...", "aspect_ratio": "1:1|16:9|9:16|4:3|...|auto", "resolution": "1K|2K|4K", "output_format": "jpg|png", "image_input": ["https://..."] } }`
  - Returns: `{ code: 200, data: { taskId } }`
- **Poll:** `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=<id>`
  - Returns: `{ data: { state: "waiting|queuing|generating|success|fail", resultJson: "{\"resultUrls\":[\"https://...\"]}" } }`
- States: poll until `success` or `fail`; URLs expire in 24h so we download + re-upload to Supabase Storage (already the pattern in `generate-homepage-images`).

### Step 1 — Shared Kie client

Create `supabase/functions/_shared/kieClient.ts`:
- `generateImage({ prompt, aspectRatio, resolution, imageInput?, outputFormat })` → returns final image URL string
- Internally: submit task → poll `recordInfo` every 3s with exponential backoff → 10-min timeout → parse `resultJson.resultUrls[0]`
- Reads `KIE_API_KEY` (already added to secrets)
- Friendly errors for 401/402 (insufficient credits)/422/429/500/501

Helper `mapDimensionsToAspectRatio()`:
```
{ '1:1': '1:1', '16:9': '16:9', '9:16': '9:16', '4:3': '4:3', '4:1': '21:9' (closest) }
```
Default `resolution: "4K"` for hero/homepage, `"2K"` for blog/Q&A thumbnails.

### Step 2 — Migrate every edge function that calls Fal.ai

Replace the `fal.subscribe("fal-ai/nano-banana-pro", ...)` block with `await generateImage(...)` from the shared client. No other logic changes.

| Function | Current model | Replacement |
|---|---|---|
| `generate-image` | nano-banana-pro | nano-banana-2 (text-to-image branch only — image-edit branch already uses Lovable AI Gemini, leave it) |
| `generate-hero-image` | nano-banana-pro x2 (desktop+mobile) | nano-banana-2 with `aspect_ratio: "16:9"` and `"4:3"`, `resolution: "4K"` |
| `generate-homepage-images` | nano-banana-pro | nano-banana-2 with per-config `aspect_ratio`, `resolution: "2K"` |
| `regenerate-article-image` | nano-banana-pro | nano-banana-2, `resolution: "2K"` |
| `generate-10lang-qa` | nano-banana-pro | nano-banana-2, `resolution: "2K"` |
| `translate-cluster` | nano-banana-pro | nano-banana-2 |
| `translate-qas-to-language` | nano-banana-pro | nano-banana-2 |

Each function: drop `import { fal } from "...@fal-ai/..."`, drop `fal.config(...)`, swap `falKey` check → `KIE_API_KEY` check, swap the call. Storage upload code (`uploadToStorage`) stays identical.

### Step 3 — Migrate the legacy secret name

`generate-homepage-images` reads `Deno.env.get('falainanobananaproedit')`. After migration it reads `KIE_API_KEY` like everything else. The legacy `falainanobananaproedit` and `FAL_KEY` secrets become orphaned — flag them in the wrap-up message so the user can delete them from Cloud secrets if desired.

### Step 4 — Frontend reference cleanup

These don't generate images, just reference the key:
- `src/lib/testUtils.ts` — replace `VITE_FAL_KEY` health check with a call to `health-check` edge function (or simply remove the FAL test, since it's no longer relevant)
- `src/pages/admin/AITools.tsx` — change the "FAL_KEY / FAL.ai API Key" status row to "KIE_API_KEY / Kie.ai (Nano Banana 2)"

### Step 5 — Out of scope (intentionally untouched)

- `scripts/generate-hero-images.ts`, `scripts/generateThankYouImages.ts` — local Node scripts, not deployed; leave with a `// DEPRECATED` comment
- `supabase/functions/migrate-fal-images/` — historical migration tool, leave as-is
- `supabase/functions/generate-image` image-edit branch — uses Lovable AI Gemini for image-to-image (Nano Banana 2 supports `image_input` so we *could* migrate, but the user said "use Nano Banana 2 for creating images" — edits stay on Lovable AI unless requested)
- `analyze-image-for-text` — uses GPT-4o Vision (analysis, not generation)

### Step 6 — Verification

After migration, in default mode:
1. `grep -rE "FAL_KEY|falainanobananaproedit|fal-ai/nano-banana|@fal-ai" supabase/functions/` — expect zero hits except in `migrate-fal-images/`
2. Test invoke `generate-image` with `{ prompt: "test", dimensions: "16:9" }` — confirm a Kie URL comes back and uploads succeed
3. Test invoke `generate-homepage-images` (one config) — confirm `homepage_images` table updates
4. Report: list of migrated functions, smoke-test URLs, any prompts that needed tweaking

### Files changed (estimated 9)

**New:** `supabase/functions/_shared/kieClient.ts`

**Edge functions migrated (7):** `generate-image`, `generate-hero-image`, `generate-homepage-images`, `regenerate-article-image`, `generate-10lang-qa`, `translate-cluster`, `translate-qas-to-language`

**Frontend (2):** `src/lib/testUtils.ts`, `src/pages/admin/AITools.tsx`

### Open question

**Aspect ratio for the hero `4:1` panoramic option** — Nano Banana 2's allowed values are `1:1, 1:4, 1:8, 2:3, 3:2, 3:4, 4:1, 4:3, 4:5, 5:4, 8:1, 9:16, 16:9, 21:9, auto`. `4:1` IS supported, so existing `4:1` heroes will map cleanly. No action needed unless you want a different ratio.

