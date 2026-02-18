
# Fix: BlogPreview Component Missing English Filter

## Root Cause

The previous fix was applied to the wrong component. There are **two** blog preview components:

1. `src/components/home/sections/ReviewsAndBlog.tsx` → `BlogTeaser` — **was fixed** (now filters `language = 'en'`)
2. `src/components/homepage/BlogPreview.tsx` → `BlogPreview` — **NOT fixed, and this is the one the homepage actually uses**

`src/pages/Home.tsx` line 15 imports `BlogPreview` from `src/components/homepage/BlogPreview.tsx`, and line 39 renders it. That component's Supabase query on line 22-24 has **no language filter** — it fetches the 3 most recently published articles regardless of language. Since the most recent articles are in Spanish, those are what appear.

## Fix

**File: `src/components/homepage/BlogPreview.tsx`**

Add `.eq('language', 'en')` to the query, and update the query key to reflect the English-only scope:

**Current (lines 17-27):**
```ts
queryKey: ['homepage-blog-preview'],
queryFn: async () => {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('id, slug, headline, meta_description, featured_image_url, featured_image_alt, date_published, language, category')
    .eq('status', 'published')
    .order('date_published', { ascending: false })
    .limit(3);
  if (error) throw error;
  return data;
},
```

**After fix:**
```ts
queryKey: ['homepage-blog-preview-en'],
queryFn: async () => {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('id, slug, headline, meta_description, featured_image_url, featured_image_alt, date_published, language, category')
    .eq('status', 'published')
    .eq('language', 'en')
    .order('date_published', { ascending: false })
    .limit(3);
  if (error) throw error;
  return data;
},
```

That single `.eq('language', 'en')` addition ensures only English articles appear in the homepage blog preview section, regardless of what language the user previously browsed.

## Why the Previous Fix Didn't Work

The previous session fixed `src/components/home/sections/ReviewsAndBlog.tsx` (`BlogTeaser`), but the homepage at `/` actually renders `src/components/homepage/BlogPreview.tsx` (`BlogPreview`). Both components display blog articles, but they are completely separate files. The actual component used on the homepage was never updated.

## Summary

- **1 file to change**: `src/components/homepage/BlogPreview.tsx`
- **1 line to add**: `.eq('language', 'en')` in the Supabase query
- **1 query key to update**: `'homepage-blog-preview'` → `'homepage-blog-preview-en'` to avoid stale cache from previous fetches
