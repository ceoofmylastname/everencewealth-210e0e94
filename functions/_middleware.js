// ============================================================
// Cloudflare Pages Middleware - Routes SEO pages to edge function
// Calls Supabase serve-seo-page function for dynamic SEO content
// Last updated: 2026-04-16
// v2.2 - Fixed LANGUAGES array, legacy domains, added server-side SEO tag injection
// ============================================================

// Hardcoded values ensure middleware works in Cloudflare Pages environment
// (environment variables are NOT available in Pages Functions)
const SUPABASE_URL = 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienJtcG1xaWp2bWpiaGN0Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjk1MzUsImV4cCI6MjA4Njc0NTUzNX0.cI7HQmbY1XF_wmPMSm9ofbQdR3iujQ5_YNg8h_YLkVg';

// Supported languages
const LANGUAGES = ['en', 'es'];
const LANG_PATTERN = LANGUAGES.join('|');

const BASE_URL = 'https://www.everencewealth.com';

// ============================================================
// PROMPT 13 — Soft-404 catchall + AI bot traffic logger
// ============================================================

// Catchall regexes for unmatched content URLs.
// 1-segment slug: /<lang>/<section>/<slug>/
// 2-segment slug: /<lang>/locations/<city>/<topic>/
// Hub roots (/<lang>/, /<lang>/blog/) and PROMPT 12 static dirs
// (/en/about/, /en/team/, /en/contact/, /en/philosophy/) intentionally
// do NOT match (no slug segment, or different shape). The team bio
// /en/team/steven-rosenberg/ is a 2-segment path under /team/, which
// is also outside both regexes.
const CONTENT_PATH_CATCHALL_REGEX =
  /^\/(en|es)\/(blog|qa|compare|comparisons|comparar|estrategias|strategies|guides|glossary|state-guides)\/.+$/;
const TWO_SEGMENT_CATCHALL_REGEX =
  /^\/(en|es)\/(locations|ubicaciones)\/[^\/]+\/[^\/]+\/?$/;

// Known AI / search bot UA patterns (used by logBotHit)
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
  for (const { pattern, name } of KNOWN_BOTS) {
    if (pattern.test(ua)) return name;
  }
  return null;
}

// Fire-and-forget INSERT into bot_traffic_log via PostgREST.
// Anon role has INSERT-only RLS — this is intentional write-only access.
async function logBotHit(request, response) {
  const ua = request.headers.get('user-agent') || '';
  const botName = detectBotName(ua);
  if (!botName) return;

  const url = new URL(request.url);
  const cfRay = request.headers.get('cf-ray') || null;
  const country = (request.cf && request.cf.country) || null;
  const contentLengthHeader = response.headers.get('content-length');
  const responseBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : null;

  const payload = {
    ua: ua.slice(0, 500),
    bot_name: botName,
    method: request.method,
    path: url.pathname.slice(0, 1000),
    status: response.status,
    cf_ray: cfRay,
    country,
    response_bytes: Number.isFinite(responseBytes) ? responseBytes : null,
  };

  await fetch(`${SUPABASE_URL}/rest/v1/bot_traffic_log`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });
}

// Bilingual 410/404 page rendered by the soft-404 catchall.
// Intentional noindex meta + visible body content + internal links so
// AI engines see the page is retired/missing on purpose, not broken.
function render410Page(pathname, statusCode) {
  const isSpanish = pathname.startsWith('/es/');
  const lang = isSpanish ? 'es' : 'en';
  const title = isSpanish ? 'Página no disponible' : 'Page no longer available';
  const heading = isSpanish ? 'Esta página ya no está disponible' : 'This page is no longer available';
  const body = isSpanish
    ? 'El contenido que buscas ha sido retirado o reorganizado. Te invitamos a explorar nuestras secciones principales.'
    : 'The content you are looking for has been retired or reorganized. Explore our main sections instead.';
  const linksLabel = isSpanish ? 'Secciones principales' : 'Main sections';
  const homeLabel = isSpanish ? 'Inicio' : 'Home';
  const blogLabel = isSpanish ? 'Blog' : 'Blog';
  const qaLabel = isSpanish ? 'Preguntas y Respuestas' : 'Questions & Answers';
  const sitemapLabel = isSpanish ? 'Mapa del sitio' : 'Sitemap';
  const statusText = statusCode === 410 ? 'Gone (410)' : 'Not Found (404)';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${title} | Everence Wealth</title>
  <style>
    body { font-family: 'Lato', -apple-system, sans-serif; max-width: 720px; margin: 4rem auto; padding: 2rem; line-height: 1.6; color: #1f2937; }
    h1 { font-family: 'Playfair Display', Georgia, serif; color: #0f172a; font-size: 2rem; }
    .status { display: inline-block; padding: 0.25rem 0.75rem; background: #fef3c7; color: #92400e; font-size: 0.75rem; border-radius: 0.25rem; margin-bottom: 1rem; }
    a { color: #a87339; text-decoration: underline; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <span class="status">${statusText}</span>
  <h1>${heading}</h1>
  <p>${body}</p>
  <h2>${linksLabel}</h2>
  <ul>
    <li><a href="/${lang}/">${homeLabel}</a></li>
    <li><a href="/${lang}/blog/">${blogLabel}</a></li>
    <li><a href="/${lang}/qa/">${qaLabel}</a></li>
    <li><a href="/sitemap.xml">${sitemapLabel}</a></li>
  </ul>
</body>
</html>`;
}

// Spanish slug mappings for hreflang alternates.
// NOTE: /contact, /philosophy, /about, /team intentionally use English slugs
// in BOTH languages — those entries are NOT translated. Only strategies use
// Spanish slug variants because those routes are explicitly registered as
// /estrategias/* in App.tsx.
const SLUG_MAP_EN_TO_ES = {
  '/strategies/whole-life': '/estrategias/seguro-vida-entera',
  '/strategies/iul': '/estrategias/seguro-universal-indexado',
  '/strategies/tax-free-retirement': '/estrategias/retiro-libre-impuestos',
  '/strategies/asset-protection': '/estrategias/proteccion-de-activos',
};

// Build reverse map
const SLUG_MAP_ES_TO_EN = {};
for (const [en, es] of Object.entries(SLUG_MAP_EN_TO_ES)) {
  SLUG_MAP_ES_TO_EN[es] = en;
}

// Build the alternate path for hreflang
function buildAlternatePath(path, fromLang, toLang) {
  // Strip the language prefix: /en/strategies/whole-life -> /strategies/whole-life
  const pathWithoutLang = path.replace(new RegExp(`^/${fromLang}`), '');

  let alternatePathWithoutLang = pathWithoutLang;

  if (fromLang === 'en' && toLang === 'es') {
    alternatePathWithoutLang = SLUG_MAP_EN_TO_ES[pathWithoutLang] || pathWithoutLang;
  } else if (fromLang === 'es' && toLang === 'en') {
    alternatePathWithoutLang = SLUG_MAP_ES_TO_EN[pathWithoutLang] || pathWithoutLang;
  }

  return `/${toLang}${alternatePathWithoutLang}`;
}

// Inject canonical, hreflang, and og:url into an HTML response — but ONLY
// if they are not already present.
//
// Cloudflare HTMLRewriter streams the document in source order. By registering
// detector handlers on `link[rel="canonical"]`, `link[rel="alternate"][hreflang]`,
// and `meta[property="og:url"]`, we set boolean flags as those elements stream
// past inside <head>. We then attach an `onEndTag` callback to <head> that
// fires when </head> is parsed — by which point every child of <head> has
// already streamed through and updated our flags. Inside that callback we
// call `endTag.before(html, { html: true })`, which inserts the missing tags
// immediately before </head>.
//
// This prevents the previous bug where every SSR/static page shipped with 2+
// canonical tags (one from SSR, one from the middleware) and 6+ hreflang tags.
function injectSeoTags(response, pathname) {
  const langMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (!langMatch || !LANGUAGES.includes(langMatch[1])) return response;

  const lang = langMatch[1];
  const alternateLang = lang === 'en' ? 'es' : 'en';

  const canonicalUrl = `${BASE_URL}${pathname}`;
  const alternatePath = buildAlternatePath(pathname, lang, alternateLang);
  const alternateUrl = `${BASE_URL}${alternatePath}`;
  // x-default always points to the English version
  const enPath = lang === 'en' ? pathname : buildAlternatePath(pathname, lang, 'en');
  const defaultUrl = `${BASE_URL}${enPath}`;

  let hasCanonical = false;
  let hasHreflang = false;
  let hasOgUrl = false;

  return new HTMLRewriter()
    .on('link[rel="canonical"]', {
      element() { hasCanonical = true; }
    })
    .on('link[rel="alternate"][hreflang]', {
      element() { hasHreflang = true; }
    })
    .on('meta[property="og:url"]', {
      element() { hasOgUrl = true; }
    })
    .on('head', {
      element(el) {
        el.onEndTag((endTag) => {
          let tags = '';
          if (!hasCanonical) {
            tags += `\n<link rel="canonical" href="${canonicalUrl}" />`;
          }
          if (!hasHreflang) {
            tags +=
              `\n<link rel="alternate" hreflang="${lang}" href="${canonicalUrl}" />` +
              `\n<link rel="alternate" hreflang="${alternateLang}" href="${alternateUrl}" />` +
              `\n<link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`;
          }
          if (!hasOgUrl) {
            tags += `\n<meta property="og:url" content="${canonicalUrl}" />`;
          }
          if (tags) {
            endTag.before(tags, { html: true });
          }
        });
      }
    })
    .transform(response);
}

// SEO content routes that need edge function SSR.
//
// Detail pages: pre-rendered static HTML covers most of these, but the
// middleware still routes them to the edge function so that any newly
// published or recently updated detail page is served fresh from the DB
// (the edge function falls through to the static file if the DB row is
// missing).
//
// Hub / index pages (added 2026-04-24, Fix 9): /blog, /qa, /locations,
// /compare were previously SPA shells with no SSR schema. The edge
// function now renders fully-formed hub pages (H1 + intro + child links
// + FAQPage + ItemList + CollectionPage + BreadcrumbList) using a
// 10-minute hub_cache table for performance.
const SEO_ROUTE_PATTERNS = [
  // -------- Detail pages (already SSR'd by serve-seo-page) --------
  /^\/(en|es)\/blog\/[^\/]+\/?$/,
  /^\/(en|es)\/qa\/[^\/]+\/?$/,
  /^\/(en|es)\/strategies\/[^\/]+\/?$/,
  /^\/(en|es)\/estrategias\/[^\/]+\/?$/,
  /^\/(en|es)\/(locations|ubicaciones)\/[^\/]+(\/[^\/]+)?\/?$/,
  /^\/(en|es)\/(compare|comparar|comparisons)\/[^\/]+\/?$/,
  /^\/(en|es)\/(glossary|glosario)\/[^\/]+\/?$/,

  // -------- Hub / index pages (NEW - SSR via serve-seo-page) --------
  /^\/(en|es)\/blog\/?$/,
  /^\/(en|es)\/qa\/?$/,
  /^\/(en|es)\/(locations|ubicaciones)\/?$/,
  /^\/(en|es)\/(compare|comparar|comparisons)\/?$/,
];


// Check if path needs SEO edge function
function needsSEO(pathname) {
  // Root homepage should be served as static file, NOT via edge function
  // The homepage is pre-rendered as home.html during build
  if (pathname === '/') return false;
  
  // Check against SEO route patterns
  return SEO_ROUTE_PATTERNS.some(pattern => pattern.test(pathname));
}

// Static file extensions - skip edge function
const STATIC_EXTENSIONS = [
  '.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', 
  '.ico', '.woff', '.woff2', '.ttf', '.eot', '.webp', '.map',
  '.xml', '.txt', '.json'
];

async function buildResponse({ request, next, env, ctx }) {
  const url = new URL(request.url);
  // env is optional; used only for diagnostics

  const isLocalhost =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '::1';

  // ============================================================
  // RULE 1: Enforce www. prefix (301 Permanent Redirect)
  // Non-www URLs must redirect to www for SEO consistency
  // (Must run before ANY other logic)
  // ============================================================
  if (!isLocalhost && url.hostname === 'everencewealth.com') {
    const redirectUrl = new URL(url);
    redirectUrl.hostname = 'www.everencewealth.com';

    return new Response(null, {
      status: 301,
      headers: {
        Location: redirectUrl.toString(),
        'X-Middleware-Status': 'Active',
      },
    });
  }

  // ============================================================
  // RULE 2: Redirect CRM routes from Lovable subdomain to production
  // Catches old email links that used the fallback subdomain
  // ============================================================
  if (url.hostname === 'blog-knowledge-vault.lovable.app' && url.pathname.startsWith('/crm/')) {
    const redirectUrl = new URL(url);
    redirectUrl.hostname = 'www.everencewealth.com';
    
    console.log(`[Middleware] Redirecting CRM from Lovable subdomain: ${url.pathname} → ${redirectUrl.toString()}`);
    
    return new Response(null, {
      status: 301,
      headers: {
        Location: redirectUrl.toString(),
        'X-Middleware-Status': 'Active',
      },
    });
  }

  const pathname = url.pathname;

  // Adds a debug header so we can verify middleware execution in the Network tab.
  function withMiddlewareStatus(response) {
    const headers = new Headers(response.headers);
    headers.set('X-Middleware-Status', 'Active');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  // ============================================================
  // 301 REDIRECT MAP — Legacy URLs to current equivalents
  // ============================================================
  const REDIRECT_MAP = {
    '/financial-planning/three-tax-buckets': '/en/blog/tax-planning/understanding-three-tax-buckets',
    '/wealth-strategies/zero-is-your-hero': '/en/blog/wealth-management/three-tax-buckets',
    '/indexed-universal-life-insurance/introduction': '/en/strategies/iul',
    '/schedule': '/en/contact',
    '/financial-needs-assessment': '/en/contact',
    '/en/strategies': '/en/',
    '/es/strategies': '/es/',
    '/en/tax-bucket-guide': '/en/blog/tax-planning/understanding-three-tax-buckets',
    '/es/tax-bucket-guide': '/es/',
    '/en/calculator': '/en/',
    '/es/calculator': '/es/',
    '/en/careers': '/en/',
    '/es/careers': '/es/',
    '/en/contact/fna': '/en/contact',
    '/disclosures': '/en/',
  };

  // Check exact match redirects
  const redirectTarget = REDIRECT_MAP[pathname];
  if (redirectTarget) {
    console.log(`[Middleware] 301 redirect: ${pathname} → ${redirectTarget}`);
    return new Response(null, {
      status: 301,
      headers: {
        Location: `${BASE_URL}${redirectTarget}`,
        'X-Middleware-Status': 'Active',
      },
    });
  }

  // ============================================================
  // RULE: Strip commas from /<lang>/(locations|ubicaciones)/* URLs.
  // Historical city_slug values like "los-angeles,-ca" produced URLs
  // with literal commas. The DB has been cleaned + locked, so any
  // inbound request still carrying a comma is from an old external
  // link or stale crawler cache. 301 to the comma-free path.
  // (Cloudflare decodes %2C before this runs, so the regex covers
  // both raw and encoded comma URLs.)
  // ============================================================
  if (/^\/(en|es)\/(locations|ubicaciones)\/[^\/]*,/.test(pathname)) {
    const cleaned = pathname.replace(/,(?=-)/g, '').replace(/,/g, '');
    if (cleaned !== pathname) {
      const target = new URL(cleaned + url.search, url.origin).toString();
      console.log(`[Middleware] 301 comma-strip: ${pathname} → ${cleaned}`);
      return new Response(null, {
        status: 301,
        headers: {
          Location: target,
          'X-Middleware-Status': 'Active',
        },
      });
    }
  }

  // Prefix redirect: /blog/category/* → /en/
  if (pathname.startsWith('/blog/category/')) {
    console.log(`[Middleware] 301 redirect (prefix): ${pathname} → /en/`);
    return new Response(null, {
      status: 301,
      headers: {
        Location: `${BASE_URL}/en/`,
        'X-Middleware-Status': 'Active',
      },
    });
  }

  // ============================================================
  // 404 BLOCKLIST — Return real HTTP 404 for invalid content
  // ============================================================
  const is404Blocked =
    /^\/es\/property\//.test(pathname) ||
    pathname === '/blog/category/buying property' ||
    pathname === '/blog/category/retirement planning';

  if (is404Blocked) {
    console.log(`[Middleware] 404 blocked: ${pathname}`);
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>404 Not Found</title></head><body><h1>404 — Page Not Found</h1><p>The page you requested does not exist.</p><a href="${BASE_URL}/en/">Return to homepage</a></body></html>`,
      {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex',
          'X-Middleware-Status': 'Active',
        },
      }
    );
  }

  // Skip static files
  if (STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    // Special handling for XML files
    if (pathname.endsWith('.xml')) {
      const response = await next();
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'application/xml; charset=utf-8');
      headers.set('X-Middleware-Status', 'Active');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    // Special handling for plain-text discovery files (PROMPT 20).
    // Without this, /llms.txt and /llms-full.txt were caught by the SPA
    // fallback and served as text/html, which AI agents (ChatGPT, Claude,
    // Perplexity) silently down-weight. Forcing text/plain on every .txt
    // restores content-type fidelity for /llm.txt, /llms.txt,
    // /llms-full.txt, /robots.txt, /ai.txt, etc. without per-file
    // allowlists.
    if (pathname.endsWith('.txt')) {
      const response = await next();
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'text/plain; charset=utf-8');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Middleware-Status', 'Active');
      if (!headers.has('Cache-Control')) {
        headers.set('Cache-Control', 'public, max-age=3600');
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return withMiddlewareStatus(await next());
  }

  // Skip asset paths
  if (pathname.startsWith('/assets/') || pathname.startsWith('/.well-known/')) {
    return withMiddlewareStatus(await next());
  }

  // ============================================================
  // PROMPT 13 — Soft-404 catchall.
  // Returns real 410 (intentionally retired, listed in gone_urls) or
  // 404 (never existed) for unmatched content URLs under /blog/, /qa/,
  // /compare/, /strategies/, /guides/, /state-guides/, /glossary/,
  // and /locations/<city>/<topic>/. Without this, the SPA shell would
  // return 200 — Google reports those as "Soft 404 (FAILED)".
  //
  // Hub roots (/<lang>/, /<lang>/blog/, etc.) and PROMPT 12 static
  // prebuilt directories (/en/about/, /en/team/, /en/contact/,
  // /en/philosophy/, /en/team/steven-rosenberg/, plus /es/ versions)
  // do NOT match these regexes, so they fall through untouched.
  // ============================================================
  if (
    CONTENT_PATH_CATCHALL_REGEX.test(pathname) ||
    TWO_SEGMENT_CATCHALL_REGEX.test(pathname)
  ) {
    try {
      // Normalize path: all_published_slugs view stores paths with trailing
      // slash. Always look up the trailing-slash variant.
      const normalizedPath = pathname.endsWith('/') ? pathname : pathname + '/';
      const lookupUrl =
        `${SUPABASE_URL}/rest/v1/all_published_slugs` +
        `?full_path=eq.${encodeURIComponent(normalizedPath)}&select=slug&limit=1`;
      const lookupResp = await fetch(lookupUrl, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      const rows = lookupResp.ok ? await lookupResp.json() : [];
      const exists = Array.isArray(rows) && rows.length > 0;

      if (!exists) {
        // Not in published surface. Check if explicitly retired.
        // gone_urls rows may have been inserted with or without a trailing
        // slash; match both variants.
        const slashed = pathname.endsWith('/') ? pathname : pathname + '/';
        const unslashed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
        const goneUrl =
          `${SUPABASE_URL}/rest/v1/gone_urls` +
          `?or=(url_path.eq.${encodeURIComponent(slashed)},url_path.eq.${encodeURIComponent(unslashed)})&select=id&limit=1`;
        const goneResp = await fetch(goneUrl, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
        const goneRows = goneResp.ok ? await goneResp.json() : [];
        const isGone = Array.isArray(goneRows) && goneRows.length > 0;
        const status = isGone ? 410 : 404;
        const html = render410Page(pathname, status);
        console.log(`[Middleware] Catchall ${status}: ${pathname}`);
        return new Response(html, {
          status,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-410-Source': 'middleware-catchall',
            'X-Middleware-Status': 'Active',
            'Cache-Control': 'public, max-age=300',
            'X-Robots-Tag': 'noindex, nofollow',
          },
        });
      }
    } catch (err) {
      // On lookup failure, do not block — fall through to SSR/SPA.
      console.error(`[Middleware] Catchall lookup failed for ${pathname}:`, err && err.message);
    }
  }

  // ============================================================
  // BLOG SSR FALLBACK: Try static file first, then edge function
  // Ensures crawlers get full HTML with internal links section
  // ============================================================
  const blogMatch = pathname.match(/^\/([a-z]{2})\/blog\/(.+)/);
  if (blogMatch) {
    const staticResponse = await next();
    const staticClone = staticResponse.clone();
    const staticBody = await staticClone.text();

    const isComplete =
      staticBody.includes('<!DOCTYPE html>') &&
      !staticBody.includes('<div id="root"></div>') &&
      staticBody.length > 5000 &&
      staticBody.includes('internal-links-section');

    if (isComplete) {
      console.log(`[Middleware] Blog static file served (complete): ${pathname}`);
      const headers = new Headers(staticResponse.headers);
      headers.set('X-Middleware-Status', 'Active');
      headers.set('X-SEO-Source', 'static');
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
      headers.set('CDN-Cache-Control', 'max-age=3600');
      headers.set('Cloudflare-CDN-Cache-Control', 'max-age=3600');
      headers.set('Vary', 'Accept-Encoding');
      const seoResponse = new Response(staticBody, {
        status: staticResponse.status,
        statusText: staticResponse.statusText,
        headers,
      });
      return injectSeoTags(seoResponse, pathname);
    }

    // Static file missing/thin/no internal links — call SSR
    console.log(`[Middleware] Blog static incomplete for ${pathname}, trying SSR fallback`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const ssrResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/serve-seo-page?path=${encodeURIComponent(pathname)}&html=true`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'X-Original-URL': url.toString(),
            'X-Forwarded-Host': url.host,
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      const ssrBody = await ssrResponse.text();

      if (ssrResponse.ok && ssrBody.includes('<!DOCTYPE html>') && ssrBody.length > 1000) {
        console.log(`[Middleware] Blog SSR fallback success: ${pathname}`);
        const blogSsrResponse = new Response(ssrBody, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            'CDN-Cache-Control': 'max-age=3600',
            'Cloudflare-CDN-Cache-Control': 'max-age=3600',
            'Vary': 'Accept-Encoding',
            'X-SEO-Source': 'edge-function-ssr',
            'X-Robots-Tag': 'all',
            'X-Middleware-Status': 'Active',
          },
        });
        return injectSeoTags(blogSsrResponse, pathname);
      }

      console.log(`[Middleware] Blog SSR returned ${ssrResponse.status}, falling through to SPA`);
    } catch (err) {
      console.error(`[Middleware] Blog SSR fallback error for ${pathname}:`, err?.message);
    }

    console.log(`[Middleware] Blog SSR did not yield substantial HTML for ${pathname}, falling through to SPA`);
    return next();
  }

  // ============================================================
  // Q&A SSR FALLBACK: Try static file first, then edge function
  // Ensures crawlers always get full HTML even if static files
  // are missing from deployment.
  // ============================================================
  const qaMatch = pathname.match(/^\/([a-z]{2})\/qa\/(.+)/);
  if (qaMatch) {
    const [, lang, slug] = qaMatch;

    // 1. Try static file via next() (_redirects may resolve it)
    const staticResponse = await next();
    const staticClone = staticResponse.clone();
    const staticBody = await staticClone.text();

    // 2. Check if response is substantial HTML (not the empty SPA shell)
    const isSubstantialHTML =
      staticBody.includes('<!DOCTYPE html>') &&
      !staticBody.includes('<div id="root"></div>') &&
      staticBody.length > 5000 &&
      staticBody.includes('internal-links-section');

      if (isSubstantialHTML) {
        console.log(`[Middleware] Q&A static file served: ${pathname}`);
        const headers = new Headers(staticResponse.headers);
        headers.set('X-Middleware-Status', 'Active');
        headers.set('X-SEO-Source', 'static');
        headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
        headers.set('CDN-Cache-Control', 'max-age=3600');
        headers.set('Cloudflare-CDN-Cache-Control', 'max-age=3600');
        headers.set('Vary', 'Accept-Encoding');
        const qaSeoResponse = new Response(staticBody, {
          status: staticResponse.status,
          statusText: staticResponse.statusText,
          headers,
        });
        return injectSeoTags(qaSeoResponse, pathname);
      }

    // 3. Static file missing/thin — call serve-seo-page edge function
    console.log(`[Middleware] Q&A static missing for ${pathname}, trying SSR fallback`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const ssrResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/serve-seo-page?path=${encodeURIComponent(pathname)}&html=true`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'X-Original-URL': url.toString(),
            'X-Forwarded-Host': url.host,
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      const ssrBody = await ssrResponse.text();

      if (ssrResponse.ok && ssrBody.includes('<!DOCTYPE html>') && ssrBody.length > 1000) {
        console.log(`[Middleware] Q&A SSR fallback success: ${pathname}`);
        const qaSsrResponse = new Response(ssrBody, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            'CDN-Cache-Control': 'max-age=3600',
            'Cloudflare-CDN-Cache-Control': 'max-age=3600',
            'Vary': 'Accept-Encoding',
            'X-SEO-Source': 'edge-function-ssr',
            'X-Robots-Tag': 'all',
            'X-Middleware-Status': 'Active',
          },
        });
        return injectSeoTags(qaSsrResponse, pathname);
      }

      console.log(`[Middleware] Q&A SSR returned ${ssrResponse.status}, falling through to SPA`);
    } catch (err) {
      console.error(`[Middleware] Q&A SSR fallback error for ${pathname}:`, err?.message);
    }

    console.log(`[Middleware] Q&A SSR did not yield substantial HTML for ${pathname}, falling through to SPA`);
    return next();
  }

  // ============================================================
  // STRATEGY + HOMEPAGE SSR FALLBACK
  // Try static file first, fall back to serve-seo-page if thin
  // ============================================================
  const strategyMatch = pathname.match(/^\/(en|es)\/(strategies|estrategias)\/[a-z0-9-]+\/?$/i);
  if (strategyMatch) {
    const staticResponse = await next();
    const staticClone = staticResponse.clone();
    const staticBody = await staticClone.text();

    const isComplete =
      staticBody.includes('<!DOCTYPE html>') &&
      !staticBody.includes('<div id="root"></div>') &&
      staticBody.length > 5000 &&
      staticBody.includes('internal-links-section');

    if (isComplete) {
      console.log(`[Middleware] Static served (complete): ${pathname}`);
      const headers = new Headers(staticResponse.headers);
      headers.set('X-Middleware-Status', 'Active');
      headers.set('X-SEO-Source', 'static');
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
      const seoResponse = new Response(staticBody, {
        status: staticResponse.status,
        statusText: staticResponse.statusText,
        headers,
      });
      return injectSeoTags(seoResponse, pathname);
    }

    console.log(`[Middleware] Static thin for ${pathname}, trying SSR fallback`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const ssrPath = pathname;
      const ssrResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/serve-seo-page?path=${encodeURIComponent(ssrPath)}&html=true`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'X-Original-URL': url.toString(),
            'X-Forwarded-Host': url.host,
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      const ssrBody = await ssrResponse.text();
      if (ssrResponse.ok && ssrBody.includes('<!DOCTYPE html>') && ssrBody.length > 1000) {
        console.log(`[Middleware] SSR fallback success: ${pathname}`);
        const ssrSchemaHeader = ssrResponse.headers.get('X-SSR-Schema') || 'injected=true';
        const ssrFinal = new Response(ssrBody, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            'X-SEO-Source': 'edge-function-ssr',
            'X-SSR-Schema': ssrSchemaHeader,
            'X-Robots-Tag': 'all',
            'X-Middleware-Status': 'Active',
          },
        });
        return injectSeoTags(ssrFinal, ssrPath);
      }
      console.log(`[Middleware] SSR returned ${ssrResponse.status}, falling through to SPA`);
    } catch (err) {
      console.error(`[Middleware] SSR fallback error for ${pathname}:`, err?.message);
    }
    return next();
  }

  // Check if this route needs SEO
  if (needsSEO(pathname)) {
    console.log('[Middleware] Routing to SEO edge function:', pathname);

    let seoStatus = 'pending';
    let seoBody = '';

    try {
      // Call Supabase edge function with 10-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const seoResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/serve-seo-page?path=${encodeURIComponent(pathname)}&html=true`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'X-Original-URL': url.toString(),
            'X-Forwarded-Host': url.host,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      seoStatus = String(seoResponse.status);

      // Get response body
      seoBody = await seoResponse.text();

      // ============================================================
      // FAIL LOUDLY: If edge function returns ANY non-200 status,
      // return that response directly - NEVER fall back to React
      // ============================================================
      if (!seoResponse.ok) {
        console.log(`[Middleware] Edge function returned ${seoResponse.status}:`, pathname);
        
        // Determine content type from response or default to text/html
        const contentType = seoResponse.headers.get('Content-Type') || 'text/html; charset=utf-8';
        
        return new Response(seoBody, {
          status: seoResponse.status,
          headers: {
            'Content-Type': contentType,
            'X-Robots-Tag': 'noindex',
            'X-SEO-Source': `edge-function-${seoResponse.status}`,
            'X-SEO-Status': seoStatus,
            'X-Middleware-Status': 'Active',
            'X-SEO-Debug': 'fail-loud-mode',
          }
        });
      }

      // If we got HTML content (check for DOCTYPE or <html), use it.
      // Copy ALL headers from the edge response so custom X-* headers
      // (X-SEO-Source, X-Hub-Type, X-SSR-Source, X-SSR-Schema,
      // X-Content-Language, etc.) survive the proxy hop. Middleware only
      // adds security/cache fallbacks when the edge function did not
      // already set them.
      if (seoBody.includes('<!DOCTYPE html>') || seoBody.includes('<html')) {
        console.log('[Middleware] SEO function returned HTML');
        const newHeaders = new Headers();
        for (const [key, value] of seoResponse.headers.entries()) {
          newHeaders.set(key, value);
        }
        // Always re-assert content-type (the upstream sometimes omits charset)
        newHeaders.set('Content-Type', 'text/html; charset=utf-8');
        // Middleware-owned diagnostics
        newHeaders.set('X-SEO-Status', seoStatus);
        newHeaders.set('X-Middleware-Status', 'Active');
        // Security + cache fallbacks (only if upstream did not set them)
        if (!newHeaders.has('Strict-Transport-Security')) {
          newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
        if (!newHeaders.has('X-Content-Type-Options')) {
          newHeaders.set('X-Content-Type-Options', 'nosniff');
        }
        if (!newHeaders.has('Referrer-Policy')) {
          newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        }
        if (!newHeaders.has('Cache-Control')) {
          newHeaders.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=86400');
        }
        const edgeResponse = new Response(seoBody, {
          status: 200,
          headers: newHeaders,
        });
        return injectSeoTags(edgeResponse, pathname);
      }

      // Edge function returned 200 but no HTML - still show the raw response
      console.log('[Middleware] SEO function returned 200 but no HTML');
      return new Response(seoBody || 'Edge function returned empty body', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-SEO-Source': 'edge-function-no-html',
          'X-SEO-Status': seoStatus,
          'X-Middleware-Status': 'Active',
        }
      });

    } catch (err) {
      return new Response(
        JSON.stringify(
          {
            error: 'Middleware Crash',
            name: err?.name,
            details: err?.message,
            stack: err?.stack,
            env_check: {
              has_url: !!env?.SUPABASE_URL,
              has_key: !!env?.SUPABASE_ANON_KEY,
            },
          },
          null,
          2
        ),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Middleware-Status': 'Active',
            'X-SEO-Status': 'MiddlewareCrash',
          },
        }
      );
    }
  }

  // ============================================================
  // ALL OTHER HTML PAGES: Inject SEO tags into SPA responses
  // Covers strategies, glossary, contact, philosophy, etc.
  // ============================================================
  const langRouteMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (langRouteMatch && LANGUAGES.includes(langRouteMatch[1])) {
    const response = await next();
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      return injectSeoTags(withMiddlewareStatus(response), pathname);
    }
    return withMiddlewareStatus(response);
  }

  // All other requests - pass through to React SPA
  return withMiddlewareStatus(await next());
}

// ============================================================
// PROMPT 13 — Exported handler wraps buildResponse so we can
// fire-and-forget the bot traffic logger AFTER the response is
// computed but BEFORE it is returned. ctx.waitUntil keeps the
// fetch worker alive long enough to flush the INSERT without
// blocking the response on its way to the crawler.
// ============================================================
export async function onRequest(context) {
  const response = await buildResponse(context);
  const ctx = context && context.ctx;
  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(logBotHit(context.request, response).catch(() => {}));
  }
  return response;
}
