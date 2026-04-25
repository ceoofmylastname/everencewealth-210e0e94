# Fix 13 Phase 2 — Person Schema on BlogPosting

## Goal
Replace the current `author: { @type: "Organization" }` stub on the BlogPosting JSON-LD emitted by `serve-seo-page` with a fully-populated `Person` schema sourced from the cleaned `authors` table, plus `reviewedBy`. Include a defensive Organization fallback so a failed author lookup never breaks the page.

Phase 2 is **edge-function-only**. No middleware changes, no DB changes, no React/component changes.

## Scope (single file)
`supabase/functions/serve-seo-page/index.ts`

Other files stay untouched:
- middleware (`functions/_middleware.js`) — guard rails per user instructions
- `src/components/schema/PersonSchema.tsx` — only used by client React tree, not by the SSR JSON-LD that Googlebot reads
- DB schema — `authors.bio_short` / `authors.bio_full_markdown` already exist (added in Step 4); they’re currently NULL and Phase 3 will populate them

## Verified inputs (read-only DB checks)
- `authors` row for Steven (id `1a709766-…`): `name`, `job_title="Founder & Chief Wealth Strategist"`, `credentials=[…3 items…]`, `linkedin_url=https://www.linkedin.com/in/stevenrosenberg/`, `photo_url`, `bio` (518 chars), `bio_short=NULL`, `bio_full_markdown=NULL`
- All 132 published `blog_articles` map to that single `author_id`
- Compliance trigger blocks WRITES on regulated columns; we only READ, so no interaction

## Technical changes

### 1. Extend `PageMetadata` (around line 269)
Add optional fields populated only for blog content:
- `author_id?: string`
- `author?: AuthorRecord | null` (fetched record, or `null` if lookup failed)

Define a local `AuthorRecord` interface mirroring the columns we read: `id, name, job_title, bio, bio_short, bio_full_markdown, photo_url, linkedin_url, credentials, years_experience`.

### 2. Add `fetchAuthor(supabase, authorId)` helper
- `select('id, name, job_title, bio, bio_short, bio_full_markdown, photo_url, linkedin_url, credentials, years_experience').eq('id', authorId).maybeSingle()`
- Wrap in the existing `withTimeout` pattern used by other queries
- On error or null, log `[Author] lookup failed for <id>: <reason>` and return `null` so the defensive Organization fallback fires
- Cache results in a small in-memory `Map<string, AuthorRecord>` for the lifetime of the isolate (authors rarely change; same TTL approach as `pageCache`)

### 3. Wire it into `fetchBlogMetadata` (around line 365)
After the `exactMatch` is loaded:
- Capture `author_id: exactMatch.author_id`
- `const author = exactMatch.author_id ? await fetchAuthor(supabase, exactMatch.author_id) : null`
- Add both `author_id` and `author` to the returned metadata object

### 4. Rewrite `generateBlogPostingSchema` (lines 1613–1654)

Replace the hardcoded `author: { @type: "Organization", … }` block with this logic:

```text
if (metadata.author):
  authorNode = {
    "@type": "Person",
    "@id": `${BASE_URL}/${metadata.language}/team/steven-rosenberg#person`,
    "name": author.name,
    "jobTitle": author.job_title,
    "url": `${BASE_URL}/${metadata.language}/team/steven-rosenberg`,
    "image": author.photo_url || undefined,
    "description": author.bio_short || truncate(author.bio, 200) || undefined,
    "worksFor": { "@id": `${BASE_URL}/#organization` },
    "sameAs": author.linkedin_url ? [author.linkedin_url] : undefined,
    "hasCredential": (author.credentials || []).map(c => ({
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "professional certification",
      "name": c
    }))
  }
  reviewedByNode = { "@type": "Person", "@id": authorNode["@id"], "name": author.name }
else:
  // Defensive fallback — never break the page on a failed lookup
  authorNode = { "@type": "Organization", "@id": `${BASE_URL}/#organization`, "name": "Everence Wealth" }
  reviewedByNode = undefined  // omit reviewedBy entirely when author missing
```

Strip undefined values before serialization (`JSON.stringify` already drops them).

The team URL is hardcoded to `…/team/steven-rosenberg` because (a) all 132 published articles share that single author id and (b) the user’s verification command expects exactly that URL. If a second author ever lands, this becomes a slug lookup; we’ll cross that bridge in a future fix.

### 5. Keep everything else intact
- QAPage schema (line 1509) keeps its own author block — out of scope for Phase 2
- BreadcrumbList, FAQ, FinancialService, Speakable, ComparisonTable schemas — untouched
- All hreflang / canonical / 301 logic — untouched
- HTML body, microdata `itemprop` markup — untouched

## Verification (after deploy)

Run the curl + python script the user provided against:
- `https://www.everencewealth.com/en/blog/understanding-the-retirement-gap-why-it-matters-now-more-than-ever`

Expected:
```text
JSON-LD block count: 4   (Organization+Founders, Breadcrumb, BlogPosting, FAQPage)
Block N: @type=BlogPosting
  author.@type: Person
  author.name: Steven Rosenberg
  author.jobTitle: Founder & Chief Wealth Strategist
  author.url: https://www.everencewealth.com/en/team/steven-rosenberg
  author.hasCredential count: 3
  reviewedBy.@type: Person
  reviewedBy.name: Steven Rosenberg
```

If `author.@type` comes back as `Organization`, the lookup failed → pull `serve-seo-page` logs and grep for `[Author] lookup failed`.

Cache note: `serve-seo-page` has a 1-hour in-memory page cache. After deploy, the first request rebuilds; subsequent ones are cached. Cloudflare Pages also caches the SSR HTML edge-side, so the verification curl may need a Cloudflare URL purge for the test article (same pattern used at end of compliance sweep).

## Pause point
After Phase 2 verification comes back green, pause and request from the user:
1. `bio_short` (1–2 sentences for meta description / Person.description)
2. `bio_full_markdown` (3–4 paragraphs for the bio page body)
3. Any additional `sameAs` URLs beyond the LinkedIn already on file

User has these drafts pre-written; will paste on request. Then Phase 3 builds `/en/team/steven-rosenberg`.

## Risk assessment
- **Low risk**: single function, additive read query, defensive null fallback
- **No DB writes** → compliance trigger never engaged
- **No middleware changes** → all guard rails (canonical/hreflang dedup, comma-strip 301, static-asset bypass) stay in place
- **Cache invalidates naturally** on edge function redeploy (isolate restart wipes `pageCache`)

## Approval requested
Approve to switch to default mode and execute. I will:
1. Edit `supabase/functions/serve-seo-page/index.ts` only
2. Confirm deploy
3. Run the verification curl
4. Report results, then pause for the bio content

Pause without proceeding to Phase 3 if:
- author.@type renders as Organization (lookup failure → debug logs)
- JSON-LD block count != 4 (check for parse errors)
- Any non-blog page regresses (unlikely; QA path untouched)
