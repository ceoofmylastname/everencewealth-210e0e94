

## No middleware change needed — current setup is already correct

After inspecting `functions/_middleware.js` and `functions/_routes.json`, the premise of "Prompt 2" doesn't match this codebase. There is nothing to replace.

### What's actually in production today

**`functions/_routes.json`** already excludes every sitemap path from middleware:
```json
"exclude": [
  "/sitemap.xml",
  "/sitemap-index.xml",
  "/ai-sitemap.xml",
  "/sitemaps/*",
  ...
]
```
This means Cloudflare Pages serves `/sitemaps/en/blog.xml`, `/sitemaps/es/qa.xml`, and every other `/sitemaps/{lang}/{type}.xml` path **directly as a static file from `dist/`** — no middleware invocation, no per-type code, no routing logic.

**`functions/_middleware.js`** has zero per-type sitemap rules. It contains:
- `www.` redirect, legacy 301 map, 404 blocklist
- Blog SSR fallback (`/{lang}/blog/...`)
- Q&A SSR fallback (`/{lang}/qa/...`)
- Generic SEO-tag injection for HTML pages

There are no rules matching `blog.xml`, `qa.xml`, or `comparisons.xml` to remove. The "per-type rules" referenced in the prompt do not exist in this project.

### Why no change is the right call

Your previous deploy (Prompt 1) regenerated all 16 sitemaps as real static XML files in `public/sitemaps/{en,es}/*.xml`. The build copies them to `dist/`. Cloudflare serves them directly — the fastest and most reliable path. A middleware proxy would:

1. Add a per-request function invocation on every Googlebot sitemap fetch (small cost, but unnecessary).
2. Require removing `/sitemaps/*` from `_routes.json`, which would route every sitemap request through the middleware crash path.
3. Not change behavior — same files served either way.

### The one real concern this prompt was probably meant to address

The reason GSC may still show stale sitemap data after Publish is **not** middleware — it's Cloudflare's edge cache holding old copies of the XML files. If verification (Step 2 from the previous round) shows old URL counts in production, the fix is one of:

- **Cloudflare cache purge** for `/sitemap.xml`, `/sitemap-index.xml`, `/sitemaps/en/*`, `/sitemaps/es/*` — done from the Cloudflare Pages dashboard, not from code.
- **Add `Cache-Control: public, max-age=3600, must-revalidate`** to a `public/_headers` file — but Lovable hosting does not process `_headers`, so this does nothing here. Cache TTL is whatever Cloudflare's defaults are for `.xml`.

If you want belt-and-suspenders, the only meaningful code change would be a single new content-type assertion line in `scripts/generateSitemap.ts` to verify each generated XML file passes XML validation before write — but that's a generator hardening, not a middleware change.

### Recommended action

Skip Prompt 2. Move directly to verifying production after the Publish from the previous round, then ship Prompt 7 (React Helmet → SSR JSON-LD migration), which is the real next deploy.

If verification shows stale XML in production, the fix is Cloudflare cache purge — surface that as a separate operational step, not a code change.

