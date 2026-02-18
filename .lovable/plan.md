
# Fix: Homepage Blog Preview Always Shows English Articles

## Problem
The `BlogTeaser` component in `src/components/home/sections/ReviewsAndBlog.tsx` queries articles using `currentLanguage` from context (line 56):
```ts
.eq('language', currentLanguage)
```

The homepage lives at `/` — no language prefix — so `currentLanguage` can still be `'es'` if a user previously browsed a Spanish page (pulled from `localStorage`). This causes Spanish articles to appear on the homepage even when the US flag is displayed in the header.

## Fix

**File: `src/components/home/sections/ReviewsAndBlog.tsx`**

Two changes:
1. **Line 50** — Update the query key so it no longer varies by language (homepage is always English):
   ```ts
   queryKey: ['homepage-blog-articles'],
   ```
2. **Line 56** — Hard-code `'en'` instead of `currentLanguage`:
   ```ts
   .eq('language', 'en')
   ```
3. **Lines 60–70** — Remove the fallback block (it was only needed when `currentLanguage !== 'en'`, which is now irrelevant since we always fetch English).

This ensures the homepage blog preview **always** shows the 3 most recent English articles, regardless of the user's browser history or stored language preference.

## What Stays the Same
- The "View All Articles" and "Read More" links still use `currentLanguage` for routing (correct behavior)
- The `/en/blog` and `/es/blog` pages are unaffected
- Spanish users who explicitly navigate to `/es/` will see Spanish content on the Spanish homepage
- The `LanguageContext` fixes from the previous session remain in place
