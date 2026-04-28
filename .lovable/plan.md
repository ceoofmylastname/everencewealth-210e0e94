# AI-SEO Audit — Everence Wealth

Scope: AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), E-E-A-T, plus crawlability for Googlebot, GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended.

I fetched the live site as bots, parsed schemas, audited robots/sitemaps/llm files, and queried the database. Here is what I found and what I propose to fix.

---

## What is working well

- robots.txt explicitly allows GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, Applebot-Extended, cohere-ai, FacebookBot.
- llm.txt, llms.txt, llms-full.txt, ai.txt, ai-plugin.json all return 200.
- Q&A hub has 264 EN + 264 ES published pages with FAQPage + ItemList + BreadcrumbList JSON-LD.
- Blog: 138 published articles, 100% have author_id and reviewer_id, no dead citations, all >2000 words. Excellent E-E-A-T.
- Philosophy page has the full schema stack (WebPage + FinancialService + Person + BreadcrumbList + SpeakableSpecification).
- speakable CSS class present on home, QA, blog, philosophy, strategy.
- Bots receive same HTML as Googlebot (no cloaking; pre-rendered SSG works).

---

## Critical issues (fix first)

### 1. Homepage redirect chain breaks crawl budget
`/` → 301 → `/en` → 308 → `/en/`. Two hops on the most-linked URL. ChatGPT-User and PerplexityBot frequently follow only one hop.
**Fix:** Single 301 from `/` directly to `/en/`. Update `public/_redirects` and Cloudflare middleware.

### 2. Homepage canonical is wrong
HTML canonical = `https://www.everencewealth.com` but the page actually serves at `/en/`. Mismatch confuses Google and AI crawlers about which URL to cite.
**Fix:** Set canonical to `https://www.everencewealth.com/en/` in `src/pages/Home.tsx` and the Organization schema `url` field.

### 3. Homepage description still says "San Francisco" — violates US-national + Pleasanton memory
Live HTML and Organization JSON-LD: `"Specializing in tax-efficient retirement strategies… Serving clients in San Francisco and nationwide."` This is the description AI engines quote. The address block also still shows `455 Market St… San Francisco, CA 94105`.
**Fix:** Replace with US-national, Steven Rosenberg authority copy. Use the canonical address from `src/constants/company.ts` (per existing memory). Update meta description, og:description, FinancialService schema description, and PostalAddress.

### 4. Glossary sitemap is empty (0 URLs) and term page returned 404
`sitemaps/en/glossary.xml` lists 0 URLs. `/en/glossary/finance-protection-pillar` returns 404 with title "Page no longer available." But `llms.txt` advertises `/en/glossary/` as a citation hub and the index page is in the AI sitemap.
**Fix:** Decide — either rebuild glossary terms (per `mem://features/glossary-term-architecture`) and populate the sitemap, OR remove `/en/glossary/` and `/es/glossary/` from `llms.txt`, `ai-sitemap.xml`, and `sitemap-index.xml`. Recommend the latter unless content exists.

### 5. robots.txt vs sitemap conflict on /locations
robots.txt: `Disallow: /en/locations` and `Disallow: /es/locations`. But `sitemaps/en/locations.xml` has 36 URLs (Ohio, Dallas, Jacksonville, etc.) advertised. Crawlers get mixed signals; AI bots may discard the entire sitemap as untrustworthy.
**Fix:** Remove the locations sitemap entries from `sitemap-index.xml` (and the `.xml` files), OR remove the Disallow if you actually want them indexed. Per `mem://project/cleanup-legacy-purge` Costa del Sol locations are purged — recommend removing the sitemap.

### 6. 211 Q&A pages have speakable_answer >800 chars — fails AEO rules
Hans' AEO rules in `src/lib/aeoUtils.ts` cap acceptedAnswer at 150 words / 800 chars. 211 of 528 published Q&As violate this. AI engines truncate or skip long answers when generating citations.
**Fix:** Run a one-shot script to call `truncateForAEO()` on every `qa_pages.speakable_answer` >800 chars and persist the cleaned version. Optionally regenerate using Lovable AI (Gemini 3 Flash) to produce a tighter 80–120 word answer.

### 7. Person schema has no `image` and no `sameAs`
`PersonSchema.tsx` documents this as a TODO. Without a verified Person.image and Person.sameAs to authoritative profiles, E-E-A-T "Authoritativeness" is weak — this is the single biggest lever for ChatGPT/Perplexity citations.
**Fix:** Add `/public/images/steven-blog.jpg` + `/public/images/steven-qa.jpg` (verified headshot), add `sameAs: [LinkedIn personal URL, Crunchbase, Muckrack, etc.]`, add `alumniOf`, `award`, `hasCredential` (state insurance license numbers).

---

## High-priority issues

### 8. 30 published blog articles missing canonical_url, 14 missing meta_description
Inconsistent canonicals = duplicate-content risk. Missing meta_description = AI engines fall back to first paragraph, often citing the wrong sentence.
**Fix:** Backfill via SQL — set `canonical_url = 'https://www.everencewealth.com/' || language || '/blog/' || slug` where NULL; generate missing meta_descriptions via Lovable AI from `detailed_content`.

### 9. 6 blog articles missing featured_image_url or alt
Open Graph and Article schema both expect a primary image. AI engines (esp. Perplexity, Bing Copilot) prefer cited results with images.
**Fix:** Backfill image + alt for those 6 rows.

### 10. ai-plugin.json points to nonexistent OpenAPI spec
`api.url = https://www.everencewealth.com/openapi.yaml` — that file does not exist. ChatGPT plugin discovery will mark the plugin invalid.
**Fix:** Either publish a minimal `openapi.yaml` describing public read endpoints, or remove the `api` block (manifest-only is acceptable for retrieval-only sources).

### 11. llms.txt has stale references
- Lists `/en/locations/` as a "most cited content hub" while robots.txt disallows it.
- Lists `/en/glossary/` while glossary sitemap is empty.
- Lists sitemap URLs that no longer match `sitemap-index.xml` order.
**Fix:** Rewrite llms.txt to advertise only the hubs that actually have content (blog, qa, strategies, philosophy). Remove location and glossary lines unless content is restored.

### 12. Homepage is thin (274 words rendered)
Strategy page is also thin (297 words). AI engines weight content depth.
**Fix:** Add a 400-word summary block on home (Three Tax Buckets / The Gap / Independent Difference text) ensuring it renders in pre-rendered HTML, not behind motion-only reveals. Same for each strategy page (target 800–1200 words).

---

## Medium-priority issues

### 13. Strategy page robots tag is missing `max-video-preview` and `max-image-preview` consistency
Home/QA/Glossary index use `max-image-preview:large, max-snippet:-1, max-video-preview:-1`. Strategy page uses only `max-image-preview:large, max-snippet:-1`. Make uniform across all public templates.

### 14. hreflang missing trailing slashes and uses bare domain
Home: `hreflang="en" href="https://www.everencewealth.com"` but the served URL is `/en/`. Self-referencing hreflang must match canonical exactly. Same issue on x-default.
**Fix:** Set `hreflang=en` to `/en/`, `hreflang=es` to `/es/`, `x-default` to `/en/`.

### 15. Add Speakable schema to QA and Blog index pages
Speakable JSON-LD currently lives only on Philosophy. Add to BlogIndex and QA hub so Google Assistant / Alexa can read top answers aloud (a Google E-E-A-T ranking signal for finance YMYL content).

### 16. Add `mainEntity` and `author`+`reviewedBy` to every QA page
Already have author_id/reviewer_id in DB. Inject into JSON-LD as `Person` references (with sameAs to Steven Rosenberg `@id`). Highest-impact change for AI citation since it ties every answer to an authoritative person.

### 17. Add `LocalBusiness` daily-hours and `priceRange` to FinancialService
Both fields improve Knowledge-Panel eligibility, which strongly correlates with citation in AI Overviews.

---

## What this plan will deliver

```text
FILES TO EDIT
  public/robots.txt
  public/_redirects
  public/llms.txt
  public/llm.txt
  public/ai-sitemap.xml
  public/sitemap-index.xml
  public/sitemap.xml
  public/sitemaps/en/locations.xml      (delete)
  public/sitemaps/es/locations.xml      (delete)
  public/sitemaps/en/glossary.xml       (delete or repopulate)
  public/sitemaps/es/glossary.xml       (delete or repopulate)
  public/.well-known/ai-plugin.json
  src/pages/Home.tsx                    (canonical, description, hreflang, schema)
  src/components/schema/PersonSchema.tsx (image, sameAs, credentials)
  src/pages/strategies/*.tsx            (robots tag uniformity, longer copy)
  src/pages/BlogIndex.tsx               (Speakable schema)
  src/pages/Qa*.tsx                     (Speakable schema, author/reviewer in mainEntity)

DATABASE MIGRATIONS / SCRIPTS
  - Backfill blog_articles.canonical_url where NULL  (30 rows)
  - Backfill blog_articles.meta_description where missing/short (14 rows)
  - Backfill blog_articles.featured_image_url + alt (6 rows)
  - Truncate qa_pages.speakable_answer where >800 chars (211 rows)
    using truncateForAEO() rules

ASSETS YOU NEED TO PROVIDE
  - /public/images/steven-blog.jpg    (verified headshot, 1200x1200)
  - /public/images/steven-qa.jpg      (verified headshot, 800x800)
  - LinkedIn / Crunchbase / Muckrack URLs for Person.sameAs
  - State insurance license numbers (CA + 49 others) for hasCredential
```

---

## Suggested execution order (after approval)

1. Crawl + canonical fixes (issues 1, 2, 3, 14) — highest impact, lowest risk.
2. Sitemap/robots reconciliation (issues 4, 5, 11).
3. Database backfills (issues 6, 8, 9).
4. Schema enrichment (issues 7, 15, 16, 17) — pending the assets you provide.
5. Content depth (issue 12) — slowest to ship; can be staged.
6. Final validation: re-fetch as Googlebot + GPTBot + PerplexityBot, validate JSON-LD with Schema.org validator, submit refreshed sitemap-index to IndexNow.

Approve to proceed and I will start with steps 1–3 (crawl fixes + sitemap reconciliation + DB backfills) in the first build pass. I will pause before step 4 to collect your headshot/social-profile assets.
