
# Fix Blog Article Count to Show Actual Amount

## Problem Identified

The dashboard shows "1,000" for Blog Articles because:

1. **Supabase has a default limit of 1000 rows per query**
2. The current code on line 125 of `useUnifiedDashboardStats.ts` fetches all articles to count them:
   ```typescript
   supabase.from('blog_articles').select('status, language, featured_image_url, external_citations, translations')
   ```
3. This returns only the first 1,000 rows, so all counts are capped

**Actual count in database: 3,271 articles** (all published)

---

## Solution

Replace full-row fetches with efficient `COUNT` queries using `{ count: 'exact', head: true }` which bypasses the 1000-row limit.

---

## Changes to `useUnifiedDashboardStats.ts`

### Replace Article Data Fetching

**Before:**
```typescript
// Articles by status
supabase.from('blog_articles').select('status, language, featured_image_url, external_citations, translations'),

// Articles by language count
supabase.from('blog_articles').select('language').eq('status', 'published'),
```

**After:**
```typescript
// Total articles count
supabase.from('blog_articles').select('id', { count: 'exact', head: true }),

// Article status counts
supabase.from('blog_articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
supabase.from('blog_articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
supabase.from('blog_articles').select('id', { count: 'exact', head: true }).eq('status', 'archived'),

// Content health counts
supabase.from('blog_articles').select('id', { count: 'exact', head: true }).is('featured_image_url', null),
supabase.from('blog_articles').select('id', { count: 'exact', head: true }).or('external_citations.is.null,external_citations.eq.[]'),

// Language counts (one query per language)
// Use efficient COUNT queries for each supported language
```

---

## Implementation Summary

| Query | Before | After |
|-------|--------|-------|
| Total Articles | `select *` (capped at 1000) | `select id, count: exact, head: true` (no limit) |
| By Status | Process 1000 rows client-side | Separate COUNT per status |
| Missing Images | Process 1000 rows client-side | COUNT with `is('featured_image_url', null)` |
| Missing Citations | Process 1000 rows client-side | COUNT with null/empty check |
| By Language | `select language` (capped at 1000) | COUNT per language |

---

## File to Modify

| File | Changes |
|------|---------|
| `src/hooks/useUnifiedDashboardStats.ts` | Replace row-fetching queries with COUNT queries |

---

## Verification

After fix, the dashboard will show:
- **Blog Articles: 3,271** (actual count)
- Correct status breakdown
- Correct language distribution
- Accurate content health metrics

All counts will update in real-time as content is added/modified.
