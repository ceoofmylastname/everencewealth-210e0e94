
# GSC Indexing Issue Analysis & Fix Plan

## Executive Summary

After thorough code analysis, the core infrastructure for filtering non-published content is **already correctly implemented**. The 11,000+ GSC errors are likely caused by:
1. Legacy URLs in Google's index from before the current architecture
2. Some redirects in `_redirects` pointing to language-less paths
3. Time lag for Google to process 410 responses

---

## Current Implementation Status

### Already Working Correctly

| Component | Status | Evidence |
|-----------|--------|----------|
| Sitemap filters `status = 'published'` | ✅ | `scripts/generateSitemap.ts` lines 672, 713, 753, 793 |
| Edge function sitemap filters | ✅ | `supabase/functions/regenerate-sitemap/index.ts` lines 518-548 |
| `serve-seo-page` returns 410 for missing content | ✅ | Lines 1746-1764 (Wrecking Ball policy) |
| 410 for language mismatches | ✅ | Lines 1766-1784 |
| 410 for empty content | ✅ | Lines 1786-1853 |
| Middleware passes 410 responses | ✅ | `functions/_middleware.js` lines 165-186 |
| `gone_urls` exclusion from sitemaps | ✅ | `scripts/generateSitemap.ts` lines 652-658, 685-688 |

---

## Issues Identified

### Issue 1: Legacy Redirects Without Language Prefix
The `_redirects` file contains redirects to paths without language prefixes:

```text
/blog/bask-in-brilliance-understanding-costa-del-sols-sun-drenched  /blog/costa-del-sols-sunny-secret...  301
```

These should redirect to language-prefixed URLs like `/en/blog/...`

### Issue 2: Historical URLs in Google's Index
The `gone_urls` table contains 3,512 URLs that are correctly excluded from sitemaps and return 410, but Google still needs to process these.

---

## Recommended Actions

### Fix 1: Update Legacy Redirects in `_redirects`

Update the legacy blog redirects (lines 27-39) to include the `/en/` language prefix:

```text
# BEFORE (problematic)
/blog/slug-here  /blog/other-slug  301

# AFTER (correct)
/blog/slug-here  /en/blog/other-slug  301
```

### Fix 2: Add Missing /blog/* to /en/blog/* Catch-All Redirect

Add a catch-all redirect for non-prefixed blog URLs to prevent 404s:

```text
# Redirect legacy non-prefixed blog URLs to English
/blog/*  /en/blog/:splat  301
```

This should be placed **after** the specific legacy redirects but **before** the SPA fallback.

### Fix 3: Verify 410 Responses Are Working

Run a quick verification to confirm 410s are being returned:

```bash
curl -I https://www.delsolprimehomes.com/en/qa/non-existent-slug-12345
# Expected: HTTP 410 Gone
```

### Fix 4: Accelerate De-indexing via GSC

1. Export all 404/410 error URLs from Google Search Console
2. Submit a URL removal request for bulk URLs
3. Ensure sitemaps are regenerated and submitted

---

## Technical Details

### Sitemap Generation Flow

```text
┌──────────────────────────────────────────────────────────────┐
│                  Sitemap Generation                          │
├──────────────────────────────────────────────────────────────┤
│  1. Query DB with `.eq('status', 'published')`              │
│  2. Filter out `.not('is_redirect', 'eq', true)`            │
│  3. Exclude URLs in `gone_urls` table                        │
│  4. Generate XML for remaining URLs only                     │
└──────────────────────────────────────────────────────────────┘
```

### 410 Response Flow

```text
┌──────────────────────────────────────────────────────────────┐
│                  Request: /en/qa/deleted-slug                │
├──────────────────────────────────────────────────────────────┤
│  Middleware → SEO Edge Function                              │
│       ↓                                                      │
│  Query: .eq('slug', slug).eq('status', 'published')         │
│       ↓                                                      │
│  Content not found (because status != 'published')          │
│       ↓                                                      │
│  Return 410 Gone with localized "Content Removed" page      │
│       ↓                                                      │
│  Middleware passes 410 to browser/crawler                    │
└──────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| `public/_redirects` | Update legacy redirects to use `/en/` prefix; add `/blog/*` catch-all |

---

## Verification Steps

After deployment:

1. **Test 410 response:**
   ```bash
   curl -I https://www.delsolprimehomes.com/en/qa/nonexistent-test-slug
   # Should return: HTTP/2 410
   ```

2. **Test redirect fix:**
   ```bash
   curl -I https://www.delsolprimehomes.com/blog/some-old-article
   # Should return: HTTP/2 301 → /en/blog/some-old-article
   ```

3. **Verify sitemap counts:**
   - Regenerate sitemaps via `/admin/system-health`
   - Count should match published content only

4. **Google Search Console:**
   - Wait 24-48 hours after deployment
   - Check if error count decreases
   - Submit URL removal for persistent 410s

---

## Conclusion

The core 410/sitemap infrastructure is solid. The main fix needed is updating the legacy redirects in `_redirects` to use language-prefixed paths. The high GSC error count is expected during de-indexing transition and should decrease over time as Google processes the 410 responses.
