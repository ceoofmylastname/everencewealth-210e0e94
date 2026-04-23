

## Why Google Search Console shows "1 error" on `glossary.xml`

### Root cause

Google flags `https://www.everencewealth.com/sitemaps/en/glossary.xml` because the file you're publishing is an **empty `<urlset>` with zero `<url>` entries**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- glossary sitemap for EN - intentionally empty -->
</urlset>
```

Google's sitemap parser treats a `<urlset>` containing **no `<url>` children** as malformed → "1 error" (typically reported as *"Sitemap contains URLs which are blocked by robots.txt"* or *"Empty sitemap"* depending on the day). Every other sitemap (blog 19, comparisons 11, qa 73, etc.) returns successfully because they have real entries.

The same empty file is deployed for **both** `/sitemaps/en/glossary.xml` and `/sitemaps/es/glossary.xml` — so the ES version will trip the same error on its next read.

### Why it ended up empty

There are two separate generators for this sitemap and they disagree:

1. **`supabase/functions/regenerate-sitemap/index.ts`** (line 574-602) builds a real glossary sitemap with 11 URLs — `/glossary` plus 10 hash anchors (`/glossary#iul`, `/glossary#rmd`, …). It writes them to `sitemaps/glossary.xml` (no language folder).
2. **The deployed `public/sitemaps/{en,es}/glossary.xml`** files were committed as placeholders ("intentionally empty") and never replaced. The sitemap *index* still points at them.
3. **A real glossary architecture** exists per memory `mem://features/glossary-term-architecture` — individual indexable pages at `/en/glossary/[term-slug]/` — but no generator currently emits those URLs into `sitemaps/en/glossary.xml`.

So the index advertises a sitemap, the file exists and returns HTTP 200, but it's empty → Google flags it.

### Fix plan

**Step 1 — Stop advertising an empty sitemap (immediate, removes the GSC error)**

Two options, pick one:

- **A. Remove glossary entries** from `public/sitemap.xml` and `public/sitemap-index.xml` (lines 27-30 and 59-62 in each) until real glossary URLs exist. Resubmit `sitemap.xml` in GSC. Error clears within 24-48 h.
- **B. Populate the files** with the 10 hash-anchor URLs the edge function already knows about. Each file becomes ~12 valid `<url>` entries. Error clears the same way.

Recommend **B** — keeps the link surface visible to Google.

**Step 2 — Generate real per-term URLs (proper fix)**

Per the memory note, glossary terms have individual indexable pages at `/en/glossary/[term-slug]/`. Update the sitemap generator to emit those:

- In `supabase/functions/regenerate-sitemap/index.ts`:
  - Add `generateGlossarySitemap(lang: 'en' | 'es')` that emits `${BASE_URL}/${lang}/glossary` + one entry per slug in `GLOSSARY_TERMS` as `${BASE_URL}/${lang}/glossary/${slug}/` (not `#anchor`).
  - Write to `sitemaps/en/glossary.xml` and `sitemaps/es/glossary.xml` (matching the index paths) instead of the legacy `sitemaps/glossary.xml`.
  - If a `glossary_terms` table exists in the DB later, swap `GLOSSARY_TERMS` for a `supabase.from('glossary_terms').select('slug').eq('language', lang).eq('is_published', true)` query — same pattern as the QA sitemap. (DB check: `glossary_terms` table does not exist today, so the hardcoded array stays for now.)

**Step 3 — Resubmit and verify**

After deploying:
1. Hit `POST` on the `regenerate-sitemap` edge function from the Sitemap Regenerator admin page.
2. In GSC → Sitemaps, click the `…` menu on `https://www.everencewealth.com/sitemap.xml` and **Resubmit**.
3. Within 24-48 h the `1 error` flag on `/sitemaps/en/glossary.xml` flips to `Success` with `11` discovered URLs.

### Files to change

- `public/sitemaps/en/glossary.xml` — replace placeholder with 11 real `<url>` entries
- `public/sitemaps/es/glossary.xml` — same, with `/es/` paths
- `supabase/functions/regenerate-sitemap/index.ts` — make `generateGlossarySitemap` language-aware and write to `sitemaps/{lang}/glossary.xml`
- `src/components/admin/SitemapRegenerator.tsx` — fix the hardcoded `urlCount: 11` reference path if needed

### Out of scope

- No DB schema changes (no `glossary_terms` table to add today)
- No change to other sitemaps — they're all `Success`
- No robots.txt or hreflang changes

### Verification

```bash
curl -s https://www.everencewealth.com/sitemaps/en/glossary.xml | grep -c '<loc>'
# expect 11
```

GSC shows `Success / 11 / 0` instead of `1 error / 0 / 0`.

