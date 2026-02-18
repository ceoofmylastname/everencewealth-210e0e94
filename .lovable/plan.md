

# Default Language to English

## What Changes
Two files auto-detect the browser's language and may serve Spanish to users who haven't explicitly chosen it. We'll remove the browser-language detection so the site always defaults to English unless:
- The URL already contains a language prefix (e.g., `/es/blog/...`)
- The user previously chose Spanish (saved in localStorage)

## Files to Update

### 1. `src/i18n/LanguageContext.tsx`
- Remove the `getBrowserLanguage()` function entirely
- In `getInitialLanguage()`, replace the call to `getBrowserLanguage()` with a hardcoded `Language.EN`

### 2. `src/utils/landing/languageDetection.ts`
- Remove the browser language detection block from `detectUserLanguage()`
- Always fall through to `return 'en'` if no URL param is set

## What Stays the Same
- URL-based language detection (visiting `/es/...` still works)
- localStorage preference (if a user explicitly switched to Spanish, it's remembered)
- The language switcher in the header still lets users choose Spanish manually

