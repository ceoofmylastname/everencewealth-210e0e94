## PROMPT 22 — P2 Closure Plan (audit 94 → ~99)

### Audit baseline reconciliation
Production exploration showed two findings are already resolved — work skipped, results documented in the final report:

- **P2-3 (empty glossary sitemap):** NOT empty. `public/sitemaps/en/glossary.xml` and `es/glossary.xml` already contain real terms (e.g. `/en/glossary/iul/`). No `glossary_terms` table exists — content is hardcoded in `regenerate-sitemap`. No code change.
- **P2-4 (QAPage acceptedAnswer count = 2):** Stale. Live curl on 3 sample QA pages shows `acceptedAnswer` count = 0 on the QA page schema and exactly 1 per Question inside FAQ subgraphs. Code at `serve-seo-page/index.ts:1163` is correct. No code change.

### Items to ship

**P2-1 — sameAs (Person + Organization)**
- Wait for the user's verified URL list (next message).
- Once received: update `src/config/business.ts`:
  - `BUSINESS.sameAs` → Org array.
  - Extend `BusinessFounder` interface + add a new `BUSINESS.founderSameAs` array; remove the existing TODO comment.
- Wire `BUSINESS.founderSameAs` into `scripts/generateStaticAuthorBioPage.ts` Person node, merged with the existing DB `author.linkedin_url` and de-duplicated.
- Person.sameAs already emits via DB (`linkedin.com/in/stevenrosenberg/`); we only ADD entries, never remove the LinkedIn one.

**P2-2 — knowsAbout (Person)**
- Add to Person node in `scripts/generateStaticAuthorBioPage.ts`:
  ```
  knowsAbout: [
    "Indexed Universal Life Insurance",
    "Tax-Free Retirement Income",
    "Roth Conversion Strategies",
    "Sequence of Returns Risk",
    "High-Earner Tax Strategy",
    "Whole Life Insurance",
    "Annuities",
    "Asset Protection Planning",
    "Cash-Value Life Insurance"
  ]
  ```
  9 topics: 5 with verified ≥3-article EN coverage + 4 advisor-specialty pillars from /strategies/. Estate Planning dropped (only 1 article).

**P2-5 — Security headers (CSP as Report-Only)**
- Append to the existing `/*` block in `public/_headers`:
  ```
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Frame-Options: DENY
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com; font-src 'self' data: https://fonts.gstatic.com https://api.fontshare.com https://cdn.fontshare.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.indexnow.org; frame-src 'self' https://www.youtube.com https://player.vimeo.com; object-src 'none'; base-uri 'self'; form-action 'self' https://services.leadconnectorhq.com
  ```
  Differences from spec, all justified by code/memory:
  - GTM/GA removed from allowlist (per `mem://project/tracking-policy`).
  - Fontshare added (used by index.html line 30).
  - IndexNow + GHL leadconnectorhq added (used by webhook/IndexNow scripts).
  - **Report-Only mode** so violations log to console without breaking pages. Promote to enforced in a future prompt after monitoring.

**P2-6 — Bing site verification**
- Surface as a manual user step. Once user provides the `content` value, add one line to `index.html` `<head>`:
  `<meta name="msvalidate.01" content="<bing-content>" />`
- If user does not provide it this round, skip.

### Drive-by from PROMPT 21 (approved)
- `supabase/functions/serve-seo-page/index.ts:1174` — replace hardcoded `https://assets.cdn.filesafe.space/.../69b7424c5b89c7c557adfe6e.png` with `https://www.everencewealth.com/logo.png`. Same Organization JSON-LD logo we already standardized everywhere else.

### Files edited
- `src/config/business.ts` — Person + Org sameAs, founderSameAs scaffold
- `scripts/generateStaticAuthorBioPage.ts` — knowsAbout + merged sameAs into Person node
- `public/_headers` — append HSTS + X-Frame-Options + Permissions-Policy refinement + CSP-Report-Only inside existing `/*` block (block stays last)
- `supabase/functions/serve-seo-page/index.ts` — drive-by logo URL fix (line 1174)
- `index.html` — Bing meta (only if user supplies value)

### Untouched (per guard rails)
- `supabase/migrations/*.sql`
- All PROMPT 20 + 21 verified work (canonical/hreflang, llms.txt, dateModified, hero preload, _headers cache rules, OptimizedImage WebP, comma-strip 301, injectSeoTags HTMLRewriter, PROMPT 17 catchall, `functions/_middleware.js`)
- `BUSINESS.telephone`/compliance trigger
- `regenerate-sitemap` (P2-3 a no-op)
- QAPage emitter (P2-4 a no-op)

### Sequencing
1. User pastes verified Person + Org sameAs URLs.
2. I ship P2-1, P2-2, P2-5, P2-6 (if Bing supplied), and the drive-by logo fix in one batch.
3. Optional: deploy `serve-seo-page` so the logo fix lands without waiting for the next edge-function deploy cycle.
4. User publishes + Cloudflare cache purge.

### Verification (post-deploy)
```bash
# 7a Person sameAs
curl -sL https://www.everencewealth.com/en/team/steven-rosenberg/ \
  | grep -oE '"sameAs":\[[^]]*\]' | head -2

# 7b knowsAbout
curl -sL https://www.everencewealth.com/en/team/steven-rosenberg/ \
  | grep -oE '"knowsAbout":\[[^]]*\]'

# 7e Security headers
curl -sI https://www.everencewealth.com/ \
  | grep -iE "strict-transport|x-frame|content-security|permissions-policy"

# 7f Bing meta (if applied)
curl -sL https://www.everencewealth.com/ | grep msvalidate.01

# Drive-by: serve-seo-page logo
curl -sL https://www.everencewealth.com/en/qa/<some-slug>/ | grep -c "filesafe.space"   # expect 0
```
P2-3 and P2-4 verifications skipped — already correct in baseline. Documented in final report.