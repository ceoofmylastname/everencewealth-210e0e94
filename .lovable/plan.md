

# Graceful Handling of Invalid Language/Slug Combinations

## Problem Summary

When a user visits a URL like `/sv/blog/evaluating-property-design...` (Swedish prefix + English slug), the system shows a blank page instead of:
1. Redirecting to the correct localized URL, or
2. Showing a helpful 404 page with language alternatives

The `translations` JSONB column already contains all sibling slugs, making intelligent redirects possible.

## Database Asset: The `translations` Column

Each article already has a mapping of all available translations:

```json
{
  "en": "evaluating-property-design-impact-on-value...",
  "sv": "navigera-i-den-arkitektoniska-landskapet...",
  "nl": "navigeren-door-het-architecturale-landschap...",
  ...
}
```

This data enables smart cross-language redirects.

## Solution Architecture

```text
User visits /sv/blog/english-slug
            ↓
┌───────────────────────────────────────┐
│ Step 1: Check if slug exists for /sv/ │
│         → Query: slug + language=sv   │
└───────────────────────────────────────┘
            ↓
       NOT FOUND
            ↓
┌───────────────────────────────────────┐
│ Step 2: Search slug in ANY language   │
│         → Query: slug + status=pub    │
└───────────────────────────────────────┘
            ↓
       FOUND in English (en)
            ↓
┌───────────────────────────────────────┐
│ Step 3: Check translations JSONB      │
│         → Does Swedish sibling exist? │
└───────────────────────────────────────┘
            ↓
       YES: sv → "navigera-i-den..."
            ↓
┌───────────────────────────────────────┐
│ Step 4: 301 Redirect to correct URL   │
│         → /sv/blog/navigera-i-den...  │
└───────────────────────────────────────┘
```

If no translation exists for the requested language, show a branded 404 page with links to available translations.

## Implementation Plan

### 1. Create Language Mismatch Handler Component

**File:** `src/components/LanguageMismatchHandler.tsx`

Creates a reusable component that:
- Looks up the slug in any language
- Checks the `translations` JSONB for the requested language
- Either redirects or shows available alternatives

```typescript
interface LanguageMismatchHandlerProps {
  slug: string;
  requestedLang: string;
  contentType: 'blog' | 'qa' | 'compare' | 'locations';
}

// Logic:
// 1. Query: Find article by slug (any language)
// 2. If found, check translations[requestedLang]
// 3. If sibling exists → Navigate to correct URL
// 4. If no sibling → Show branded 404 with alternatives
```

### 2. Update BlogArticle.tsx

**File:** `src/pages/BlogArticle.tsx`

Replace the current simple "not found" message with the smart handler:

**Before (lines 63-80):**
```typescript
if (article && article.language !== lang) {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Article Not Found | Del Sol Prime Homes</title>
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground">This article is not available in this language.</p>
        </div>
      </div>
    </>
  );
}
```

**After:**
```typescript
if (article && article.language !== lang) {
  // Check if translation exists for requested language
  const translations = article.translations as Record<string, string>;
  const correctSlug = translations?.[lang];
  
  if (correctSlug) {
    // Redirect to the correct localized URL
    return <Navigate to={`/${lang}/blog/${correctSlug}`} replace />;
  }
  
  // No translation available - show helpful 404 with alternatives
  return <LanguageMismatchNotFound 
    requestedLang={lang}
    actualLang={article.language}
    slug={slug}
    translations={translations}
    contentType="blog"
  />;
}
```

### 3. Create Branded 404 Component for Mismatches

**File:** `src/components/LanguageMismatchNotFound.tsx`

Creates a Del Sol Prime Homes branded 404 page that:
- Uses the brand colors (gold accents, Playfair Display headings)
- Shows the article title
- Lists available language versions with clickable links
- Provides navigation back to blog index

```typescript
interface Props {
  requestedLang: string;
  actualLang: string;
  slug: string;
  translations: Record<string, string>;
  contentType: 'blog' | 'qa' | 'compare' | 'locations';
}

// Example output:
// ┌────────────────────────────────────────────┐
// │  🌐 Article Not Available in Swedish       │
// │                                            │
// │  This article is available in:             │
// │  • English (Original)                      │
// │  • Dutch                                   │
// │  • German                                  │
// │  • French                                  │
// │                                            │
// │  [View in English]  [Browse Swedish Blog]  │
// └────────────────────────────────────────────┘
```

### 4. Apply Same Pattern to Q&A and Comparison Pages

**Files to update:**
- `src/pages/QAPage.tsx` - Add language mismatch detection
- `src/pages/ComparisonPage.tsx` - Add language mismatch detection

Same logic: check `translations` JSONB, redirect if sibling exists, show alternatives if not.

### 5. Update Edge Function for SSR Fallback

**File:** `supabase/functions/serve-seo-page/index.ts`

Add language mismatch detection to the edge function for cases where static files don't exist:

```typescript
// In fetchBlogMetadata function:
async function fetchBlogMetadata(supabase: any, slug: string, lang: string) {
  // First try: exact match (slug + language)
  const { data: exactMatch } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('slug', slug)
    .eq('language', lang)
    .eq('status', 'published')
    .maybeSingle();
  
  if (exactMatch) return exactMatch;
  
  // Second try: find by slug alone
  const { data: anyLangMatch } = await supabase
    .from('blog_articles')
    .select('id, language, translations, slug')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  
  if (anyLangMatch) {
    // Check if translation exists for requested language
    const correctSlug = anyLangMatch.translations?.[lang];
    if (correctSlug) {
      // Return 301 redirect to correct URL
      return { redirect: `/${lang}/blog/${correctSlug}` };
    }
  }
  
  return null;
}
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/LanguageMismatchNotFound.tsx` | Create | Branded 404 with language alternatives |
| `src/pages/BlogArticle.tsx` | Modify | Add smart redirect logic |
| `src/pages/QAPage.tsx` | Modify | Add smart redirect logic |
| `src/pages/ComparisonPage.tsx` | Modify | Add smart redirect logic |
| `supabase/functions/serve-seo-page/index.ts` | Modify | Add SSR redirect for edge cases |

## User Experience Flow

**Scenario 1: Translation exists**
```
User clicks: /sv/blog/english-slug
     ↓
System finds English article with slug
     ↓
System checks translations["sv"] → "swedish-slug"
     ↓
301 Redirect → /sv/blog/swedish-slug ✓
```

**Scenario 2: No translation for requested language**
```
User clicks: /hu/blog/english-slug
     ↓
System finds English article
     ↓
System checks translations["hu"] → null (not translated yet)
     ↓
Show branded 404:
  "This article is not yet available in Hungarian"
  Available in: [EN] [NL] [DE] [FR] [SV]
  [View in English] [Browse Hungarian Blog]
```

## Technical Details

### Redirect Headers

For SEO, use 301 (permanent) redirects to signal search engines:
- The English slug URL is not canonical
- The localized slug is the correct destination

### Noindex for 404 Pages

The language mismatch 404 page should include:
```html
<meta name="robots" content="noindex, nofollow">
```

### Language Name Mapping

Use localized language names for the available translations list:
```typescript
const LANGUAGE_NAMES: Record<string, Record<string, string>> = {
  en: { en: 'English', nl: 'Dutch', de: 'German', ... },
  sv: { en: 'Engelska', nl: 'Nederländska', de: 'Tyska', ... },
  // etc.
}
```

## Verification After Implementation

1. **Test redirect case:**
   - Visit `/sv/blog/evaluating-property-design-impact-on-value-and-investor-appeal-in-costa-del-sol`
   - Should 301 redirect to `/sv/blog/navigera-i-den-arkitektoniska-landskapet...`

2. **Test 404 with alternatives:**
   - Visit a URL where no translation exists
   - Should show branded 404 with available language links

3. **Check redirect headers:**
   - Network tab should show `301 Moved Permanently`
   - Response should include `Location: /sv/blog/correct-slug`

4. **Verify SEO:**
   - 404 pages should have `noindex`
   - Redirect pages should pass PageSpeed/Lighthouse

