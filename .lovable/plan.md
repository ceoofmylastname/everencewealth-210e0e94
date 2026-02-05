
# Audit & Fix: Language Mismatch Redirect Issues Across All Content Types

## Problem Summary

The URL `/en/blog/din-kompletta-guide...` (a Swedish slug accessed via English prefix) was rendering Swedish content without redirecting. This happened because the smart redirect logic in `BlogArticle.tsx` was placed before React hooks, violating the Rules of Hooks and causing it to fail silently.

You've already fixed `BlogArticle.tsx`. Now we need to:
1. Verify the other content types (QA, Comparison, Location) have proper redirect logic
2. Add a preventive audit to catch any database issues

---

## Current Status by Content Type

| Content Type | File | Redirect Logic | Status |
|--------------|------|----------------|--------|
| Blog | `BlogArticle.tsx` | ✅ Fixed | Redirects to correct translation or native language |
| Q&A | `QAPage.tsx` | ✅ Already correct | Uses `_needsRedirect` flag, hooks called first |
| Comparison | `ComparisonPage.tsx` | ⚠️ Hook violation | Redirect logic before loading state check |
| Location | N/A | Not checked | Need to verify |

---

## Issues Found

### 1. ComparisonPage.tsx - Same Hook Violation Pattern

The comparison page has the **exact same issue** that was fixed in BlogArticle.tsx:

```typescript
// Line 53-61: isLoading check comes FIRST
if (isLoading) { ... }

// Line 64-81: error check comes SECOND  
if (error || !comparison) { ... }

// Line 83-111: Language mismatch check comes THIRD
if (comparison.language !== lang) { ... }
```

**Problem:** If a user accesses `/en/compare/german-slug`, the redirect check happens AFTER the loading/error states. This means if the comparison is fetched by slug (without language filter), it could render the wrong content.

**The query on line 32-46 only filters by `slug`, not by `language`**, so it will find the comparison regardless of language - then the redirect fires. This should work, but we should ensure consistency.

---

## Recommended Fixes

### Fix 1: Update ComparisonPage.tsx Query to Match QAPage Pattern

The QA page has a better pattern - it fetches with both slug AND language, then falls back to slug-only with a `_needsRedirect` flag.

### Fix 2: Add Database Audit Query

Create an admin tool or one-time query to find any:
- Slugs that appear multiple times across languages (expected)
- Slugs where the language field doesn't match the slug pattern (unexpected)
- Missing translations in the JSONB column

---

## Implementation Plan

### Step 1: Fix ComparisonPage.tsx (Same Pattern as BlogArticle)
Update the query to first try exact `slug + language` match, then fall back with redirect flag.

### Step 2: Verify LocationPage.tsx
Check if location pages have the same vulnerability.

### Step 3: Create Database Audit Queries
Run these queries to identify any existing mismatches:

```sql
-- Find all slug/language combinations to verify no cross-contamination
SELECT slug, language, COUNT(*) as occurrences
FROM blog_articles
WHERE status = 'published'
GROUP BY slug, language
HAVING COUNT(*) > 1;

-- Same for Q&A
SELECT slug, language, COUNT(*) as occurrences  
FROM qa_pages
WHERE status = 'published'
GROUP BY slug, language
HAVING COUNT(*) > 1;

-- Same for Comparisons
SELECT slug, language, COUNT(*) as occurrences
FROM comparison_pages
WHERE status = 'published'
GROUP BY slug, language
HAVING COUNT(*) > 1;
```

### Step 4: Add Server-Side Redirect in Edge Function (Defense in Depth)
Ensure the `serve-seo-page` edge function also handles language mismatches for SEO crawlers that don't execute JavaScript.

---

## Technical Details

### Files to Modify

1. **`src/pages/ComparisonPage.tsx`** - Update query pattern to match QAPage approach
2. **`src/pages/LocationPage.tsx`** (if exists) - Verify/fix redirect logic
3. **`supabase/functions/serve-seo-page/index.ts`** - Add server-side redirect for crawlers

### Database Validation

The translations JSONB column should always contain:
- Self-reference (current language → current slug)
- All sibling translations from the same `hreflang_group_id`

---

## Expected Result

After these fixes:
1. Any URL with language prefix mismatch will redirect to the correct version
2. Both client-side (React) and server-side (Edge Function) will handle mismatches
3. Database audit will catch any misconfigured records before they cause issues
4. Google will receive proper 301/302 redirects and remove the old URLs from their index
