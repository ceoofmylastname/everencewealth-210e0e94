

# Fix: Language Mismatch Detection in 404 Resolver Dashboard

## Problem Summary

The 404 Resolution Dashboard at `/admin/404-resolver` currently shows **0 language mismatches**, but the database contains:
- **111 Q&A mismatches** - URLs like `/de/qa/swedish-slug` where content exists in Swedish
- **36 comparison mismatches** - URLs like `/fr/compare/english-slug` where content exists in English

**Total: 147 URLs that should be fixable with redirects**

## Root Cause Analysis

The `useNotFoundAnalysis.ts` hook has two bugs:

### Bug 1: Missing Comparison Pages
The regex pattern only matches `blog|qa`:
```typescript
// Line 107 & 197
const match = u.url_path.match(/^\/([a-z]{2})\/(blog|qa)\/(.+)$/);
```
This completely ignores the 36 comparison page mismatches.

### Bug 2: Query Logic May Be Failing
The current approach:
1. Fetches all `gone_urls` rows (947 URLs)
2. Parses them client-side to extract slugs
3. Queries `blog_articles` and `qa_pages` tables with `IN (slugs)` clause
4. Compares URL language prefix to database language

Potential issues:
- The 500-slug limit may be truncating results
- The join logic may have edge cases with slug encoding/decoding

## Solution

Update `useNotFoundAnalysis.ts` to:
1. Add `compare` to the regex pattern
2. Add comparison page lookup alongside blog and Q&A
3. Increase batch sizes or optimize the query approach

---

## Technical Implementation

### File: `src/hooks/useNotFoundAnalysis.ts`

#### Change 1: Update regex to include comparisons (Lines 107, 197, 285)

Replace:
```typescript
const match = u.url_path.match(/^\/([a-z]{2})\/(blog|qa)\/(.+)$/);
```

With:
```typescript
const match = u.url_path.match(/^\/([a-z]{2})\/(blog|qa|compare)\/(.+)$/);
```

#### Change 2: Add comparison page detection

In `countLanguageMismatches()` (around line 150) and `useLanguageMismatches()` (around line 245), add:

```typescript
// Extract comparison slugs
const compareSlugs = parsed.filter(p => p.content_type === "compare").map(p => p.slug);

// Check comparison pages
if (compareSlugs.length > 0) {
  const uniqueCompareSlugs = [...new Set(compareSlugs)];
  const { data: comparisonPages } = await supabase
    .from("comparison_pages")
    .select("slug, language")
    .in("slug", uniqueCompareSlugs.slice(0, 500))
    .eq("status", "published");

  const compareMap = new Map(comparisonPages?.map(c => [c.slug, c.language]) || []);
  
  for (const p of parsed.filter(p => p.content_type === "compare")) {
    const actualLang = compareMap.get(p.slug);
    if (actualLang && actualLang !== p.url_lang) {
      // Add to results or increment count
    }
  }
}
```

#### Change 3: Update `useConfirmedGoneUrls()` to exclude comparison mismatches

Same pattern - add comparison page lookup to the mismatch exclusion set.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useNotFoundAnalysis.ts` | Add comparison support to all three functions |

---

## Expected Result

After this fix, the 404 Resolution Dashboard will show:
- **Language Mismatches: 147** (instead of 0)
  - 111 Q&A pages
  - 36 comparison pages
- **Confirmed 410s: 800** (947 - 147 = 800)

Users can then click "Fix All" to remove these 147 URLs from `gone_urls`, allowing the smart redirect system to handle them properly.

---

## Verification Steps

After implementation:
1. Navigate to `/admin/404-resolver`
2. Click "Refresh" button
3. Verify "Language Mismatches" card shows **147** (or close to it)
4. Click "Language Mismatches" tab to see the list
5. Verify comparison pages appear with `compare` badge
6. Click "Fix All" to remove them from `gone_urls`
7. Test a sample URL to confirm redirect works

