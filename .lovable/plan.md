

## Replace legacy Del Sol logo in social/OG metadata

### Problem
Social media previews (Open Graph / Twitter cards) and possibly favicons/manifests are still serving the old Del Sol Prime Homes logo instead of the official Everence Wealth logo.

### Official logo (single source of truth)
`https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png`

### Fix scope

1. **Audit all logo / OG image references**
   - `index.html` — `<meta property="og:image">`, `<meta name="twitter:image">`, favicon `<link rel="icon">`, apple-touch-icon, manifest reference
   - `public/` directory — replace `og-image.png`, `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest` icon entries if they contain the legacy artwork
   - `src/config/business.ts` — `BUSINESS.logo.url` (used in JSON-LD Organization schema)
   - Any `<SEO>` / `<MetaTags>` / `<OGTags>` components that hardcode an image URL
   - Any sitemap, RSS, or share-card edge function that embeds a logo
   - Search the codebase for legacy strings: `delsol`, `del-sol`, `prime-homes`, `delsolprimehomes`, and any other CDN URLs that aren't the new asset

2. **Replace every legacy reference** with the official URL above (or with a locally-hosted copy at `/og-image.png` if we want to self-host for reliability).

3. **Update favicon + apple-touch-icon**
   - Download the official logo into `public/favicon.png` and `public/apple-touch-icon.png`
   - Delete `public/favicon.ico` if it still contains the old mark
   - Update `index.html` `<link rel="icon">` and `<link rel="apple-touch-icon">` accordingly

4. **Update JSON-LD**
   - Confirm `BUSINESS.logo.url` in `src/config/business.ts` points to the Everence logo (it already references `6993ada8dcdadb155342f28e.png` — verify that is the correct current Everence asset, otherwise swap to the URL provided above)

5. **Cache busting for social platforms**
   - After deploy, the user will need to re-scrape the page in:
     - Facebook Sharing Debugger
     - LinkedIn Post Inspector
     - X (Twitter) Card Validator
   - These tools cache OG images aggressively; without re-scraping, old previews persist even after the fix.

### Files expected to change
- `index.html`
- `public/favicon.ico` (delete) / `public/favicon.png` (add) / `public/apple-touch-icon.png` (add) / `public/og-image.png` (replace)
- `src/config/business.ts` (verify/update logo URL)
- Any SEO component found during audit (e.g. `src/components/SEO.tsx`, `src/components/seo/*`)
- Any edge function that generates share images

### Out of scope
- Visual logo placement inside the rendered site UI (header/footer) — those already use the correct Everence logo per current code.
- Brand color or typography changes.

### Verification after implementation
1. View page source on the homepage — confirm `og:image` and `twitter:image` point to the Everence logo.
2. Hit `/favicon.png` and `/apple-touch-icon.png` directly — confirm they show the Everence mark.
3. Run Facebook / LinkedIn / X debuggers and force a re-scrape.
4. Grep the repo for `delsol` and any old CDN paths — should return zero matches.

