# Three-Issue Batch — A.5, B.1, B.2

## Issue A.5 — Location pages: swap Article → FinancialService (compare pages keep Article)

**Root cause:** `generateArticleSchema()` in `supabase/functions/serve-seo-page/index.ts` (line 1685) emits `Article` for both `content_type === 'compare'` AND `content_type === 'locations'`. Compare is correct; locations should be `FinancialService`.

### Code changes in `supabase/functions/serve-seo-page/index.ts`

**1. Extend `PageMetadata` (line 241)** to carry the location-specific fields needed for FinancialService schema:

```ts
interface PageMetadata {
  // ...existing...
  // Location-only fields (populated when content_type === 'locations')
  city_name?: string
  region?: string         // state code, e.g. "CA"
  country?: string        // e.g. "United States"
}
```

**2. Populate them in the locations fetch branch (line 557)**:

```ts
return {
  metadata: {
    // ...existing fields...
    content_type: 'locations',
    location_overview: data.location_overview,
    city_name: data.city_name,
    region: data.region,
    country: data.country,
  }
}
```

**3. Branch `generateArticleSchema()` (line 1685)**:

```ts
function generateArticleSchema(metadata: PageMetadata): string {
  if (metadata.content_type === 'qa' || metadata.content_type === 'blog') {
    return ''
  }

  // Locations get FinancialService instead of Article
  if (metadata.content_type === 'locations') {
    return generateFinancialServiceSchema(metadata)
  }

  // Compare pages keep Article (unchanged block below)
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    // ...existing Article shape, untouched...
  }
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}
```

**4. Add `generateFinancialServiceSchema()`** (new helper, placed directly above `generateArticleSchema`):

```ts
function generateFinancialServiceSchema(metadata: PageMetadata): string {
  const stateName = US_STATE_NAMES[metadata.region || ''] || metadata.region || ''
  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${metadata.canonical_url}#financialservice`,
    "name": `Everence Wealth - ${metadata.city_name}, ${metadata.region}`,
    "description": metadata.meta_description,
    "url": metadata.canonical_url,
    "image": {
      "@type": "ImageObject",
      "url": metadata.featured_image_url || `${BASE_URL}/og-default.png`,
      "width": 1200,
      "height": 630
    },
    "areaServed": {
      "@type": "City",
      "name": metadata.city_name,
      "containedInPlace": {
        "@type": "State",
        "name": stateName,
        "containedInPlace": {
          "@type": "Country",
          "name": metadata.country || "United States"
        }
      }
    },
    "parentOrganization": { "@id": `${BASE_URL}/#organization` },
    "priceRange": "$$$",
    "serviceType": "Wealth Management",
    "knowsAbout": [
      "retirement planning", "tax strategy", "asset protection",
      "estate planning", "indexed universal life insurance"
    ],
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".speakable-answer"]
    }
  }
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}
```

A small `US_STATE_NAMES` map (or fall back to the `region` value) will be added near the top of the file. All other emitted schemas (Place, BreadcrumbList, WebPage, Organization, PostalAddress, EducationalOccupationalCredential, ImageObject, ListItem, Country, SpeakableSpecification) remain untouched.

---

## Issue B.1 — Glossary sitemap empty in production

The committed `public/sitemaps/{en,es}/glossary.xml` already contain 11 URLs each. Live serves the older "intentionally empty" copies from a previous deploy. **No code change needed — a Publish pushes the populated files.** I'll re-verify after Publish; if still empty, the fallback is to route `/sitemaps/*/glossary.xml` through the existing `regenerate-sitemap` edge function (which already has `generateGlossarySitemap()` returning the populated XML).

---

## Issue B.2 — Location URLs contain literal commas

**Confirmed:** 30 rows in `location_pages` have `city_slug` values like `los-angeles,-ca`, `austin,-tx` (21 EN + 9 ES). All commas are in `city_slug`; `topic_slug` values are clean. The table has no `slug` column.

### Implementation

**1. SQL migration** — `supabase/migrations/<ts>_strip_commas_from_city_slugs.sql`:

```sql
-- Backup affected rows
CREATE TABLE IF NOT EXISTS public.location_pages_backup_20260424 AS
SELECT * FROM public.location_pages WHERE city_slug LIKE '%,%';

-- Strip: ",-" -> "-", any stray "," -> ""
UPDATE public.location_pages
SET city_slug = REPLACE(REPLACE(city_slug, ',-', '-'), ',', '')
WHERE city_slug LIKE '%,%';

-- Verifier — abort before constraint if anything dirty remains
DO $$
DECLARE dirty INT;
BEGIN
  SELECT COUNT(*) INTO dirty FROM public.location_pages
    WHERE city_slug LIKE '%,%' OR topic_slug LIKE '%,%';
  IF dirty > 0 THEN RAISE EXCEPTION 'comma cleanup left % dirty rows', dirty; END IF;
END $$;

-- Lock against regression
ALTER TABLE public.location_pages
  ADD CONSTRAINT location_pages_city_slug_no_comma CHECK (city_slug NOT LIKE '%,%');
ALTER TABLE public.location_pages
  ADD CONSTRAINT location_pages_topic_slug_no_comma CHECK (topic_slug NOT LIKE '%,%');
```

**2. Middleware 301 redirects** — add early in the request handler in `functions/_middleware.js` (before SEO routing):

```js
// 301: strip commas from /<lang>/(locations|ubicaciones)/* paths
if (/^\/(en|es)\/(locations|ubicaciones)\/[^\/]*,/.test(url.pathname)) {
  const cleaned = url.pathname.replace(/,(?=-)/g, '').replace(/,/g, '');
  if (cleaned !== url.pathname) {
    return Response.redirect(new URL(cleaned + url.search, url.origin).toString(), 301);
  }
}
```

`%2C` is decoded by Cloudflare before pattern matching, so the same regex covers both raw and encoded comma URLs.

**3. Sitemap regeneration** — call `regenerate-sitemap` after the migration so `public/sitemaps/<lang>/locations.xml` rebuilds with comma-free `<loc>` values. The existing row trigger also invalidates the `/locations` hub cache automatically (10-min TTL).

---

## Deployment order

1. Approve SQL migration (Issue B.2) — strips commas, adds CHECK constraints.
2. Edge function deploy of `serve-seo-page` (Issue A.5) — automatic on save.
3. Trigger `regenerate-sitemap` to refresh `locations.xml`.
4. Click **Publish** — pushes:
   - populated `glossary.xml` files (Issue B.1)
   - middleware comma-redirect rule (Issue B.2)

---

## Files changed

- `supabase/functions/serve-seo-page/index.ts` — extend `PageMetadata`, populate location fields, branch `generateArticleSchema`, add `generateFinancialServiceSchema`
- `supabase/migrations/<timestamp>_strip_commas_from_city_slugs.sql` — new
- `functions/_middleware.js` — add comma-stripping 301 block

No changes to compare-page schema, blog schema, or any client-side code.

---

## Verification battery (after Publish)

```bash
echo "=== A.5: locations have FinancialService, no Article ==="
curl -sH "User-Agent: Googlebot" \
  "https://www.everencewealth.com/en/locations/ohio/retirement-income-strategies-ohio" \
  | grep -oE '"@type":"[^"]+"' | sort -u

echo "=== A.5: compare pages still emit Article ==="
curl -sH "User-Agent: Googlebot" \
  "https://www.everencewealth.com/en/compare/401k-vs-roth-401k-employer-retirement-comparison-2025" \
  | grep -oE '"@type":"[^"]+"' | sort -u

echo "=== B.1: glossary sitemap populated ==="
for lang in en es; do
  printf "%-3s urls: %s\n" "$lang" \
    "$(curl -s https://www.everencewealth.com/sitemaps/$lang/glossary.xml | grep -c '<url>')"
done

echo "=== B.2: locations comma-free ==="
echo "comma URLs in sitemap: $(curl -s https://www.everencewealth.com/sitemaps/en/locations.xml | grep -cE ',-|%2C')"
curl -A 'Googlebot' -o /dev/null -s -w '%{http_code} -> %{redirect_url}\n' \
  "https://www.everencewealth.com/en/locations/los-angeles,-ca/retirement-planning-los-angeles"
```

**Pass criteria:**
- Locations: `FinancialService` present, `Article` absent.
- Compare: `Article` still present.
- Glossary: count > 0 for both `en` and `es`.
- Locations sitemap comma count = 0; old comma URL returns 301 to clean path.
