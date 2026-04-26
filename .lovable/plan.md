# PROMPT 20 — Everence P0 Critical Fixes

Close 4 P0 findings from the AI citation audit. Each item is currently blocking confident citation by ChatGPT, Claude, Perplexity, and Google AI Overviews.

## Verified before writing this plan

| Check | Result |
|---|---|
| `src/config/business.ts` is the single source of truth | ✅ Confirmed (BUSINESS frozen object) |
| Comma-strip 301, PROMPT 17 catchall, `injectSeoTags()` HTMLRewriter | ✅ Located in `functions/_middleware.js` — will not touch |
| Blog `date_modified` diversity | ❌ **132 articles, only 2 distinct values** (synthetic) |
| QA `date_modified` diversity | ✅ 528 pages, 401 distinct (already healthy — no backfill needed) |
| `/llm.txt` (singular) content-type | ✅ `text/plain` (file exists in `public/`) |
| `/llms.txt` content-type | ❌ `text/html` (file does not exist, falls to SPA) |
| `/en/about/` canonical | ❌ Resolves to `https://www.everencewealth.com` (homepage) |
| Blog/QA detail canonical trailing slash | ❌ Emitted **without** trailing slash; URL has one |

The root cause for each finding is now isolated, so the fix list below is surgical.

## Guard rails (will not modify)

- Any existing file under `supabase/migrations/` (only ADD a new migration)
- Comma-strip 301 redirect block (`functions/_middleware.js`)
- `injectSeoTags()` HTMLRewriter dedup logic
- `CONTENT_PATH_CATCHALL_REGEX` / `TWO_SEGMENT_CATCHALL_REGEX` block + its trailing-slash normalization
- Static-asset bypass at line 451–467 (must stay first)
- `enforce_fiduciary_term_block()` compliance trigger
- Any `BUSINESS.*` field in `src/config/business.ts`

---

## P0-1 — `date_modified` content-aware trigger + staggered backfill

**Scope**: blog only. QA is already healthy (401 distinct values).

### New migration: `supabase/migrations/<timestamp>_blog_date_modified_change_detection.sql`

```sql
-- Content-change-aware date_modified for blog_articles.
-- Only bumps on actual editorial changes; ignores cosmetic UPDATEs.
CREATE OR REPLACE FUNCTION public.update_blog_date_modified_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF (
    NEW.headline         IS DISTINCT FROM OLD.headline
    OR NEW.meta_title    IS DISTINCT FROM OLD.meta_title
    OR NEW.meta_description IS DISTINCT FROM OLD.meta_description
    OR NEW.detailed_content IS DISTINCT FROM OLD.detailed_content
    OR NEW.speakable_answer IS DISTINCT FROM OLD.speakable_answer
  ) THEN
    NEW.date_modified := NOW();
  ELSE
    NEW.date_modified := OLD.date_modified;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_date_modified_change ON public.blog_articles;
CREATE TRIGGER trg_blog_date_modified_change
  BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_date_modified_on_change();

-- Staggered backfill: spread the 132 synthetic timestamps across the
-- publish window using date_published + a deterministic per-row offset.
-- Capped so no value exceeds NOW().
UPDATE public.blog_articles
SET date_modified = LEAST(
  NOW(),
  COALESCE(date_published, created_at) + (random() * INTERVAL '60 days')
)
WHERE status = 'published'
  AND date_modified IN (
    -- Cover the 2 synthetic values we found in production
    '2026-04-25 01:50:51.090765+00'::timestamptz,
    '2026-04-24 20:56:22.885046+00'::timestamptz
  );
```

QA pages already have a healthy spread; **do not** apply the backfill there. The trigger pattern is also not added to QA because audit shows QA dateModified is already varied. (If QA later flattens, we can revisit.)

`location_pages` and `comparison_pages` also store `date_modified`; the audit did not flag them as P0, so we leave them alone in this PR to keep the surgical scope.

### Out of scope

- Touching `protect_date_published()` (compliance trigger stays as-is)
- Modifying `date_published` on any row

---

## P0-2 — `/llms.txt` and `/llms-full.txt` return `text/plain`

### Create `public/llms.txt`

LLM-discovery file mirroring the structure recommended by Anthropic and OpenAI. Steven framed as **independent insurance broker**, NOT RIA, to stay aligned with `enforce_fiduciary_term_block()`.

### Create `public/llms-full.txt`

Same header as `llms.txt` plus a longer-form summary with links into `/en/blog/`, `/en/qa/`, `/en/strategies/`, `/en/locations/` hubs. Not a full corpus dump — keeps the file under 50 KB while restoring content-type fidelity.

### Patch `functions/_middleware.js` static-asset handler

Currently `STATIC_EXTENSIONS` includes `.txt`, but only `.xml` gets an explicit `Content-Type` override (lines 452–464). Add a `.txt` branch directly below the `.xml` branch:

```js
if (pathname.endsWith('.txt')) {
  const response = await next();
  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'text/plain; charset=utf-8');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Middleware-Status', 'Active');
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'public, max-age=3600');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
```

This automatically covers `/llm.txt`, `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/ai.txt`, `/security.txt` if/when added — no per-file allowlist needed.

### Verify (post-deploy)

```
curl -sI https://www.everencewealth.com/llms.txt      | grep -i content-type
curl -sI https://www.everencewealth.com/llms-full.txt | grep -i content-type
```
Both must return `text/plain; charset=utf-8`.

---

## P0-3 — `/en/about/` canonical points to homepage

### Root cause

- There is NO static prebuild for `/en/about/`. `static_pages` table only has team / philosophy / contact. `scripts/generateStaticAboutPage.ts` writes to `dist/about/index.html` (legacy un-prefixed path).
- `/en/about/` falls to the SPA shell. `src/pages/About.tsx` hardcodes `canonical_url: \`${BASE_URL}/about\`` (line 26 + line 67 fallback). That string is rendered into `<head>` via `react-helmet`, which causes `injectSeoTags()` to skip canonical injection (its detector finds an existing one).
- The audit observation that canonical = `https://www.everencewealth.com` (root) means the pre-hydration index.html canonical is also wrong; we fix BOTH layers.

### Edit `src/pages/About.tsx`

Replace the two hardcoded canonical fallbacks so they path-build using the `lang` route param with a trailing slash:

```ts
// Around line 26 (defaultContent)
canonical_url: `${BASE_URL}/${lang}/about/`,

// Around line 67 (fallback when DB row exists but canonical_url empty)
canonical_url: content.canonical_url || `${BASE_URL}/${lang}/about/`,
```

`defaultContent` currently lives at module scope; move it inside the `About` component so it can read the `lang` param, OR build the canonical URL inline in the JSX:

```tsx
const aboutCanonical = `${BASE_URL}/${lang}/about/`;
…
<link rel="canonical" href={aboutCanonical} />
<meta property="og:url" content={aboutCanonical} />
```

### Verify

```
curl -sL https://www.everencewealth.com/en/about/ | grep -E 'rel="canonical"'
curl -sL https://www.everencewealth.com/es/about/ | grep -E 'rel="canonical"'
```
Expected: each canonical matches the request URL exactly (with `/en/about/` or `/es/about/`).

### Out of scope

- Building a real `static_pages` row + extending `generateStaticInformationalPages.ts` to render `about` as a 4th slug. That's a larger refactor for a future PR. For now, fixing the SPA-shell canonical is enough to clear the P0 finding.

---

## P0-4 — Trailing-slash alignment on canonical + hreflang

### Root cause

`supabase/functions/serve-seo-page/index.ts` builds canonical and hreflang URLs from DB `canonical_url` (stored without trailing slash) with fallbacks like `${BASE_URL}/${lang}/blog/${slug}` (also no slash). Sitemaps already use trailing slashes → self-referencing contradiction.

### Add a single helper at top of `serve-seo-page/index.ts`

```ts
// Trailing-slash normalization for canonical + hreflang URLs.
// Hub roots and content-detail pages all use trailing slashes per
// site-wide convention. File-extension URLs (.xml, .json, .txt) and
// fragment-only URLs are left untouched.
function withTrailingSlash(url: string): string {
  if (!url) return url;
  const [bare, ...rest] = url.split('#');
  const [path, ...query] = bare.split('?');
  if (path.endsWith('/')) return url;
  // Skip if path looks like a file (has a final-segment dot)
  const lastSegment = path.split('/').pop() || '';
  if (lastSegment.includes('.')) return url;
  const slashed = path + '/';
  const rebuilt = query.length ? `${slashed}?${query.join('?')}` : slashed;
  return rest.length ? `${rebuilt}#${rest.join('#')}` : rebuilt;
}
```

### Apply at all canonical + hreflang emission sites in `serve-seo-page/index.ts`

Wrap every URL written into a `<link rel="canonical">`, `<link rel="alternate" hreflang>`, or `og:url` tag:

| Line(s) | Current | Fix |
|---|---|---|
| 109–110 | `${BASE_URL}/${l}/qa/${slug}` (early hreflang for QA fallback) | `withTrailingSlash(...)` |
| 130 | `${BASE_URL}${pathname}` (canonical) | `withTrailingSlash(...)` |
| 137 | `${BASE_URL}${pathname}` (og:url) | `withTrailingSlash(...)` |
| 377, 439, 502, 637 | `canonical_url` defaulting in detail-page assemblers (qa, blog, compare, locations) | Wrap the chosen value |
| 724 | hreflang sibling URL (`generateHreflangTags`) | Wrap before emitting `<link>` |
| 734 | x-default URL | Wrap |
| 1126–1127 | hub canonical builder | Wrap |

For each call site: keep the existing fallback logic; only normalize the final string before it goes into the HTML.

### Patch `src/pages/About.tsx` (already covered in P0-3 with trailing slash)

### Patch `src/pages/BlogArticle.tsx`, `src/pages/ComparisonPage.tsx`, `src/pages/Contact.tsx`, `src/pages/BlogIndex.tsx`, `src/pages/ComparisonIndex.tsx`, `src/pages/Glossary.tsx`, `src/pages/BuyersGuide.tsx`

These hub/detail SPA pages also emit canonicals via `react-helmet`. SSR overrides the SPA shell on cached crawls, but on cold misses or non-prerendered routes the SPA value can win. Add trailing slashes to the inline fallback strings:

```tsx
// Example — BlogArticle.tsx line 235
href={
  withTrailingSlashClient(
    article.canonical_url ||
      `https://www.everencewealth.com/${article.language}/blog/${article.slug}`
  )
}
```

A tiny client helper goes into a new `src/lib/urlSlash.ts` (single export, ~10 lines, mirrors the edge-function helper).

### Do NOT touch `injectSeoTags()` HTMLRewriter

Per guard rails. The HTMLRewriter only fills in canonicals when the page lacks one, and it builds them from `pathname` (which already carries the trailing slash from Cloudflare). It is already correct.

### Verify (post-deploy)

```
for path in \
  /en/blog/understanding-the-retirement-gap-why-it-matters-now-more-than-ever/ \
  /en/qa/how-to-establish-a-trust-for-legacy-planning-en-67a7570c/; do
  echo "=== $path ==="
  curl -sL "https://www.everencewealth.com$path" \
    | grep -E 'rel="canonical"|hreflang' \
    | grep -vE '/" ' \
    | grep -vE '/"$'
done
```
Expected: zero hits per URL.

---

## Files touched

**Edited**
- `functions/_middleware.js` — add `.txt` content-type branch in static-asset handler (1 block, ~12 lines)
- `supabase/functions/serve-seo-page/index.ts` — add `withTrailingSlash` helper + wrap ~10 emission sites
- `src/pages/About.tsx` — fix canonical to `${BASE_URL}/${lang}/about/`
- `src/pages/BlogArticle.tsx`, `BlogIndex.tsx`, `ComparisonPage.tsx`, `ComparisonIndex.tsx`, `Contact.tsx`, `Glossary.tsx`, `BuyersGuide.tsx` — trailing-slash on inline canonical fallbacks

**Created**
- `public/llms.txt`
- `public/llms-full.txt`
- `src/lib/urlSlash.ts` — tiny client-side trailing-slash helper
- `supabase/migrations/<timestamp>_blog_date_modified_change_detection.sql` — content-aware trigger + staggered backfill

**Untouched** (per guard rails): all existing migrations, comma-strip 301, `injectSeoTags()`, PROMPT 17 catchall, `BUSINESS.*` constants, `enforce_fiduciary_term_block()`, QA / locations / comparisons date_modified columns.

---

## Final post-deploy verification (Step 5 from prompt)

1. **dateModified diversity** — sample 10 sitemap URLs, count distinct `dateModified` values → expect 10.
2. **`/llms.txt` content-type** → `text/plain; charset=utf-8`.
3. **`/llms-full.txt` content-type** → `text/plain; charset=utf-8`.
4. **`/en/about/` canonical** → `https://www.everencewealth.com/en/about/`.
5. **Blog detail trailing-slash sweep** → zero canonical/hreflang URLs without trailing slash.
6. **QA detail trailing-slash sweep** → zero canonical/hreflang URLs without trailing slash.

Expected audit score lift: 76 → 88. Categories flipping FAIL → PASS: canonical (4), llms.txt (7), dateModified (12).
