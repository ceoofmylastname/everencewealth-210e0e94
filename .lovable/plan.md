## PROMPT 13 — Soft-404 catchall + AI bot traffic logger

Eliminate the GSC "Soft 404 (FAILED)" bucket (46 URLs) by returning real 410/404 for
unmatched content URLs under `/blog/`, `/qa/`, `/locations/`, `/compare/`,
`/strategies/`, `/guides/`, `/state-guides/` instead of the SPA shell 200. Also
install a fire-and-forget bot traffic logger so we can confirm AI crawlers (now
unblocked) are actually arriving and what they fetch.

### Schema reality check (deviations from prompt)

I read the live DB before planning. Three corrections are required:

1. **`location_pages` does not have `slug` / `state_slug`.** It has `city_slug` and
   `topic_slug`. URL shape in the data is `/<lang>/locations/<city_slug>/<topic_slug>/`
   for BOTH `en` and `es` (no `/ubicaciones/` rows actually exist; SEO regex still
   accepts the alias for safety). The view will use those columns.
2. **`glossary_terms` table does not exist.** That UNION branch is dropped from the
   view. (Glossary content lives in `public/glossary.json`, not a DB table.)
3. **`gone_urls.path` does not exist** — the column is `url_path`. Lookup query
   updated accordingly.

Row counts for sanity: blog 132 + qa 528 + locations 55 + compare 14 + static 6 = **735 rows** in the view (matches the GSC indexed-count ballpark; safely small enough to skip materialization).

### Step 1 — Database (single migration)

Create the catalog view, the bot-traffic table + RLS + summary view, and the
supporting partial indexes.

```sql
-- 1a. Catalog view of every published, indexable URL on the site
CREATE OR REPLACE VIEW public.all_published_slugs AS
  SELECT ('/' || language || '/blog/' || slug || '/') AS full_path,
         slug, language
    FROM public.blog_articles WHERE status = 'published'
  UNION ALL
  SELECT ('/' || language || '/qa/' || slug || '/'), slug, language
    FROM public.qa_pages WHERE status = 'published'
  UNION ALL
  -- location_pages: actual cols are city_slug + topic_slug; routing is
  -- /<lang>/locations/<city_slug>/<topic_slug>/ for en AND es
  SELECT ('/' || language || '/locations/' || city_slug || '/' || topic_slug || '/'),
         topic_slug, language
    FROM public.location_pages WHERE status = 'published'
  UNION ALL
  SELECT ('/en/compare/' || slug || '/'), slug, 'en'
    FROM public.comparison_pages WHERE status = 'published' AND language = 'en'
  UNION ALL
  SELECT ('/es/comparar/' || slug || '/'), slug, 'es'
    FROM public.comparison_pages WHERE status = 'published' AND language = 'es'
  UNION ALL
  -- static_pages from PROMPT 12 — /<lang>/<slug>/
  SELECT ('/' || language || '/' || slug || '/'), slug, language
    FROM public.static_pages;

-- 1b. Partial indexes on source tables (view inherits perf via these)
CREATE INDEX IF NOT EXISTS idx_blog_articles_pub_lang_slug
  ON public.blog_articles(language, slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_qa_pages_pub_lang_slug
  ON public.qa_pages(language, slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_location_pages_pub_lang_city_topic
  ON public.location_pages(language, city_slug, topic_slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_comparison_pages_pub_lang_slug
  ON public.comparison_pages(language, slug) WHERE status = 'published';

-- 1c. Bot traffic log
CREATE TABLE public.bot_traffic_log (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ua TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status INT NOT NULL,
  cf_ray TEXT,
  country TEXT,
  response_bytes INT
);
CREATE INDEX bot_traffic_log_ts_idx ON public.bot_traffic_log (ts DESC);
CREATE INDEX bot_traffic_log_bot_name_idx ON public.bot_traffic_log (bot_name, ts DESC);

ALTER TABLE public.bot_traffic_log ENABLE ROW LEVEL SECURITY;

-- Anon = INSERT only (middleware fire-and-forget). No SELECT for anon =
-- write-only, no exfiltration. Admins read via service role / dashboard.
CREATE POLICY "bot_traffic_log_insert_anon"
  ON public.bot_traffic_log FOR INSERT TO anon WITH CHECK (true);

-- Admin read policy via existing has_role()
CREATE POLICY "bot_traffic_log_admin_select"
  ON public.bot_traffic_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 1d. Hourly summary view for the admin dashboard
CREATE OR REPLACE VIEW public.bot_traffic_summary AS
  SELECT bot_name,
         DATE_TRUNC('hour', ts) AS hour,
         COUNT(*) AS hits,
         COUNT(*) FILTER (WHERE status = 200) AS hits_200,
         COUNT(*) FILTER (WHERE status BETWEEN 400 AND 499) AS hits_4xx,
         COUNT(*) FILTER (WHERE status = 410) AS hits_410,
         COUNT(*) FILTER (WHERE status = 308) AS hits_308,
         COUNT(DISTINCT path) AS unique_paths
    FROM public.bot_traffic_log
   WHERE ts > NOW() - INTERVAL '7 days'
   GROUP BY bot_name, hour
   ORDER BY hour DESC, bot_name;
```

Post-migration sanity checks (read-only):
- `SELECT COUNT(*) FROM all_published_slugs;` → expect ~735
- `SELECT * FROM all_published_slugs LIMIT 5;` → confirm `full_path` values

### Step 2 — Middleware catchall (`functions/_middleware.js`)

Insertion point (verified by reading the full file): after the comma-strip 301
(line ~283), after the `is404Blocked` block (line ~319), after the static-extension
skip (line ~337) and asset-path skip (line ~342), and **before** the blog SSR
fallback (line ~348). This guarantees:
- Static assets, redirects, and 404 blocklist are untouched.
- Non-existent slugs return 410/404 immediately without burning an SSR call.
- Real published slugs fall through to the existing blog/qa/strategy/SEO branches.

Add at module top (after `LANGUAGES` const):

```js
// PROMPT 13: catchall regexes for unmatched content URLs.
// 1-segment: /<lang>/<section>/<slug>/
// 2-segment: /<lang>/locations/<city>/<topic>/
const ONE_SEGMENT_CATCHALL_REGEX =
  /^\/(en|es)\/(blog|qa|compare|comparisons|comparar|estrategias|strategies|guides|glossary|state-guides)\/[^\/]+\/?$/;
const TWO_SEGMENT_CATCHALL_REGEX =
  /^\/(en|es)\/(locations|ubicaciones)\/[^\/]+\/[^\/]+\/?$/;

// AI/search bot UA detection (used by Step 3 logger)
const KNOWN_BOTS = [
  { pattern: /GPTBot/i,             name: 'GPTBot' },
  { pattern: /ChatGPT-User/i,       name: 'ChatGPT-User' },
  { pattern: /OAI-SearchBot/i,      name: 'OAI-SearchBot' },
  { pattern: /ClaudeBot/i,          name: 'ClaudeBot' },
  { pattern: /anthropic-ai/i,       name: 'anthropic-ai' },
  { pattern: /Claude-Web/i,         name: 'Claude-Web' },
  { pattern: /PerplexityBot/i,      name: 'PerplexityBot' },
  { pattern: /Perplexity-User/i,    name: 'Perplexity-User' },
  { pattern: /Google-Extended/i,    name: 'Google-Extended' },
  { pattern: /Googlebot/i,          name: 'Googlebot' },
  { pattern: /Applebot-Extended/i,  name: 'Applebot-Extended' },
  { pattern: /Applebot/i,           name: 'Applebot' },
  { pattern: /Bingbot/i,            name: 'Bingbot' },
  { pattern: /meta-externalagent/i, name: 'meta-externalagent' },
  { pattern: /CCBot/i,              name: 'CCBot' },
  { pattern: /Bytespider/i,         name: 'Bytespider' },
  { pattern: /Amazonbot/i,          name: 'Amazonbot' },
];
function detectBotName(ua) {
  if (!ua) return null;
  for (const { pattern, name } of KNOWN_BOTS) if (pattern.test(ua)) return name;
  return null;
}
```

Add the catchall block immediately after the asset-path skip (`if (pathname.startsWith('/assets/') ...)`), before `const blogMatch = ...`:

```js
// PROMPT 13: Soft-404 catchall.
// Returns real 410 (intentionally retired, listed in gone_urls)
// or 404 (never existed) for unmatched content URLs.
// Hub roots (/en/, /en/blog/, etc.) and static prebuilt dirs
// (/en/about/, /en/team/, /en/contact/, /en/philosophy/,
// /en/team/steven-rosenberg/) are NOT matched by these regexes
// (they have no trailing slug segment, or different shape).
if (
  ONE_SEGMENT_CATCHALL_REGEX.test(pathname) ||
  TWO_SEGMENT_CATCHALL_REGEX.test(pathname)
) {
  try {
    const lookupUrl =
      `${SUPABASE_URL}/rest/v1/all_published_slugs` +
      `?full_path=eq.${encodeURIComponent(pathname)}&select=slug&limit=1`;
    const lookupResp = await fetch(lookupUrl, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    const rows = lookupResp.ok ? await lookupResp.json() : [];
    const exists = Array.isArray(rows) && rows.length > 0;

    if (!exists) {
      // Check gone_urls (column is url_path, not path)
      const goneUrl =
        `${SUPABASE_URL}/rest/v1/gone_urls` +
        `?url_path=eq.${encodeURIComponent(pathname)}&select=id&limit=1`;
      const goneResp = await fetch(goneUrl, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      });
      const goneRows = goneResp.ok ? await goneResp.json() : [];
      const isGone = Array.isArray(goneRows) && goneRows.length > 0;
      const status = isGone ? 410 : 404;
      const html = render410Page(pathname, status);
      const catchallResp = new Response(html, {
        status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-410-Source': 'middleware-catchall',
          'X-Middleware-Status': 'Active',
          'Cache-Control': 'public, max-age=300',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
      // Step 3: log bot hit before returning
      if (typeof ctx?.waitUntil === 'function') {
        ctx.waitUntil(logBotHit(request, catchallResp, ctx).catch(() => {}));
      }
      return catchallResp;
    }
  } catch (err) {
    // On lookup failure, do NOT block — fall through to SSR/SPA.
    console.error(`[Middleware] Catchall lookup failed for ${pathname}:`, err?.message);
  }
}
```

Add `render410Page(pathname, statusCode)` helper at module top (per prompt
verbatim — bilingual, noindex meta, Playfair/Lato styling, internal links to
home/blog/qa/sitemap, status badge).

### Step 3 — Bot traffic logger (fire-and-forget)

Two changes:

1. **Update handler signature** to receive `ctx`:
   `export async function onRequest({ request, next, env, ctx }) {`
   (Cloudflare Pages Functions provides `ctx.waitUntil`; current code omits it.)

2. **Add `logBotHit(request, response, ctx)`** at module top (per prompt
   verbatim, but using SUPABASE_URL/ANON constants already defined). Reads UA,
   matches `KNOWN_BOTS`, extracts `cf-ray` and `request.cf?.country`, POSTs to
   `/rest/v1/bot_traffic_log` with `Prefer: return=minimal`.

3. **Wrap every response path** so logging fires regardless of which branch
   produced the response. Cleanest approach: wrap the existing handler body in a
   helper, OR add a `logIfBot(response)` call at each `return` site that
   produces a final response. **Plan: wrap the handler.** Keep current handler
   logic in an internal `async function buildResponse()`; the exported
   `onRequest` calls it, then schedules the log:
   ```js
   export async function onRequest(context) {
     const { request, ctx } = context;
     const response = await buildResponse(context);
     if (typeof ctx?.waitUntil === 'function') {
       ctx.waitUntil(logBotHit(request, response, ctx).catch(() => {}));
     }
     return response;
   }
   ```
   This avoids touching every existing `return` site (there are ~12) while still
   capturing every status code we emit.

   Edge case: the comma-strip 301, 404 blocklist, and the new catchall return
   directly inside `buildResponse`, so they're covered. The blog/qa SSR branches
   that call `next()` then return its result are also covered.

### Step 4 — Verification (post-deploy)

Run the bash block from the prompt. PASS criteria:
- `/en/blog/this-slug-does-not-exist/` → `HTTP/2 410`, header `X-410-Source: middleware-catchall`
- `/en/locations/florida/this-city-does-not-exist/` → `HTTP/2 410`
- `/en/about/`, `/en/team/`, `/en/contact/`, `/en/philosophy/`,
  `/en/team/steven-rosenberg/` (and `/es/` equivalents) → all `200`
- Hub roots `/en/`, `/es/`, `/en/blog/`, `/en/qa/`, `/en/locations/`,
  `/en/compare/` → all `200`
- Real published slug (pick one from `SELECT full_path FROM all_published_slugs LIMIT 1;`) → `200`, no `X-410` header
- After 10 min: `SELECT bot_name, COUNT(*) FROM bot_traffic_log WHERE ts > NOW() - INTERVAL '15 minutes' GROUP BY bot_name;` → at least Googlebot/Bingbot rows; AI bots appear as they crawl
- `SELECT * FROM bot_traffic_summary LIMIT 5;` → returns hourly aggregated rows

### Guardrails honored

- Catchall sits AFTER static-asset bypass, comma-strip 301, and 404 blocklist;
  BEFORE blog/qa/strategy SSR branches. Hubs (no slug segment) and PROMPT 12
  static dirs (`/en/about/`, `/en/team/`, etc.) do not match either regex.
- `injectSeoTags` HTMLRewriter dedup logic is untouched.
- Comma-strip 301 redirect for `/locations/*` is untouched.
- Only `SUPABASE_ANON_KEY` is used in middleware (both view lookup and bot
  insert). Anon RLS allows INSERT-only on `bot_traffic_log`.
- View definition matches actual DB schema (`city_slug`/`topic_slug` for
  locations; no `glossary_terms`; `gone_urls.url_path`).

### Files changed

- New SQL migration: view, indexes, table, RLS, summary view
- `functions/_middleware.js`: catchall regexes + `render410Page` + `KNOWN_BOTS` +
  `detectBotName` + `logBotHit` + handler-wrap with `ctx.waitUntil`
