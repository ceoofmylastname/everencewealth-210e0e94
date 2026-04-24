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

// Spanish slug mappings for hreflang alternates
const SLUG_MAP_EN_TO_ES = {
  '/strategies/whole-life': '/estrategias/seguro-vida-entera',
  '/strategies/iul': '/estrategias/seguro-universal-indexado',
  '/strategies/tax-free-retirement': '/estrategias/retiro-libre-impuestos',
  '/strategies/asset-protection': '/estrategias/proteccion-de-activos',
  '/contact': '/contacto',
  '/philosophy': '/filosofia',
  '/about': '/acerca',
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

// Inject canonical, hreflang, and og:url into an HTML response
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

  const seoTags = `
<link rel="canonical" href="${canonicalUrl}" />
<link rel="alternate" hreflang="${lang}" href="${canonicalUrl}" />
<link rel="alternate" hreflang="${alternateLang}" href="${alternateUrl}" />
<link rel="alternate" hreflang="x-default" href="${defaultUrl}" />
<meta property="og:url" content="${canonicalUrl}" />`;

  return new HTMLRewriter()
    .on('head', {
      element(el) {
        el.append(seoTags, { html: true });
      }
    })
    .transform(response);
}

// SEO content routes that need edge function SSR
// NOTE: All content pages (blog, QA, compare, locations) are now pre-rendered
// as static HTML files during build. The middleware should NOT intercept them.
// Static files contain full branding + all SEO metadata (hreflang, canonical, schemas).
// Edge function is ONLY for truly dynamic routes or fallback scenarios.
const SEO_ROUTE_PATTERNS = [];


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

export async function onRequest({ request, next, env }) {
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
    /^\/(en|es)\/blog\/costadelsol\//.test(pathname) ||
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

    return withMiddlewareStatus(await next());
  }

  // Skip asset paths
  if (pathname.startsWith('/assets/') || pathname.startsWith('/.well-known/')) {
    return withMiddlewareStatus(await next());
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
  const homeMatch = pathname.match(/^\/(en|es)?\/?$/);
  if (strategyMatch || homeMatch) {
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
      return injectSeoTags(seoResponse, pathname.startsWith('/') && pathname.length > 1 ? pathname : '/en/');
    }

    console.log(`[Middleware] Static thin for ${pathname}, trying SSR fallback`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const ssrPath = pathname === '/' ? '/en/' : pathname;
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

      // If we got HTML content (check for DOCTYPE or <html), use it
      if (seoBody.includes('<!DOCTYPE html>') || seoBody.includes('<html')) {
        console.log('[Middleware] SEO function returned HTML');
        const edgeResponse = new Response(seoBody, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
            'X-SEO-Source': 'edge-function',
            'X-SEO-Status': seoStatus,
            'X-Middleware-Status': 'Active',
          }
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
