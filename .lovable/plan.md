

## Verify OG image references point to `og-image-v2.png`

### Audit results

Ran `grep -rn "og-image" src/ scripts/ public/ index.html functions/` to find every OG image reference.

**Files already updated to `og-image-v2.png`:**
- `index.html` — `og:image` + `twitter:image` ✅
- `src/components/landing/LandingLayout.tsx` — JSON-LD + meta ✅

**Files still pointing to the old `og-image.png` (need update):**

1. `scripts/generateStaticHomePage.ts` — SSG-rendered home `og:image` / `twitter:image` (both `en` and `es` variants) still emit `/og-image.png`. This file regenerates `dist/index.html` and `dist/es/index.html` at build time, so the live home route served to crawlers still advertises the old image after deploy.
2. `scripts/generateStaticPhilosophyPage.ts` — SSG philosophy page `og:image` still `/og-image.png`.
3. `scripts/generateStaticPages.ts` — blog article SSG fallback image when an article has no `featured_image_url` → `/og-image.png`.
4. `public/app-shell.html` — content-page shell (blog/qa/compare/locations) — no OG tags here (middleware-injected), so nothing to change. ✅
5. `functions/_middleware.js` — check for any hardcoded OG image fallback.
6. `supabase/functions/*` edge functions that render meta tags (e.g. `render-article-meta`, `render-home-meta`, if present) — check for `/og-image.png` fallbacks.
7. `public/site.webmanifest` — not an OG reference; skip.

### Fix

Update every remaining `/og-image.png` to `/og-image-v2.png?v=2` across:

- `scripts/generateStaticHomePage.ts` (both language variants: `og:image`, `og:image:url`, `og:image:secure_url`, `twitter:image`)
- `scripts/generateStaticPhilosophyPage.ts`
- `scripts/generateStaticPages.ts` (blog fallback image)
- Any edge function under `supabase/functions/` that emits `og:image` with the old filename
- `functions/_middleware.js` if it hardcodes an OG fallback

The `?v=2` query string forces LinkedIn, Facebook, Twitter/X, iMessage, Slack, and WhatsApp crawlers to re-fetch on next scrape (they cache by full URL).

Keep dimensions intact:
```
<meta property="og:image" content="https://www.everencewealth.com/og-image-v2.png?v=2" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta name="twitter:image" content="https://www.everencewealth.com/og-image-v2.png?v=2" />
<meta name="twitter:card" content="summary_large_image" />
```

### Post-deploy cache invalidation

After deploy, trigger a re-scrape on each platform (documented in the fix commit so you can run them manually):

- LinkedIn: `https://www.linkedin.com/post-inspector/inspect/https%3A%2F%2Fwww.everencewealth.com%2F`
- Facebook/iMessage: `https://developers.facebook.com/tools/debug/?q=https://www.everencewealth.com/`
- Twitter/X: `https://cards-dev.twitter.com/validator` (or repost — X auto-rescrapes)

### Verification

- `grep -rn "og-image\.png" src/ scripts/ public/ functions/ supabase/functions/ index.html` returns **zero** matches (only `og-image-v2.png` remains).
- `curl -s https://www.everencewealth.com/ | grep -i og:image` shows `og-image-v2.png?v=2`.
- `curl -s https://www.everencewealth.com/en/philosophy | grep -i og:image` shows `og-image-v2.png?v=2`.
- LinkedIn Post Inspector preview shows the new wordmark + "Bridge the Retirement Gap" card.

### Out of scope

- No change to the image file itself (already generated as `og-image-v2.png`).
- No change to per-article `featured_image_url` values (those are article-specific and already correct).
- No DB or schema changes.

