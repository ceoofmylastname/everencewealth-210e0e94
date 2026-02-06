
# Fix: URL Length Limit Causing Language Mismatch Detection to Fail

## Root Cause Identified

The 404 Resolution Dashboard shows **0 language mismatches** because the database query to `qa_pages` is failing with a **400 Bad Request** error. The cause is that the Supabase query URL exceeds the browser's URL length limit.

### Evidence
- Network request to `qa_pages` returns **400 Bad Request**
- The URL contains ~500 slugs as query parameters, resulting in a URL over 15KB
- Browser/Supabase URL limit is approximately 8KB

### Database Verification
- There ARE **111 QA language mismatches** in the database (e.g., `/de/qa/swedish-slug` where content exists in Swedish)
- There are **0 blog mismatches** and **0 comparison mismatches** (all those URLs are truly gone)
- The total of **911 gone URLs** with 111 being fixable mismatches

## Solution

Batch the slug queries into smaller chunks (50 slugs per request) to stay within URL length limits.

### File to Modify

`src/hooks/useNotFoundAnalysis.ts`

### Changes Required

1. **Create a helper function for batched slug lookups**

```typescript
// Helper to batch slugs into chunks and query in parallel
async function batchedSlugLookup(
  table: "blog_articles" | "qa_pages" | "comparison_pages",
  slugs: string[],
  batchSize: number = 50
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  const uniqueSlugs = [...new Set(slugs)];
  
  // Process in batches
  for (let i = 0; i < uniqueSlugs.length; i += batchSize) {
    const batch = uniqueSlugs.slice(i, i + batchSize);
    const { data } = await supabase
      .from(table)
      .select("slug, language")
      .in("slug", batch)
      .eq("status", "published");
    
    data?.forEach(row => resultMap.set(row.slug, row.language));
  }
  
  return resultMap;
}
```

2. **Update countLanguageMismatches() to use batched lookup**

Replace the individual table queries with calls to the batched helper function.

3. **Update useLanguageMismatches() to use batched lookup**

Same pattern - use the batched helper instead of single large queries.

4. **Update useConfirmedGoneUrls() to use batched lookup**

Same pattern for the exclusion logic.

## Expected Result

After this fix:
- The dashboard will show **~111 Language Mismatches** (all QA pages)
- Users can click "Fix All" to remove these from `gone_urls`
- The smart redirect system will then handle these URLs automatically
- The "Confirmed 410s" count will decrease from 911 to ~800

## Technical Notes

- Current code: `.in("slug", uniqueSlugs.slice(0, 500))` creates a URL over 15KB
- Fixed code: Batches of 50 slugs creates URLs of ~2KB each
- Trade-off: Slightly more network requests but all will succeed
- Alternative: Could use Postgres function, but batching is simpler
