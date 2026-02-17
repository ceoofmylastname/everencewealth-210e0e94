

## Fix JSON-LD Schemas and Image Metadata for Multilingual Comparisons

### What's Already Working
- The translation edge function **already copies** `featured_image_url` from the English source (line 220)
- Alt text and caption **are already translated** by AI (lines 221-222)
- The `ComparisonPage.tsx` already sets `inLanguage`, canonical URL, and hreflang tags correctly

### What's Broken: Schema URLs Missing Language Prefix

The `comparisonSchemaGenerator.ts` builds all URLs as `/compare/slug` instead of `/{lang}/compare/slug`. This means Spanish pages have English-looking URLs in their JSON-LD, confusing search engines.

**File: `src/lib/comparisonSchemaGenerator.ts`**

1. **Article schema URL** (line 62): Change `${BASE_URL}/compare/${slug}` to `${BASE_URL}/${lang}/compare/${slug}`
2. **FAQ schema @id** (line 131): Same fix -- include language prefix
3. **Breadcrumb schema** (lines 148-168): Include language in all breadcrumb item URLs; translate "Comparisons" label to "Comparaciones" for Spanish
4. **Image schema description** (line 191): Replace stale "property buyers" fallback with `comparison.target_audience || 'financial planning'`
5. **Table schema** (line 177-178): The `about` and `description` fields are English-only -- make them use the translated headline when available

### Technical Approach

All schema generator functions already receive the full `comparison` object which includes `comparison.language`. We just need to use it in URL construction:

| Schema | Before | After |
|---|---|---|
| Article mainEntityOfPage | `/compare/{slug}` | `/{lang}/compare/{slug}` |
| FAQ @id | `/compare/{slug}#faq` | `/{lang}/compare/{slug}#faq` |
| Breadcrumb items | `/compare`, `/compare/{slug}` | `/{lang}/compare`, `/{lang}/compare/{slug}` |
| Image description fallback | "property buyers" | `target_audience` or "financial planning" |

Single file change: `src/lib/comparisonSchemaGenerator.ts`
