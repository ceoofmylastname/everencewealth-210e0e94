

## Regenerate sitemaps from current database

Run `scripts/generateSitemap.ts` to rebuild all static sitemap XML files from the live Supabase database. Generation task only — no source code modified.

### Steps

1. **Run the generator** — `npx tsx scripts/generateSitemap.ts` from the project root. The script:
   - Reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` from `.env`.
   - Fetches every `published`, non-redirect record from `blog_articles`, `qa_pages`, `location_pages`, `comparison_pages`.
   - Excludes any path present in `gone_urls`.
   - Iterates `SUPPORTED_LANGUAGES = ['en', 'es']` and writes per-language XML to `public/sitemaps/{en,es}/{blog,qa,locations,comparisons}.xml`.
   - Writes `public/sitemaps/glossary.xml` and `public/sitemaps/brochures.xml`.
   - Overwrites `public/sitemap-index.xml` with the regenerated master index.

2. **Verify counts** — count `<url>` tags in each output file:
   - `public/sitemaps/en/qa.xml` → expect **169** (168 records + 1 index URL)
   - `public/sitemaps/en/blog.xml` → expect **43** (42 records + 1 index URL)
   - `public/sitemaps/es/qa.xml` → expect **169**
   - `public/sitemaps/es/blog.xml` → expect **43**

3. **Verify master index** — confirm regenerated `public/sitemap-index.xml` lists all four content sitemaps for both languages plus `locations`, `comparisons`, `glossary`, and `brochures`.

4. **Report results** — print final URL counts per file and the contents of the regenerated `sitemap-index.xml`.

### Files written (by the script)
- `public/sitemaps/en/{blog,qa,locations,comparisons,index}.xml`
- `public/sitemaps/es/{blog,qa,locations,comparisons,index}.xml`
- `public/sitemaps/glossary.xml`
- `public/sitemaps/brochures.xml`
- `public/sitemap-index.xml`
- `public/sitemap.xml` (legacy alias)

No `.ts` / `.tsx` / `.js` source files are modified.

### Out of scope (flagged only)
Legacy directories `public/sitemaps/{da,de,fi,fr,hu,nl,no,pl,sv}/` from the previous 11-language config remain unreferenced. Recommend a follow-up task to delete them.

