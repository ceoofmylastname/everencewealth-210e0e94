import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanResult {
  duplicates: number;
  textIssues: number;
  expiredUrls: number;
  logoIssues: number;
  totalScanned: number;
  jobId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanType = 'all', articleIds = null, clusterId = null, jobId = null } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Starting image scan: type=${scanType}, clusterId=${clusterId}`);

    const result: ScanResult = {
      duplicates: 0,
      textIssues: 0,
      expiredUrls: 0,
      logoIssues: 0,
      totalScanned: 0
    };

    // Build base query
    let query = supabase
      .from('blog_articles')
      .select('id, headline, featured_image_url, language, cluster_id')
      .eq('status', 'published')
      .not('featured_image_url', 'is', null);

    if (clusterId) {
      query = query.eq('cluster_id', clusterId);
    }
    
    if (articleIds && articleIds.length > 0) {
      query = query.in('id', articleIds);
    }

    const { data: articles, error: articlesError } = await query;

    if (articlesError) {
      throw new Error(`Failed to fetch articles: ${articlesError.message}`);
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, result, message: 'No articles to scan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${articles.length} articles to scan`);
    result.totalScanned = articles.length;

    // Track job progress for the dashboard if a jobId is supplied
    const updateJob = async (patch: Record<string, unknown>) => {
      if (!jobId) return;
      const { error } = await supabase
        .from('image_scan_jobs')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', jobId);
      if (error) console.error('Failed to update scan job:', error);
    };

    if (jobId) {
      await updateJob({
        status: 'running',
        total: articles.length,
        processed: 0,
        flagged: 0,
        started_at: new Date().toISOString()
      });
      result.jobId = jobId;
    }

    // 1. DUPLICATE DETECTION (instant - group by URL)
    if (scanType === 'all' || scanType === 'duplicates') {
      const urlGroups: Record<string, typeof articles> = {};
      
      for (const article of articles) {
        const url = article.featured_image_url;
        if (!urlGroups[url]) {
          urlGroups[url] = [];
        }
        urlGroups[url].push(article);
      }

      // Find duplicates (URLs shared by 2+ articles)
      for (const [url, groupArticles] of Object.entries(urlGroups)) {
        if (groupArticles.length > 1) {
          for (const article of groupArticles) {
            const { error: upsertError } = await supabase
              .from('article_image_issues')
              .upsert({
                article_id: article.id,
                issue_type: 'duplicate',
                severity: groupArticles.length > 5 ? 'high' : 'medium',
                details: {
                  shared_url: url,
                  shared_with_count: groupArticles.length - 1,
                  shared_with_articles: groupArticles
                    .filter(a => a.id !== article.id)
                    .slice(0, 5)
                    .map(a => ({ id: a.id, headline: a.headline }))
                },
                analyzed_at: new Date().toISOString()
              }, {
                onConflict: 'article_id,issue_type'
              });

            if (upsertError) {
              console.error(`Failed to record duplicate for ${article.id}:`, upsertError);
            } else {
              result.duplicates++;
            }
          }
        }
      }
      console.log(`Found ${result.duplicates} duplicate image issues`);
    }

    // 2. EXPIRED URL DETECTION (instant - pattern matching)
    if (scanType === 'all' || scanType === 'expired') {
      const expiredPatterns = [
        'oaidalleapiprodscus.blob.core.windows.net',
        'oaidalleapiprodeus.blob.core.windows.net',
        'dalleprodsec.blob.core.windows.net'
      ];

      for (const article of articles) {
        const url = article.featured_image_url || '';
        const isExpired = expiredPatterns.some(pattern => url.includes(pattern));
        
        if (isExpired) {
          const { error: upsertError } = await supabase
            .from('article_image_issues')
            .upsert({
              article_id: article.id,
              issue_type: 'expired_url',
              severity: 'high',
              details: {
                url: url,
                reason: 'OpenAI DALL-E temporary URL detected (expires after 60 minutes)'
              },
              analyzed_at: new Date().toISOString()
            }, {
              onConflict: 'article_id,issue_type'
            });

          if (upsertError) {
            console.error(`Failed to record expired URL for ${article.id}:`, upsertError);
          } else {
            result.expiredUrls++;
          }
        }
      }
      console.log(`Found ${result.expiredUrls} expired URL issues`);
    }

    // 3. TEXT DETECTION (AI-powered - slower, optional)
    // This is expensive so we don't run it by default in bulk
    if (scanType === 'text' && articleIds && articleIds.length <= 10) {
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      
      if (openAIApiKey) {
        for (const article of articles) {
          try {
            // Call analyze-image-for-text function
            const analysisResponse = await fetch(
              `${supabaseUrl}/functions/v1/analyze-image-for-text`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageUrl: article.featured_image_url })
              }
            );

            if (analysisResponse.ok) {
              const { analysis } = await analysisResponse.json();
              
              if (analysis?.hasText && analysis?.severity !== 'none') {
                const { error: upsertError } = await supabase
                  .from('article_image_issues')
                  .upsert({
                    article_id: article.id,
                    issue_type: 'text_detected',
                    severity: analysis.severity,
                    details: {
                      textType: analysis.textType,
                      description: analysis.description,
                      imageUrl: article.featured_image_url
                    },
                    analyzed_at: new Date().toISOString()
                  }, {
                    onConflict: 'article_id,issue_type'
                  });

                if (!upsertError) {
                  result.textIssues++;
                }
              }
            }
          } catch (textError) {
            console.error(`Text analysis failed for ${article.id}:`, textError);
          }
        }
        console.log(`Found ${result.textIssues} text issues`);
      }
    }

    // 4. LOGO / BRANDING DETECTION (AI-powered, full-site sweep, no 10-image cap)
    if (scanType === 'logos') {
      const BATCH_SIZE = 5;
      let processed = 0;

      for (let i = 0; i < articles.length; i += BATCH_SIZE) {
        const batch = articles.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (article) => {
          try {
            const analysisResponse = await fetch(
              `${supabaseUrl}/functions/v1/analyze-image-for-text`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageUrl: article.featured_image_url, mode: 'logo' })
              }
            );

            if (!analysisResponse.ok) {
              console.error(`Logo analysis failed for ${article.id}: ${analysisResponse.status}`);
              return;
            }

            const { analysis } = await analysisResponse.json();
            const isFlagged = analysis?.hasLogo === true
              || analysis?.textType === 'logo'
              || analysis?.textType === 'brand_mark'
              || analysis?.textType === 'watermark'
              || (analysis?.brandName && analysis.brandName.toLowerCase() !== 'everence wealth' && analysis.brandName.toLowerCase() !== 'everence');

            if (isFlagged) {
              const { error: upsertError } = await supabase
                .from('article_image_issues')
                .upsert({
                  article_id: article.id,
                  issue_type: 'logo_detected',
                  severity: analysis?.severity === 'low' ? 'low' : 'high',
                  details: {
                    brand_name: analysis?.brandName ?? null,
                    text_type: analysis?.textType ?? 'logo',
                    description: analysis?.description ?? 'Logo or brand mark detected',
                    imageUrl: article.featured_image_url,
                    original_url: article.featured_image_url
                  },
                  analyzed_at: new Date().toISOString(),
                  resolved_at: null,
                  resolved_by: null
                }, { onConflict: 'article_id,issue_type' });

              if (upsertError) {
                console.error(`Failed to record logo issue for ${article.id}:`, upsertError);
              } else {
                result.logoIssues++;
              }
            }
          } catch (err) {
            console.error(`Logo analysis error for ${article.id}:`, err);
          }
        }));

        processed += batch.length;
        await updateJob({ processed, flagged: result.logoIssues });
      }

      console.log(`Found ${result.logoIssues} logo/branding issues across ${processed} images`);
    }

    if (jobId) {
      await updateJob({
        status: 'completed',
        processed: articles.length,
        flagged: result.logoIssues,
        finished_at: new Date().toISOString()
      });
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scan-article-images:', error);
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body?.jobId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        await supabase
          .from('image_scan_jobs')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            finished_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', body.jobId);
      }
    } catch (_) { /* ignore */ }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
