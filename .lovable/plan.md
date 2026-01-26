
# Fix Buyers Guide: Disable SEO Edge Function Routing

## Problem Summary

The Buyers Guide pages (`/:lang/buyers-guide`) are completely broken in production because:

1. **Wrong Asset Path**: The edge function returns HTML containing `<script type="module" src="/src/main.tsx">` which only exists in development — it fails with "Failed to load module script" in production
2. **Missing CSS**: No production CSS stylesheet is included, so the page appears unstyled
3. **Middleware Intercept**: The Cloudflare middleware routes these pages to the edge function instead of letting the normal React SPA handle them

## Solution: Remove Buyers Guide from SEO Routing

The fastest fix is to **exclude** the Buyers Guide route from the middleware's SEO patterns. This will let Cloudflare serve the standard `index.html` (which contains the production hashed CSS/JS assets), and React Router will render the `BuyersGuide` component client-side.

### Files to Update

| File | Change |
|------|--------|
| `functions/_middleware.js` | Remove `buyers-guide` from `SEO_ROUTE_PATTERNS` array |

### Implementation Details

**Current code (lines 20-24):**
```javascript
const SEO_ROUTE_PATTERNS = [
  new RegExp(`^/(${LANG_PATTERN})/locations/?$`),
  // ← DELETE THIS LINE:
  new RegExp(`^/(${LANG_PATTERN})/buyers-guide/?$`),
  new RegExp(`^/(${LANG_PATTERN})/blog/[^/]+$`),
  // ...
];
```

**After fix:**
```javascript
const SEO_ROUTE_PATTERNS = [
  new RegExp(`^/(${LANG_PATTERN})/locations/?$`),
  // Buyers Guide removed — handled by React SPA routing
  new RegExp(`^/(${LANG_PATTERN})/blog/[^/]+$`),
  // ...
];
```

### What Happens After This Fix

1. User visits `/nl/buyers-guide`
2. Cloudflare middleware does NOT match any SEO pattern
3. Request falls through to `/* → /index.html 200` (SPA fallback in `_redirects`)
4. Browser loads `index.html` with production CSS (`/assets/index-[hash].css`) and JS (`/assets/index-[hash].js`)
5. React Router matches `/:lang/buyers-guide` → renders `<BuyersGuide />` component
6. Full styling and functionality work correctly

### Trade-offs

| Aspect | Before Fix | After Fix |
|--------|------------|-----------|
| Page loads | ❌ Broken (no CSS/JS) | ✅ Works normally |
| SEO meta tags | ✅ Server-rendered | ❌ Client-side only* |
| Hreflang tags | ✅ In HTML source | ❌ Client-side only* |
| React hydration | ❌ Fails completely | ✅ Works |

*The Buyers Guide already has client-side `<Helmet>` tags via `useBuyersGuideTranslation()` hook — search engines with JavaScript rendering (Google, Bing) will still see correct meta tags. For full SSR SEO, a follow-up SSG script can be added later.

### Future Enhancement (Optional)

To restore proper SEO with static pre-rendering (matching the homepage/blog pattern), create:
- `scripts/generateStaticBuyersGuide.ts` — generates `dist/{lang}/buyers-guide/index.html` for all 10 languages at build time
- Add to `build.sh` after other SSG scripts
- Add to `public/_redirects` to serve static files directly

This is NOT required for the immediate fix but recommended for best SEO practice.

## Validation After Deployment

1. Visit `https://www.delsolprimehomes.com/nl/buyers-guide`
2. Page should load with full styling
3. Language switcher should work
4. All sections should translate correctly
5. No console errors about "Failed to load module script"
