
# Fix: English as Default Language for Blog, QA & Comparisons

## Problem Summary

When visiting `/en/blog`, `/en/qa`, and the homepage `/`, content shows in a mix of languages (Spanish appears alongside English). The user wants English to always be the default, so:
- `/en/blog` → shows only English articles by default
- `/en/qa` → shows only English Q&As by default  
- `/en/compare` → already works correctly (uses URL lang as default)
- Homepage blog teaser → should always show English articles when on the root `/` path

## Root Causes Found

### 1. BlogIndex (`src/pages/BlogIndex.tsx`)
The `selectedLanguage` state comes from URL query params: `searchParams.get("lang") || "all"`. When a user visits `/en/blog`, there's no `?lang=en` in the URL, so it defaults to `"all"` — showing every language including Spanish. The `lang` URL route param (`en`) is read but **never used as the default filter**.

**Fix:** Change the default to use the URL `lang` param:
```
const selectedLanguage = searchParams.get("lang") || lang;
```
This makes `/en/blog` default to English articles, while still allowing the user to manually select "All Languages" or "Spanish" from the filter dropdown.

### 2. QAIndex (`src/pages/QAIndex.tsx`)
The `languageFilter` state is initialized to `'all'`:
```ts
const [languageFilter, setLanguageFilter] = useState<string>('all');
```
When visiting `/en/qa`, the `lang` URL param is `'en'` but is never used as the initial filter value.

**Fix:** Initialize with the URL `lang` param:
```ts
const [languageFilter, setLanguageFilter] = useState<string>(lang);
```

### 3. Homepage BlogTeaser (`src/components/home/sections/ReviewsAndBlog.tsx`)
The `BlogTeaser` component uses `currentLanguage` from the `LanguageContext`. The homepage is at `/` which has no language prefix in the URL, so `getLanguageFromPath` returns `null`. The context then falls back to `localStorage.getItem('preferredLanguage')` — if the user ever browsed a Spanish page, `localStorage` holds `'es'` and Spanish articles appear on the homepage.

**Fix:** In `BlogTeaser`, when querying articles, force English (`'en'`) when `currentLanguage` would normally be used for the DB query — since the homepage has no language prefix, always fetch English articles for the homepage teaser. The display language (translations) can still follow `currentLanguage`, but the article fetch should default to `'en'`.

More precisely: update the `ReviewsAndBlog.tsx` query to always fetch `'en'` articles for the homepage context (since the homepage `/` is the English homepage). The `currentLanguage` on the root path should resolve to `'en'` — we can also fix `LanguageContext` to clear `localStorage` and return `'en'` as default when the path is `/`.

## Files to Change

### File 1: `src/pages/BlogIndex.tsx` — line 28

**Current:**
```ts
const selectedLanguage = searchParams.get("lang") || "all";
```
**Change to:**
```ts
const selectedLanguage = searchParams.get("lang") || lang;
```

This ensures visiting `/en/blog` defaults to English, `/es/blog` defaults to Spanish, etc. Users can still change the filter manually.

### File 2: `src/pages/QAIndex.tsx` — line 35

**Current:**
```ts
const [languageFilter, setLanguageFilter] = useState<string>('all');
```
**Change to:**
```ts
const [languageFilter, setLanguageFilter] = useState<string>(lang);
```

This ensures visiting `/en/qa` defaults to English Q&As.

### File 3: `src/i18n/LanguageContext.tsx` — `getInitialLanguage` function

When the path is `/` (no language segment), the context currently falls back to `localStorage`. This causes the homepage to "remember" a previous Spanish session.

**Fix:** Clear the `localStorage` fallback when on the root path — always return `'en'` for the root path:
```ts
const getInitialLanguage = (): Language => {
  const urlLang = getLanguageFromPath(location.pathname);
  if (urlLang) return urlLang;
  
  // Root path (/) always defaults to English, regardless of localStorage
  if (location.pathname === '/' || location.pathname === '') {
    return Language.EN;
  }
  
  const stored = localStorage.getItem('preferredLanguage');
  if (stored && VALID_LANGUAGES.includes(stored as Language)) {
    return stored as Language;
  }
  
  return Language.EN;
};
```

Also update the `useEffect` that syncs language with URL changes so that when returning to `/`, it resets to `'en'`:
```ts
useEffect(() => {
  const urlLang = getLanguageFromPath(location.pathname);
  if (urlLang && urlLang !== currentLanguage) {
    setCurrentLanguage(urlLang);
    localStorage.setItem('preferredLanguage', urlLang);
  } else if (!urlLang && (location.pathname === '/' || location.pathname === '')) {
    // Root path always resets to English
    if (currentLanguage !== Language.EN) {
      setCurrentLanguage(Language.EN);
    }
  }
}, [location.pathname]);
```

## What Stays the Same
- Users can still manually change the language filter in the Blog and QA index pages
- Spanish-language routes (`/es/blog`, `/es/qa`) continue to default to Spanish
- All other pages with explicit `/lang/` URL prefixes remain unaffected
- The homepage translations still respect the user's selected language preference once they explicitly switch

## Summary of Files Modified
1. `src/pages/BlogIndex.tsx` — 1 line change: default language filter to URL `lang` param
2. `src/pages/QAIndex.tsx` — 1 line change: initialize language filter to URL `lang` param
3. `src/i18n/LanguageContext.tsx` — root path always resolves to English, not localStorage fallback
