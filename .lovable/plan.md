

## Update Blog Language Filter to English and Spanish Only

### Problem
The blog filter bar at `/en/blog` currently shows 10+ languages (German, Dutch, French, Polish, etc.) inherited from the previous real estate site. Only English and Spanish are supported.

### Changes

**File: `src/components/blog-index/FilterBar.tsx`** (lines 16-28)

Replace the `LANGUAGES` array to only include the three supported options:

```typescript
const LANGUAGES = [
  { code: "all", flag: "🌍", name: "All Languages" },
  { code: "en", flag: "🇺🇸", name: "English" },
  { code: "es", flag: "🇪🇸", name: "Spanish" },
];
```

This also updates the English flag from the British flag to the US flag to match the rest of the site's convention.

No other files or logic changes needed -- the filtering query in `BlogIndex.tsx` already correctly filters by the `language` column using whatever code is selected, so categories and language filtering will work perfectly with this reduced set.
