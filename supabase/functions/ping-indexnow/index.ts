import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

const BASE_URL = 'https://www.everencewealth.com';
const HOST = 'www.everencewealth.com';

interface IndexNowRequest {
  urls?: string[];
  table?: string;
  slug?: string;
  source?: string;   // 'manual' | 'manual-bulk' | 'insert' | 'update' | 'delete'
  action?: string;   // legacy: TG_OP from old triggers
}

interface PingResult {
  endpoint: string;
  status: number;
  success: boolean;
  body?: string;
  error?: string;
}

// Legacy URL builder for {table, slug} payloads from older triggers
function buildUrlsFromContent(table: string, slug: string): string[] {
  const lang = 'en'; // legacy callers don't send language; default to EN
  switch (table) {
    case 'blog_articles':     return [`${BASE_URL}/${lang}/blog/${slug}/`];
    case 'qa_pages':          return [`${BASE_URL}/${lang}/qa/${slug}/`];
    case 'comparison_pages':  return [`${BASE_URL}/${lang}/compare/${slug}/`];
    case 'static_pages':      return [`${BASE_URL}/${lang}/${slug}/`];
    default:                  return [];
  }
}

async function submitToIndexNow(
  urls: string[],
  apiKey: string,
  keyLocation: string,
): Promise<PingResult[]> {
  const body = JSON.stringify({
    host: HOST,
    key: apiKey,
    keyLocation,
    urlList: urls,
  });

  const results: PingResult[] = [];

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const responseBody = await response.text().catch(() => '');
      results.push({
        endpoint,
        status: response.status,
        success: response.status === 200 || response.status === 202,
        body: responseBody.slice(0, 500),
      });
      console.log(`[indexnow] ${endpoint} -> ${response.status} (${urls.length} URLs)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[indexnow] ${endpoint} failed: ${msg}`);
      results.push({ endpoint, status: 0, success: false, error: msg });
    }
  }

  return results;
}

async function logPings(
  supabaseUrl: string,
  serviceKey: string,
  urls: string[],
  source: string,
  results: PingResult[],
): Promise<void> {
  try {
    const client = createClient(supabaseUrl, serviceKey);
    const rows = results.map((r) => ({
      urls,
      endpoint: r.endpoint,
      status_code: r.status,
      response_body: r.error ?? r.body ?? null,
      source,
    }));
    const { error } = await client.from('indexnow_pings').insert(rows);
    if (error) console.error(`[indexnow] log insert failed: ${error.message}`);
  } catch (err) {
    console.error(`[indexnow] log exception:`, err);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('INDEXNOW_KEY');
    if (!apiKey || apiKey.length < 8) {
      console.error('[indexnow] INDEXNOW_KEY secret missing or invalid');
      return new Response(
        JSON.stringify({ success: false, error: 'INDEXNOW_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const keyLocation = `${BASE_URL}/${apiKey}.txt`;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
                    ?? Deno.env.get('SUPABASE_ANON_KEY')!;

    const body: IndexNowRequest = await req.json().catch(() => ({}));

    let urls: string[] = [];
    let source = body.source ?? body.action?.toLowerCase() ?? 'manual';

    if (body.urls && body.urls.length > 0) {
      urls = body.urls;
    } else if (body.table && body.slug) {
      urls = buildUrlsFromContent(body.table, body.slug);
    }

    if (urls.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Provide either {urls: string[]} or {table, slug}' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (urls.length > 10000) {
      urls = urls.slice(0, 10000);
      console.warn('[indexnow] truncated URL list to 10000');
    }

    const results = await submitToIndexNow(urls, apiKey, keyLocation);

    // Fire-and-forget log (do not block response on log errors)
    logPings(supabaseUrl, serviceKey, urls, source, results).catch((e) =>
      console.error('[indexnow] log task failed', e),
    );

    const successCount = results.filter((r) => r.success).length;
    const overall = successCount > 0;

    return new Response(
      JSON.stringify({
        success: overall,
        urlCount: urls.length,
        source,
        endpoints: results.length,
        successful: successCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[indexnow] handler error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
