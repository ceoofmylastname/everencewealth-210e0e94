import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 15; // Reduced batch size for reliability
const DELAY_MS = 300; // Slightly longer delay between requests
const TIMEOUT_MS = 8000; // 8 second timeout per URL

interface CitationHealthResult {
  url: string;
  status: 'healthy' | 'broken' | 'redirected' | 'slow' | 'unreachable';
  httpStatusCode: number | null;
  responseTimeMs: number;
  redirectUrl: string | null;
  pageTitle: string | null;
  error: string | null;
}

async function checkCitationHealth(url: string): Promise<CitationHealthResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual', // Handle redirects manually to avoid max redirect errors
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    
    // Handle redirects manually
    let finalUrl = url;
    let redirectUrl: string | null = null;
    
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        // Resolve relative URLs
        try {
          finalUrl = new URL(location, url).href;
          redirectUrl = finalUrl;
        } catch {
          redirectUrl = location;
        }
      }
    }
    
    const isRedirected = redirectUrl !== null;
    
    let status: CitationHealthResult['status'];
    if (response.status >= 200 && response.status < 300) {
      if (responseTimeMs > 5000) {
        status = 'slow';
      } else {
        status = 'healthy';
      }
    } else if (response.status >= 300 && response.status < 400) {
      status = 'redirected';
    } else if (response.status >= 400) {
      status = 'broken';
    } else {
      status = 'unreachable';
    }
    
    // If HEAD returns 405/403, try GET with reduced timeout
    let pageTitle: string | null = null;
    if (response.status === 405 || response.status === 403) {
      try {
        const getController = new AbortController();
        const getTimeoutId = setTimeout(() => getController.abort(), 5000);
        
        const getResponse = await fetch(url, {
          method: 'GET',
          redirect: 'manual',
          signal: getController.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        clearTimeout(getTimeoutId);
        
        if (getResponse.ok) {
          // Only read first 50KB to get title
          const reader = getResponse.body?.getReader();
          if (reader) {
            let html = '';
            let bytesRead = 0;
            const maxBytes = 50000;
            
            while (bytesRead < maxBytes) {
              const { done, value } = await reader.read();
              if (done) break;
              html += new TextDecoder().decode(value);
              bytesRead += value.length;
              
              // Check if we have the title already
              const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
              if (titleMatch) {
                pageTitle = titleMatch[1].trim().substring(0, 200);
                break;
              }
            }
            reader.cancel();
          }
          status = 'healthy';
        }
      } catch {
        // Ignore GET errors, keep HEAD result
      }
    }
    
    return {
      url,
      status,
      httpStatusCode: response.status,
      responseTimeMs,
      redirectUrl,
      pageTitle,
      error: null,
    };
    
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    
    // Categorize specific error types
    let status: CitationHealthResult['status'] = 'unreachable';
    
    if (errorMessage.includes('AbortError') || errorMessage.includes('aborted')) {
      // Timeout - mark as slow/unreachable
      status = 'unreachable';
    } else if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
      // SSL errors - still might be accessible via browser
      status = 'unreachable';
    } else if (errorMessage.includes('redirect')) {
      // Too many redirects
      status = 'broken';
    }
    
    console.log(`⚠️ ${url}: ${errorMessage.substring(0, 100)}`);
    
    return {
      url,
      status,
      httpStatusCode: null,
      responseTimeMs,
      redirectUrl: null,
      pageTitle: null,
      error: errorMessage.substring(0, 500),
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting citation health check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get count of unchecked citations
    const { count: uncheckedCount } = await supabase
      .from('external_citation_health')
      .select('*', { count: 'exact', head: true })
      .is('status', null);

    console.log(`📊 Unchecked citations: ${uncheckedCount || 0}`);

    // Fetch batch of unchecked citations
    const { data: citations, error: fetchError } = await supabase
      .from('external_citation_health')
      .select('url')
      .is('status', null)
      .limit(BATCH_SIZE);

    if (fetchError) throw fetchError;

    if (!citations || citations.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          checked: 0, 
          remaining: 0,
          message: 'All citations checked' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔄 Processing ${citations.length} citations...`);

    const stats = { healthy: 0, broken: 0, redirected: 0, slow: 0, unreachable: 0 };

    // Process each URL
    for (const citation of citations) {
      try {
        const result = await checkCitationHealth(citation.url);
        
        // Update the record
        const { error: updateError } = await supabase
          .from('external_citation_health')
          .update({
            last_checked_at: new Date().toISOString(),
            status: result.status,
            http_status_code: result.httpStatusCode,
            response_time_ms: result.responseTimeMs,
            redirect_url: result.redirectUrl,
            page_title: result.pageTitle,
            times_verified: result.status === 'healthy' || result.status === 'redirected' ? 1 : 0,
            times_failed: result.status === 'broken' || result.status === 'unreachable' ? 1 : 0,
            updated_at: new Date().toISOString(),
          })
          .eq('url', citation.url);

        if (!updateError) {
          stats[result.status]++;
          console.log(`✓ ${result.status}: ${citation.url.substring(0, 60)}...`);
        }
      } catch (err) {
        console.error(`Error processing ${citation.url}:`, err);
        // Mark as unreachable on processing error
        await supabase
          .from('external_citation_health')
          .update({
            status: 'unreachable',
            last_checked_at: new Date().toISOString(),
            times_failed: 1,
          })
          .eq('url', citation.url);
        stats.unreachable++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }

    const remaining = Math.max(0, (uncheckedCount || 0) - citations.length);

    console.log(`✅ Done: ${citations.length} checked, ${remaining} remaining`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: citations.length,
        ...stats,
        remaining,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
