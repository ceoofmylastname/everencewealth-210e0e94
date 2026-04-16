

## Add Server-Side SEO Tag Injection to Cloudflare Middleware

### Problem
Googlebot sees canonical/hreflang tags only after JavaScript runs. The middleware already exists at `functions/_middleware.js` but doesn't inject SEO tags into the HTML response.

### Key Finding
A middleware already exists at `functions/_middleware.js` (not `.ts`). It handles SSR fallbacks, redirects, and static file routing. It also has the **wrong LANGUAGES array on line 14** — still listing 10 unsupported languages instead of `['en', 'es']`.

### Plan

**File: `functions/_middleware.js`** (modify existing — do NOT create a separate `_middleware.ts`)

1. **Fix line 14**: Change `LANGUAGES` from the 10-language array to `['en', 'es']`

2. **Fix lines 59-61**: Update the www-redirect from `delsolprimehomes.com` to `everencewealth.com` (legacy domain still hardcoded)

3. **Fix lines 76-78**: Update the Lovable subdomain redirect from `blog-knowledge-vault.lovable.app` / `delsolprimehomes.com` to use `everencewealth.com`

4. **Add SEO tag injection**: Before the final `return withMiddlewareStatus(await next())` at line 425, add an HTML rewriting step for all `text/html` responses on `/{lang}/...` routes:
   - Parse the language from the URL path
   - Build canonical, hreflang (self + alternate + x-default), and og:url tags
   - Use `HTMLRewriter` to append these tags into `<head>`
   - This covers ALL pages (strategies, blog, QA, glossary, etc.) in one place

5. **Also inject into existing SSR/static responses**: The blog and QA fallback paths (lines 131-312) already return full HTML. Wrap those returns through the same HTMLRewriter to ensure consistency.

### Technical Notes
- `HTMLRewriter` is a Cloudflare Workers/Pages native API — no imports needed
- The injection runs at the edge before the browser receives anything — Googlebot sees tags in raw HTML
- Tags are appended to `<head>`, so they won't duplicate if React also adds them client-side (though client-side tags will be redundant)
- The file stays as `.js` (not `.ts`) to match the existing Cloudflare Pages Functions setup
- No new files created — single file modification

### Verification
After deploying, view-source on any page like `https://www.everencewealth.com/en/strategies/whole-life` should show canonical and hreflang tags in the raw HTML without JavaScript execution.

