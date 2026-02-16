

## Fix Q&A Generation: Author ID + Legacy Prompts

### Root Cause

The `generate-english-article-qas` edge function hardcodes `author_id: '738c1e24-025b-4f15-ac7c-541bb8a5dade'` (Hans Beeckman from the old project). Your database only has Steven Rosenberg (`1a709766-817f-45b4-aea6-06f8e4fc8d6c`). Every insert fails with a foreign key violation on `faq_pages_author_id_fkey`.

The same bad author ID exists in `translate-qas-to-language` (the Spanish Q&A translator), so that would also fail.

Additionally, both functions still use "real estate content writer" in prompts instead of wealth management.

---

### Changes

#### 1. `supabase/functions/generate-english-article-qas/index.ts`

- **Line 249**: Change `author_id` from `'738c1e24-025b-4f15-ac7c-541bb8a5dade'` to `'1a709766-817f-45b4-aea6-06f8e4fc8d6c'` (Steven Rosenberg)
- **Line 68**: Change prompt from "expert real estate content writer" to "expert wealth management content writer"
- **Line 108**: Change system message from "expert real estate content writer" to "expert wealth management content writer"
- **Line 88**: Update example from "Costa del Sol" property language to retirement/financial planning language

#### 2. `supabase/functions/translate-qas-to-language/index.ts`

- **Line 682**: Change `author_id` from `'738c1e24-025b-4f15-ac7c-541bb8a5dade'` to `'1a709766-817f-45b4-aea6-06f8e4fc8d6c'` (Steven Rosenberg)

#### 3. Deploy both edge functions

---

### What This Fixes

- Q&A generation will succeed (no more FK violation)
- Spanish Q&A translations will also work when you run Phase 2
- Generated content will use wealth management language instead of real estate
