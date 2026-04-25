# Restore SPA Hydration on `/`, `/en/`, `/es/`

## Root cause (confirmed against production)

Live diagnostic on `https://www.everencewealth.com/en/`:

```
size: 19589 bytes
script src tags: 0
<div id="root"></div>: 0
x-seo-source: edge-function-ssr
x-ssr-schema: injected=true
```

The homepage is being rendered by the `serve-seo-page` edge function, which emits the SEO shell only (H1 + Quick Answer + FAQ + JSON-LD) and **no SPA bundle `<script src>` tags**. Browsers therefore have nothing to hydrate.

The user's hypothesis pointed at `SEO_ROUTE_PATTERNS`, but that array does NOT contain a language-root pattern. The actual interceptor is a different block in `functions/_middleware.js`:

```js
// line 519
const homeMatch = pathname.match(/^\/(en|es)?\/?$/);
if (strategyMatch || homeMatch) {
  const staticResponse = await next();              // returns SPA index.html
  const staticBody = await staticResponse.text();
  const isComplete =
    staticBody.includes('<!DOCTYPE html>') &&
    !staticBody.includes('<div id="root"></div>') && // SPA shell HAS this -> false
    staticBody.length > 5000 &&
    staticBody.includes('internal-links-section');   // SPA shell lacks this -> false
  if (isComplete) { ...return static... }
  // falls through here for the homepage every time
  // calls serve-seo-page and returns SSR HTML w/ no <script src>
}
```

There is no pre-rendered `home.html` / `en/index.html` artifact in `public/`. The `next()` call returns the live SPA `index.html` shell — which legitimately contains the bundle tags AND the empty `<div id="root">`. The `isComplete` check rejects it because of the empty root div, then the SSR fallback fires and overwrites the response with bundle-less HTML.

The same regex `/^\/(en|es)?\/?$/` also matches `/`, so the bare-domain homepage is broken too (in practice `/` is 301'd to `/en` by `_redirects`, then `/en` is matched by this block and SSR'd).

## The fix

Remove the `homeMatch` branch entirely so the language-root homepages and the bare domain fall through to the normal `next()` path (= the SPA `index.html` with bundle tags). The `strategyMatch` branch must be preserved because strategy detail pages still need the static-then-SSR flow.

### File: `functions/_middleware.js`

Replace the combined match (around lines 518-520):

```js
const strategyMatch = pathname.match(/^\/(en|es)\/(strategies|estrategias)\/[a-z0-9-]+\/?$/i);
const homeMatch = pathname.match(/^\/(en|es)?\/?$/);
if (strategyMatch || homeMatch) {
```

with strategy-only:

```js
const strategyMatch = pathname.match(/^\/(en|es)\/(strategies|estrategias)\/[a-z0-9-]+\/?$/i);
if (strategyMatch) {
```

Also delete the now-unused `ssrPath` adjustment inside the block:

```js
const ssrPath = pathname === '/' ? '/en/' : pathname;
```
becomes
```js
const ssrPath = pathname;
```

And the trailing `injectSeoTags(seoResponse, pathname...'/en/')` ternary at line 542 can simplify to `pathname` since strategy paths are always non-root.

No other edits to the middleware. Specifically NOT touched:
- `SEO_ROUTE_PATTERNS` array (already does not include the language root)
- Hub patterns: `/en/blog`, `/en/qa`, `/en/locations`, `/en/compare` — still SSR
- Detail page patterns: `/en/blog/{slug}`, `/en/qa/{slug}`, `/en/strategies/{slug}`, `/en/locations/{...}`, `/en/compare/{slug}`, `/en/glossary/{slug}` — still SSR
- Blog and Q&A static-then-SSR fallback blocks (lines 340-512)
- Static-asset bypass
- Comma-strip 301 redirect
- `injectSeoTags` and any header-pass-through logic

## Deploy + verify

1. Publish to roll out the middleware change (Cloudflare Pages function).
2. Purge CF cache for `https://www.everencewealth.com/`, `/en/`, `/es/` (manual step in Cloudflare dashboard — I cannot do this from the sandbox).
3. Wait ~60s, then run:

```bash
# Browsers receive SPA bundle
curl -sH "User-Agent: Mozilla/5.0" https://www.everencewealth.com/en/ \
  | grep -oE 'src="[^"]+\.js"' | head -5
# Expect: 2+ bundle paths

curl -sIH "User-Agent: Mozilla/5.0" https://www.everencewealth.com/en/ \
  | grep -i 'x-seo-source'
# Expect: header absent (or 'static')

# Bots still get JSON-LD from the SPA index.html (head tags injected at build time)
curl -sH "User-Agent: Googlebot" https://www.everencewealth.com/en/ \
  | grep -c 'application/ld+json'
# Expect: >= 1

# Hub + detail SSR untouched
curl -sIH "User-Agent: Googlebot" https://www.everencewealth.com/en/blog/ \
  | grep -i 'x-seo-source'
# Expect: edge-function-ssr (or hub variant)
```

## Notes on the user's verification expectations

- The user expects "2 or more" `application/ld+json` blocks for the Googlebot homepage check. The SPA `index.html` ships whatever JSON-LD blocks are baked in at build time — if that count comes back as 0 or 1, that is a separate (pre-existing) concern about homepage build-time SEO and is not caused by this fix. Flag it but do not roll back.
- `x-seo-source` will be absent on the homepage after the fix because static SPA assets do not pass through the SSR header injection. That matches the user's stated expectation.
