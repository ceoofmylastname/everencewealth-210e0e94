## Findings (in the order requested)

### 1. `build.sh` — the smoking gun

Line 47:
```bash
npx tsx scripts/generateStaticAboutPage.ts
```

**No `dist` argument is passed.** Every other generator in `build.sh` (homepage, location hub, buyers-guide, strategy, glossary, informational, author-bio, sitemap) explicitly passes `dist`:
```bash
npx tsx scripts/generateStaticHomePage.ts dist
npx tsx scripts/generateStaticBuyersGuide.ts dist
...
```

The about-page script falls back to a relative `'dist'` string (line 724: `const distDir = process.argv[2] || 'dist';`). That technically resolves against `process.cwd()` and *should* still write to `./dist/...`, but it's the only generator using the fallback path — fragile and inconsistent. Fix it to match the others.

### 2. `scripts/generateStaticAboutPage.ts` — already correct

Verified the script as currently shipped does ALL of the following correctly:

- **2a. Loops `['en', 'es']`** — line 669, `for (const lang of LANGS)` at line 682
- **2b. Writes to `dist/${lang}/about/index.html`** — line 694: `join(distDir, lang, 'about', 'index.html')`
- **2c. Bakes canonical `${BASE_URL}/${lang}/about/`** with trailing slash and lang prefix — line 692: `const canonicalUrl = \`${BASE_URL}/${lang}/about/\`;`
- **2d. ES falls back to EN content** when `about_page_content.language='es'` row is missing — line 672: `es: esRow || { ...enRow, language: 'es' }`
- Also generates a legacy `dist/about/index.html` whose canonical points to `/en/about/` (lines 700–714)
- Hreflang trio includes en, es, x-default with trailing slashes (lines 676–680)

The script is fine. The build invocation is the bug.

### 3. Production verification (curl)

```
GET https://www.everencewealth.com/en/about/
GET https://www.everencewealth.com/en/about/index.html
```

Both return:
```html
<title>Everence Wealth - Bridge the Retirement Gap</title>
<link rel="canonical" href="https://www.everencewealth.com" />
<link rel="alternate" hreflang="en" href="https://www.everencewealth.com" />
```

That's `dist/index.html` (the homepage SPA shell) being served via the `_redirects` SPA fallback at line 91 (`/*  /index.html  200`). No `data-static="true"` marker. Confirms `dist/en/about/index.html` is **not** present in the deploy.

### 4. Secondary risk in `public/_redirects`

There is **no explicit redirect rule for `/:lang/about`**, unlike `/:lang/buyers-guide` (line 77) and `/:lang/qa/...` (lines 80–81). Cloudflare Pages does serve `dist/en/about/index.html` automatically via directory-index handling when the file exists — but the SPA fallback `/* /index.html 200` will silently shadow it if the file is ever missing. Add an explicit rule alongside the buyers-guide one for safety + consistency.

---

## Proposed fix (surgical, two files)

### Fix A — `build.sh` line 47

```diff
- npx tsx scripts/generateStaticAboutPage.ts
+ npx tsx scripts/generateStaticAboutPage.ts dist
```

That's it. The script is already correct end-to-end; it just needs to be told where `dist/` lives.

### Fix B — `public/_redirects`, add after line 77 (the buyers-guide rule)

```
# About page - serve SSG HTML (en/es)
/:lang/about  /:lang/about/index.html  200
```

This guarantees `/en/about/` and `/es/about/` resolve to the static file even if the trailing slash / directory-index path ever drifts. Mirrors the buyers-guide pattern verbatim.

### What I will NOT touch

- `scripts/generateStaticAboutPage.ts` — already correct, no edits
- `functions/_middleware.js` — no changes; PROMPT 17 catchall and trailing-slash logic stay intact
- `supabase/functions/serve-seo-page/index.ts` — verified buyers-guide trailing-slash work stays
- `public/llms.txt`, `public/llms-full.txt`, `functions/_middleware.js` content-type — untouched
- `src/lib/urlSlash.ts` — untouched
- `dateModified` trigger / migrations — untouched
- All other `_redirects` rules — only adding one new line

---

## Post-deploy verification (user runs after Publish + Cloudflare cache purge)

```bash
curl -sL https://www.everencewealth.com/en/about/ | grep -E '(canonical|hreflang|data-static)'
curl -sL https://www.everencewealth.com/es/about/ | grep -E '(canonical|hreflang|data-static)'
```

Expected:
```html
<html lang="en" data-static="true">
<link rel="canonical" href="https://www.everencewealth.com/en/about/" />
<link rel="alternate" hreflang="en" href="https://www.everencewealth.com/en/about/" />
<link rel="alternate" hreflang="es" href="https://www.everencewealth.com/es/about/" />
<link rel="alternate" hreflang="x-default" href="https://www.everencewealth.com/en/about/" />
```

Same for `/es/about/` with `lang="es"` and canonical `/es/about/`.

If still wrong after Cloudflare "Purge Everything", inspect the deployed `dist/` directly via Lovable build logs to confirm `dist/en/about/index.html` was written.
