
# Add Internal Links to SSR HTML Output

## Diagnosis

Internal links are **client-side only** -- they are rendered by React components (`InternalLinksSection` in `BlogArticle.tsx`) after JavaScript loads. The SSR edge function (`serve-seo-page/index.ts`) that serves HTML to search engine crawlers does NOT include internal links at all:

1. **PageMetadata interface** (line 250) has no `internal_links` field
2. **Blog metadata mapping** (lines 369-386) fetches `select('*')` but never maps `internal_links` to metadata
3. **Q&A metadata query** (line 303) explicitly lists columns and excludes `internal_links`
4. **HTML template** (lines 1835-1884) has no rendering logic for internal links

This means Google, Bing, and AI crawlers see zero internal links on every page.

## Solution

Add internal links to the SSR HTML output in `supabase/functions/serve-seo-page/index.ts` for both blog and Q&A pages.

### Changes (single file: `supabase/functions/serve-seo-page/index.ts`)

**1. Add `internal_links` to the `PageMetadata` interface**

Add an optional field:
```typescript
internal_links?: Array<{ text: string; url: string; title?: string; funnelStage?: string }>;
```

**2. Map `internal_links` in `fetchBlogMetadata`**

In the metadata return object (line 386), add:
```typescript
internal_links: exactMatch.internal_links,
```

**3. Add `internal_links` to the Q&A select query and metadata mapping**

In `fetchQAMetadata` (line 303), add `internal_links` to the select string. In the metadata return (around line 325), add:
```typescript
internal_links: exactMatch.internal_links,
```

**4. Render internal links in the HTML template**

After the article content div and before the CTA section (around line 1875), add a new section that renders internal links as a simple styled `<nav>` block with anchor tags:

```html
<nav class="internal-links-section" aria-label="Related articles">
  <h3>Related Reading</h3>
  <ul>
    <li><a href="/fi/blog/slug" title="Title text">Anchor text</a></li>
    ...
  </ul>
</nav>
```

This will be conditionally rendered only when `metadata.internal_links` exists and has items.

**5. Add CSS for the internal links section**

Add minimal styling within the existing `<style>` block to match the page design:
- A bordered card-like container
- Clean list of links with arrow indicators
- Responsive layout

## What This Achieves

- All internal links will appear in the raw HTML source served to crawlers
- Google can crawl the TOFU/MOFU/BOFU funnel link structure
- No visual changes needed for client-side users (React already renders them)
- Links include proper `title` attributes for SEO
- Works for both blog articles and Q&A pages

## Files Modified
- `supabase/functions/serve-seo-page/index.ts` (4 edits: interface, blog metadata, QA metadata, HTML template)

## Verification
After deployment, view page source on any blog or Q&A URL and search for the internal link URLs -- they should now appear in the raw HTML.
