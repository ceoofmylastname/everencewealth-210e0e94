

## Plan: Three Targeted Cleanup Fixes

### Fix 1 — `public/ai-sitemap.xml`
Domain is already `www.everencewealth.com` everywhere (no `delsolprimehomes` matches found). However, the file is full of legacy real estate URLs (Marbella, Estepona, Sotogrande, NIE, Costa del Sol, Spanish mortgages, etc.) that don't match any URL on the wealth-management site.

**Action:** Rewrite the sitemap to contain only valid Everence Wealth URLs. Keep:
- `/llm.txt`
- Homepage (`/`)
- `/en/blog`, `/en/qa`, `/en/glossary`, `/en/philosophy`, `/en/contact`
- Strategy pages (`/en/strategies/asset-protection`, etc. — verify which exist)

Remove ALL `/brochure/<city>`, `/locations/<city>/...`, `/compare/...`, and any blog URL referencing marbella, estepona, sotogrande, benahavis, costa-del-sol, NIE, digital-nomad-visa, spain, brexit, mortgage, etc.

Also strip the leftover `ai:topics` strings that mention `costa-del-sol`, `spanish-property-terms`, `puerto-banus`, etc.

### Fix 2 — `src/components/schema/PersonSchema.tsx`
Replace bare-domain `https://everencewealth.com` with `https://www.everencewealth.com` on lines 9, 10, 15, 25, 27 (image URLs, `@id`, and `worksFor.url`/`@id`).

### Fix 3 — `src/components/crm/LeadsFilterBar.tsx` line 43
Change:
```ts
const LANGUAGES = ["en", "nl", "de", "fr", "es", "fi", "pl", "sv", "da", "hu", "no"];
```
to:
```ts
const LANGUAGES = ["en", "es"];
```

### Fix 4 — `src/types/hreflang.ts` line 29
Update the stale JSDoc comment on the `SupportedLanguage` type. Replace:
```
 * Results in: 'en' | 'nl' | 'hu' | 'de' | 'fr' | 'sv' | 'pl' | 'no' | 'fi' | 'da'
```
with:
```
 * Results in: 'en' | 'es'
```

### Final report
Codebase-wide search for `delsolprimehomes` (excluding `supabase/`, `node_modules/`) was already run and returned **zero matches**. I'll re-confirm after the edits and report in the completion message.

### Files touched
1. `public/ai-sitemap.xml` (full rewrite)
2. `src/components/schema/PersonSchema.tsx` (5 string replacements)
3. `src/components/crm/LeadsFilterBar.tsx` (1 line)
4. `src/types/hreflang.ts` (1 comment line)

No other files. `functions/_middleware.js` will not be touched.

