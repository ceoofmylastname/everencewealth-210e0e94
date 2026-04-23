

## Fix: Use Kie.ai Nano Banana 2 for state page hero images

### Why it's failing now

The `generate-location-image` function I just shipped calls the **Lovable AI Gateway** (`google/gemini-3.1-flash-image-preview`). It's likely returning either no `images[]` array (Gemini 3.1 image preview has been flaky on the gateway lately) or hitting a 402/429 — and even if it worked, it's the wrong provider for this platform.

Every other image generator on the project (`regenerate-cluster-images`, `regenerate-article-image`, `generate-homepage-images`, `generate-hero-image`) uses the shared **Kie.ai Nano Banana 2 client** at `supabase/functions/_shared/kieClient.ts` with `KIE_API_KEY`. State pages are the outlier.

Per memory `mem://ai/prompt-guidelines`, Nano Banana (Kie.ai) is the standard for 4K cinematic financial imagery.

### Fix

Rewrite `supabase/functions/generate-location-image/index.ts` to use the shared `kieClient` exactly like the other image functions:

1. **Import the shared client**
   ```ts
   import { generateImage } from "../_shared/kieClient.ts";
   ```

2. **Replace the Lovable Gateway call** with:
   ```ts
   const { url: kieUrl } = await generateImage({
     prompt: finalPrompt,
     aspectRatio: "16:9",      // landscape hero
     resolution: "2K",          // matches cluster/article standard
     outputFormat: "jpg",       // smaller files for hero use
   });
   ```

3. **Mirror the Kie-hosted result into Supabase Storage** (Kie URLs expire). Pattern matches `regenerate-cluster-images`:
   - `fetch(kieUrl)` → `arrayBuffer()`
   - Upload to `article-images` bucket as `state-pages/state-${city_slug}-${topic_slug}.jpg`
   - `getPublicUrl()` → write to `location_pages.featured_image_url`

4. **Surface Kie-specific errors clearly** — the `friendlyError` helper inside `kieClient.ts` already returns user-readable strings for 401 (bad key), 402 (no credits), 429 (rate limit), 422 (validation). Just let them bubble through the catch block; the toast in `AdminStatePages.tsx` already displays the message.

5. **Verify `KIE_API_KEY` is set** at the top of the handler (mirrors what `generate-hero-image` does), returning a 500 with a clear message if missing.

### Prompt tweak

The current prompt is generic skyline. Align it with the Nano Banana prompt guidelines memory — cinematic financial metaphor, not literal cityscape:

```
4K cinematic editorial photograph representing wealth management and 
retirement planning in ${city_name}, USA. Modern financial metaphor: 
glass-and-steel architecture at golden hour, soft volumetric light, 
shallow depth of field, institutional sophistication. No text, no logos, 
no people in foreground. Aspect 16:9.
```

### Files

- `supabase/functions/generate-location-image/index.ts` — replace Lovable Gateway call with `kieClient.generateImage`, add Kie URL → Supabase Storage mirror step, update default prompt
- No DB changes, no UI changes, no other functions touched

### Out of scope

- Not changing `AdminStatePages.tsx` — the existing toast already surfaces whatever error message the function returns
- Not touching the other 4 image functions — they already use Kie correctly
- Not changing `generate-location-page` (content) — that one correctly uses Lovable AI Gateway for text

### Verification

1. Confirm `KIE_API_KEY` exists in Cloud secrets (it does — used by 4 other functions today).
2. Click the orange image icon next to "Retirement Planning Strategies in Texas" on `/admin/state-pages`.
3. Within ~30–60 s (Kie polls every 3 s up to 10 min) the icon should turn green and the row's `featured_image_url` should be a `…supabase.co/storage/v1/object/public/article-images/state-pages/state-texas-retirement-planning.jpg` URL.
4. Check `generate-location-image` logs — should show `[kie] task xxxx state=success` and `Success: https://…`.
5. If `KIE_API_KEY` is out of credits, the toast will read "Kie.ai credits exhausted. Top up your Kie.ai account." instead of a generic failure.

