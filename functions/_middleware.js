// Minimal middleware - pass through all requests to React app
// SEO injection temporarily disabled until database stability is resolved
// Last updated: 2026-01-18

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Static file extensions - serve directly
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.webp', '.map'];
  if (staticExtensions.some(ext => pathname.endsWith(ext))) {
    return next();
  }
  
  // XML/JSON files - serve directly with correct content type
  if (pathname.endsWith('.xml')) {
    const response = await next();
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'Content-Type': 'application/xml; charset=utf-8'
      }
    });
  }
  
  // All other requests - pass through to React SPA
  return next();
}
