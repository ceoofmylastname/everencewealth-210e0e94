import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base URL for the site
const SITE_URL = 'https://www.delsolprimehomes.com';

// IndexNow API key (matches the public/{key}.txt file)
const INDEXNOW_KEY = 'b8f4e2a1c9d7f3e5a6b2c4d8e0f1a2b3';

// All sitemap URLs to ping
const SITEMAPS = [
  `${SITE_URL}/sitemap-index.xml`,
  `${SITE_URL}/sitemap-blog.xml`,
  `${SITE_URL}/sitemap-qa.xml`,
  `${SITE_URL}/sitemap-glossary.xml`,
  `${SITE_URL}/sitemap-locations.xml`,
];

// Bing sitemap ping endpoint
const BING_PING_URL = 'https://www.bing.com/ping';

// IndexNow API endpoint (Bing hosts the shared IndexNow API)
const INDEXNOW_API = 'https://api.indexnow.org/indexnow';

interface PingResult {
  service: string;
  url: string;
  status: number;
  success: boolean;
  message?: string;
}

interface RequestBody {
  table?: string;
  slug?: string;
  action?: string;
  urls?: string[];
  manual?: boolean;
}

// Ping Bing with a sitemap URL
async function pingBingSitemap(sitemapUrl: string): Promise<PingResult> {
  try {
    const pingUrl = `${BING_PING_URL}?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const response = await fetch(pingUrl, { method: 'GET' });
    
    return {
      service: 'Bing Sitemap',
      url: sitemapUrl,
      status: response.status,
      success: response.ok,
      message: response.ok ? 'Sitemap pinged successfully' : `HTTP ${response.status}`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error pinging Bing with ${sitemapUrl}:`, error);
    return {
      service: 'Bing Sitemap',
      url: sitemapUrl,
      status: 0,
      success: false,
      message: errorMessage,
    };
  }
}

// Submit URLs to IndexNow API for instant indexing
async function submitToIndexNow(urls: string[]): Promise<PingResult> {
  if (urls.length === 0) {
    return {
      service: 'IndexNow',
      url: 'N/A',
      status: 0,
      success: true,
      message: 'No URLs to submit',
    };
  }

  try {
    const payload = {
      host: 'www.delsolprimehomes.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls.slice(0, 10000), // IndexNow accepts up to 10,000 URLs per request
    };

    console.log('Submitting to IndexNow:', JSON.stringify(payload, null, 2));

    const response = await fetch(INDEXNOW_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // IndexNow returns 200 for success, 202 for accepted
    const success = response.status === 200 || response.status === 202;
    
    return {
      service: 'IndexNow',
      url: urls.join(', '),
      status: response.status,
      success,
      message: success 
        ? `${urls.length} URL(s) submitted successfully` 
        : `HTTP ${response.status}: ${await response.text()}`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error submitting to IndexNow:', error);
    return {
      service: 'IndexNow',
      url: urls.join(', '),
      status: 0,
      success: false,
      message: errorMessage,
    };
  }
}

// Build full URL from table and slug
function buildUrl(table: string, slug: string): string {
  switch (table) {
    case 'blog_articles':
      return `${SITE_URL}/blog/${slug}`;
    case 'qa_pages':
      return `${SITE_URL}/guide/${slug}`;
    default:
      return `${SITE_URL}/${slug}`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results: PingResult[] = [];
    let urlsToIndex: string[] = [];

    // Parse request body if present
    let body: RequestBody = {};
    try {
      body = await req.json();
    } catch {
      // No body or invalid JSON - will do full sitemap ping
    }

    console.log('Ping request received:', JSON.stringify(body));

    // If specific URLs provided or triggered by database
    if (body.table && body.slug) {
      const fullUrl = buildUrl(body.table, body.slug);
      urlsToIndex.push(fullUrl);
      console.log(`Content update detected: ${body.table} - ${body.slug}`);
      console.log(`URL to index: ${fullUrl}`);
    } else if (body.urls && Array.isArray(body.urls)) {
      urlsToIndex = body.urls;
      console.log(`Manual URL submission: ${urlsToIndex.length} URLs`);
    }

    // Always ping Bing with all sitemaps
    console.log('Pinging Bing with all sitemaps...');
    const bingPromises = SITEMAPS.map(sitemap => pingBingSitemap(sitemap));
    const bingResults = await Promise.all(bingPromises);
    results.push(...bingResults);

    // Submit specific URLs to IndexNow if we have them
    if (urlsToIndex.length > 0) {
      console.log(`Submitting ${urlsToIndex.length} URLs to IndexNow...`);
      const indexNowResult = await submitToIndexNow(urlsToIndex);
      results.push(indexNowResult);
    }

    // Summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log(`Ping complete: ${successCount}/${totalCount} successful`);
    console.log('Results:', JSON.stringify(results, null, 2));

    return new Response(
      JSON.stringify({
        success: successCount === totalCount,
        summary: `${successCount}/${totalCount} pings successful`,
        results,
        urlsIndexed: urlsToIndex,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in ping-sitemaps function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
