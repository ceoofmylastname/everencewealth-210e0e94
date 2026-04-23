

## State Page Generator: NOT running correctly. Two hard blockers.

### What I checked

- `/admin/state-pages` UI (`AdminStatePages.tsx`) — calls `generate-location-page` for content, then calls `generate-location-image` for hero images.
- Edge function logs for `generate-location-page` (last hour, 3 separate jobs).
- Source for `generate-location-page/index.ts` to see which AI provider it uses.
- Existence check on `generate-location-image` function.

### Blocker 1 — Content generation is failing 100% of the time (no pages being created)

Every single recent job for `generate-location-page` failed with the same error from OpenAI:

```
AI API error for en: 429 - "You exceeded your current quota,
please check your plan and billing details."
"type": "insufficient_quota", "code": "insufficient_quota"
```

Three jobs in the last 5 minutes (`ebdd5c53…`, `b199b29d…`, `35a68666…`) all logged:
```
Generating en (1/2)... → Error: 429 insufficient_quota
Generating es (2/2)... → Error: 429 insufficient_quota
Completed! Generated 0/2 languages
```

**Root cause:** `supabase/functions/generate-location-page/index.ts` line 139-153 calls **`https://api.openai.com/v1/chat/completions`** directly with `model: 'gpt-4o'`, using the user's `OPENAI_API_KEY` secret. That key is out of quota / unpaid.

This is an outlier — the rest of the platform uses **Lovable AI Gateway** (free, no API key needed). This one function was never migrated.

### Blocker 2 — Image generation function does not exist

`AdminStatePages.tsx` line 80 calls `supabase.functions.invoke("generate-location-image", …)` after each page is created. But:

- `supabase/functions/generate-location-image/` **directory does not exist**.
- So even if content generation worked, every image call would 404 silently (caught in the try/catch at line 91-94 — error logged to console only, no toast).

That's why you see "Generating hero images for N page(s)…" toast but no images ever appear: the request fails before it reaches any AI service.

### Why the UI shows "stalled"

It isn't stalled — it's failing fast and silently:
- `generate-location-page` returns `{status: "started", job_id: …}` immediately (fire-and-forget background job).
- The poller (line 172) sees `job.status = 'failed'`, shows a toast, but the `generation_jobs.error_message` is rarely surfaced clearly.
- Image generation throws 404 inside a try/catch that only `console.error`s — no user-facing toast.

So nothing visible breaks → looks like a stall.

### Fix plan (two changes, both in edge functions)

**Fix 1 — Migrate `generate-location-page` to Lovable AI Gateway** (kills the 429s)

Edit `supabase/functions/generate-location-page/index.ts`:

- Replace the OpenAI fetch (lines 139-154) with a call to `https://ai.gateway.lovable.dev/v1/chat/completions` using `LOVABLE_API_KEY` (already in env, no user action needed).
- Switch `model: 'gpt-4o'` → `google/gemini-2.5-flash` (fast, free, more than capable for location content).
- Drop the `OPENAI_API_KEY` parameter from `generateLanguageVersion()` and its caller in `processBackgroundGeneration()`.
- Handle gateway-specific 429 (rate limit) and 402 (credit) responses with a clear `error_message` written back to `generation_jobs` so the UI shows it.

**Fix 2 — Create the missing `generate-location-image` edge function**

New file `supabase/functions/generate-location-image/index.ts`:

- Accept `{ location_page_id, city_name, city_slug, topic_slug, image_prompt }` from the body (matches what `AdminStatePages.tsx` line 80-89 already sends).
- Call Lovable AI image gateway `https://ai.gateway.lovable.dev/v1/images/generations` with `google/gemini-3.1-flash-image-preview` (per AI prompt guidelines memory — 4K cinematic financial imagery).
- Download the returned image, upload to existing `article-images` Supabase storage bucket as `state-${city_slug}-${topic_slug}.jpg`.
- Update `location_pages.featured_image_url` and `featured_image_alt` for the matching `id`.
- Return `{ success: true, url }` and CORS headers.
- Add small front-end polish in `AdminStatePages.tsx` (one line) so a failed image call shows a `toast.warning` instead of console-silent.

### Out of scope

- No DB schema changes (`location_pages`, `generation_jobs` columns are fine).
- No UI redesign — the Generator page stays as-is.
- Not touching the OpenAI key in secrets (the fix removes the dependency entirely).
- No retroactive image backfill for existing imageless state pages — but once Fix 2 ships, the existing "regenerate image" button on the manage tab will work for them.

### Verification after deploy

1. Go to `/admin/state-pages` → Generate tab → pick "Texas" → "Retirement Planning" → Generate.
2. Within ~30 s the progress should reach 2/2 and toast "State page(s) generated successfully!"
3. Within another ~10 s a "Hero image ready" toast should appear and the Texas card on the Manage tab should show a real image (not a placeholder).
4. Re-check `generate-location-page` logs — should see `Generated 2/2 languages` instead of `0/2`.
5. Check `generate-location-image` logs (new function) — should show successful uploads to storage.

