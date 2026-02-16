

## Add Comparisons to Public Navigation and Update Branding

The comparison index page already exists at `/:lang/compare` with filtering and cards. Three things need fixing to make it fully accessible and on-brand.

### 1. Update Hero Copy (Rebrand)

**File: `src/pages/ComparisonIndex.tsx`**

Replace the outdated text:
- "Property Comparisons" --> "Financial Comparisons"
- "Expert comparisons to help you make informed decisions about buying property in Costa del Sol" --> "Expert side-by-side comparisons to help you make smarter decisions about insurance, retirement, and wealth management"

### 2. Add "Comparisons" Link to Navigation

**Desktop nav** (`src/components/ui/3d-adaptive-navigation-bar.tsx`):
- Add a new entry under the Education dropdown children array:
  `{ label: nav.comparisons || "Comparisons", path: \`/\${currentLanguage}/compare\`, icon: <Scale /> }`
- Import the `Scale` icon from lucide-react
- Update the active-section detection to include `/compare` under `education`

**Mobile nav** (`src/components/home/Header.tsx`):
- Add a `MobileLink` for Comparisons inside the Education section, alongside Blog, Q&A, and Glossary
- Import the `Scale` icon from lucide-react

**i18n** (`src/i18n/translations/en.ts` and `src/i18n/translations/es.ts`):
- Add `comparisons: "Comparisons"` to `header.nav` in English
- Add `comparisons: "Comparaciones"` to `header.nav` in Spanish

### 3. Show Featured Images on Comparison Cards

**File: `src/pages/ComparisonIndex.tsx`**

- Add `featured_image_url, featured_image_alt` to the select query
- Display the featured image at the top of each Card (above the header) when available, with the alt text
- Fallback to the current text-only card when no image exists

### Summary of Files to Change

| File | Change |
|---|---|
| `src/pages/ComparisonIndex.tsx` | Rebrand hero text, add image to cards, fetch image fields |
| `src/components/ui/3d-adaptive-navigation-bar.tsx` | Add Comparisons to Education dropdown |
| `src/components/home/Header.tsx` | Add Comparisons to mobile Education section |
| `src/i18n/translations/en.ts` | Add `comparisons` key to `header.nav` |
| `src/i18n/translations/es.ts` | Add `comparisons` key to `header.nav` |
