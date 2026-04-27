# Fix blog card image regression

## Root cause

`src/components/OptimizedImage.tsx` emits a `<picture>` with a `<source srcSet={webpSrc} type="image/webp">` derived by string-replacing `.png` → `.webp`. The WebP siblings don't exist in the `article-images` Supabase bucket (the one-shot `convertHerosToWebp.ts` was never run), so those URLs return HTTP 400.

Per the HTML spec, `<picture>` source selection is based on `type` / `media` matching, **not** on whether the resource loads. Every modern browser supports `image/webp`, so it commits to the WebP source. When the request 400s, it does **not** fall back to the `<img>` — it just shows a broken image. Because `<img>` starts at `opacity-0` and only flips to `opacity-100` in the `onLoad` handler (which never fires), the gray skeleton sits there forever.

The user-suggested `<picture>` pattern has the same defect — it would behave identically. The real fix is to stop advertising a WebP source we can't guarantee exists.

(Note on the curl claim: `/en/blog/` and `/en/blog/<slug>/` are served by the `serve-seo-page` edge function, which renders text-only link lists for hub pages and doesn't emit `<img>` tags at all. So curl on the hub will still show zero `src=""` after this fix — that's expected. The user-visible card images live in the React-hydrated `BlogIndex.tsx` and detail pages, and **that** is what this fix restores.)

## Change

Edit a single file: `src/components/OptimizedImage.tsx`.

1. Drop the `deriveWebpUrl` branch and the `<picture>` / `<source>` markup. Render a plain `<img src={optimizedSrc}>` directly.
2. Remove the opacity-0 → opacity-100 gate driven by `onLoad`. Keep the skeleton as a behind-the-image placeholder that `onLoad` hides, but render the `<img>` itself at full opacity so a missed `onLoad` event never blanks the image.
3. Keep all other behavior: Supabase render-image transform URL, `loading`, `decoding`, `fetchPriority`, `width`/`height` aspect ratio, error fallback, className passthrough.

Result:
- Browser requests the PNG/JPG directly → 200 → image renders.
- All consumers (`ArticleCard`, `RelatedArticles`, `ArticleContent`, `LocationHero`, `FeaturedCitiesSection`, `QAIndex`, `LocationGenerator`) inherit the fix with no further edits — none of them add their own `<picture>` wrapper.
- When `convertHerosToWebp.ts` is later run and `.webp` siblings exist, we can reintroduce a `<source>` element guarded by a build-time manifest (out of scope here).

## Out of scope (explicitly untouched)

- `functions/_middleware.js`, `injectSeoTags()`, PROMPT 17 catchall.
- `supabase/functions/serve-seo-page/index.ts` (PROMPT 20/21/22 work).
- `scripts/convertHerosToWebp.ts` (don't run it as part of this fix).
- All `supabase/migrations/*`.

## Verification after deploy

1. Visit `/en/blog/` in the browser — cards render their PNG hero images instead of gray skeletons.
2. Visit any `/en/blog/<slug>/` detail page — hero image renders.
3. DevTools Network tab: a single request per card to the `.png` (or `.jpg`) URL returning 200, with no failing `.webp` request.
