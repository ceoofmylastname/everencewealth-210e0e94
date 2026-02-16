

## Fix Translation System: Images, Hreflang, Canonical URLs, and Legacy Cleanup

### Issues Found

I audited both translation edge functions (`translate-cluster` and `process-translation-queue`) and found these problems:

---

#### 1. Images: WORKING CORRECTLY in `translate-cluster`, WORKING in `process-translation-queue`

Both functions already copy `featured_image_url` from the English source article to the Spanish translation:
- `translate-cluster/index.ts` line 395: `const generatedImageUrl = englishArticle.featured_image_url;`
- `process-translation-queue/index.ts` line 428: `featured_image_url: englishArticle.featured_image_url`

**No changes needed for images.** Both English and Spanish articles share the same image.

---

#### 2. Canonical URL: MISSING in `translate-cluster`, CORRECT in `process-translation-queue`

- `process-translation-queue` correctly sets `canonical_url` (line 435): `https://www.everencewealth.com/${targetLanguage}/blog/${slug}`
- `translate-cluster` does NOT set `canonical_url` at all in the returned object (lines 401-431). This means Spanish articles created via the main translation flow have no canonical URL.

**Fix:** Add `canonical_url` to the `translateArticleWithRetry` return object in `translate-cluster/index.ts`.

---

#### 3. Hreflang Group ID: WORKING CORRECTLY

Both functions correctly set `hreflang_group_id` from the English source article, ensuring English and Spanish versions are linked together.

---

#### 4. Status: `translate-cluster` saves as `draft`, `process-translation-queue` saves as `published`

- `translate-cluster` inserts with `status: 'draft'` (line 887)
- `process-translation-queue` inserts with `status: 'published'` (line 141)

This inconsistency means translations via the main cluster flow won't appear on the site until manually published. Both should save as `published`.

**Fix:** Change `status: 'draft'` to `status: 'published'` in `translate-cluster/index.ts` line 887, and add `date_published` and `date_modified`.

---

#### 5. Legacy References: Both functions still have old real estate content

- `translate-cluster` line 241: Prompt says "luxury real estate audience"
- `translate-cluster` line 112-122: `LANGUAGE_NAMES` still lists 9 European languages (German, Dutch, etc.) instead of just Spanish
- `process-translation-queue` line 9-20: Same legacy `LANGUAGE_NAMES` with 10 European languages
- `process-translation-queue` line 339-341: Prompt says "luxury real estate content"
- `process-translation-queue` line 478: Prompt says "Costa del Sol"
- `process-translation-queue` uses `OPENAI_API_KEY` directly instead of Lovable AI

---

#### 6. `translate-cluster` progress messages reference "60 articles"

Lines 520, 717-718, 763, 997-998, 1001, 1006 all reference "60 articles" or "54 translations" -- leftover from the 10-language system. Should be 12 articles / 6 translations.

---

### Changes

#### File 1: `supabase/functions/translate-cluster/index.ts`

1. Update `LANGUAGE_NAMES` to only include `'es': 'Spanish'`
2. Update translation prompts from "luxury real estate audience" to "wealth management and financial planning audience" and remove "Costa del Sol" references
3. Add `canonical_url` to the `translateArticleWithRetry` return object
4. Change `status: 'draft'` to `status: 'published'` and add `date_published`/`date_modified`
5. Fix all progress messages from "60 articles" to "12 articles" and "54 translations" to "6 translations"

#### File 2: `supabase/functions/process-translation-queue/index.ts`

1. Update `LANGUAGE_NAMES` to only `'en': 'English', 'es': 'Spanish'`
2. Switch from `OPENAI_API_KEY` to Lovable AI gateway (`LOVABLE_API_KEY` + `https://ai.gateway.lovable.dev/v1/chat/completions`)
3. Update translation prompts from "luxury real estate" to "wealth management and financial planning"
4. Remove "Costa del Sol" from chunk translation prompt

#### Deploy

Both edge functions will be redeployed after changes.

---

### Summary of What Gets Fixed

| Issue | Before | After |
|-------|--------|-------|
| Images shared | Yes (already working) | Yes (no change) |
| Canonical URL | Missing in main flow | Set correctly for both EN and ES |
| Hreflang linking | Working | Working (no change) |
| Article status | Draft (invisible on site) | Published immediately |
| Prompt context | "luxury real estate" | "wealth management" |
| Language list | 10 European languages | English + Spanish only |
| Progress tracking | "60 articles" | "12 articles" |
| AI provider (queue) | OpenAI direct | Lovable AI gateway |

