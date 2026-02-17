

## Fix Comparison Language Switching Errors

### Problem
When a user views an English comparison and tries to switch to Spanish, they get a "Content Not Available" error because:
1. The `ComparisonLanguageSwitcher` shows Spanish as available based on the `translations` JSONB field, even when no actual Spanish page exists in the database
2. The `ContentLanguageSwitcher` (used by Q&A pages) still lists old European languages instead of Spanish

### Solution (2 files)

**File 1: `src/components/comparison/ComparisonLanguageSwitcher.tsx`**
- Before showing Spanish as available, verify the translated page actually exists in `comparison_pages` with `status = 'published'`
- Query the database for sibling pages sharing the same `comparison_topic` to confirm real availability
- Only render language links for translations that have published pages

**File 2: `src/components/ContentLanguageSwitcher.tsx`**
- Replace the outdated `LANGUAGES` map (Dutch, Hungarian, German, French, etc.) with only English and Spanish
- Update the English flag from British flag to US flag to match the rest of the site

### Admin Workflow (Already Exists)
The admin Comparison Generator page already has a "Translate All to Spanish" button that calls the `batch-translate-comparisons` backend function. Admins should use this to create Spanish versions before the language switcher will show them as available.

### Technical Details

**ComparisonLanguageSwitcher changes:**
- Add a database query using `comparison_topic` to find sibling translations with `status = 'published'`
- Build the available languages map from actual DB results instead of trusting the `translations` JSONB alone
- Keep the current UI design (rounded pills with flags)

**ContentLanguageSwitcher changes:**
- Reduce `LANGUAGES` constant from 10 entries to 2: `en` (English, US flag) and `es` (Spanish, Spain flag)
- No other logic changes needed -- the existing availability check already works correctly
