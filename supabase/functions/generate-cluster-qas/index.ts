import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Orchestrator function - generates ALL Q&As for an entire cluster
 * 
 * For a cluster with 6 English articles:
 * - Calls generate-article-qas for each article
 * - Each call generates 40 Q&As (4 types × 10 languages)
 * - Total: 6 × 40 = 240 Q&As per cluster
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clusterId, dryRun = false, singleArticleId } = await req.json();
    
    if (!clusterId) {
      return new Response(JSON.stringify({ error: 'clusterId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`[Orchestrator] Starting Q&A generation for cluster: ${clusterId}`);

    // Get all English articles in the cluster
    const { data: englishArticles, error: articlesError } = await supabase
      .from('blog_articles')
      .select('id, headline, slug')
      .eq('cluster_id', clusterId)
      .eq('language', 'en')
      .eq('status', 'published')
      .order('created_at', { ascending: true });

    if (articlesError || !englishArticles || englishArticles.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No English articles found in cluster',
        clusterId 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Orchestrator] Found ${englishArticles.length} English articles`);

    // If single article mode, filter to just that article
    const articlesToProcess = singleArticleId 
      ? englishArticles.filter(a => a.id === singleArticleId)
      : englishArticles;

    if (articlesToProcess.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Article not found in cluster',
        clusterId,
        singleArticleId 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = {
      totalArticles: articlesToProcess.length,
      completedArticles: 0,
      totalQAsCreated: 0,
      totalQAsFailed: 0,
      articleResults: [] as any[],
    };

    // Process each article
    for (let i = 0; i < articlesToProcess.length; i++) {
      const article = articlesToProcess[i];
      console.log(`[Orchestrator] Processing article ${i + 1}/${articlesToProcess.length}: ${article.headline}`);

      try {
        // Call generate-article-qas edge function
        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-article-qas`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              englishArticleId: article.id,
              dryRun,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Orchestrator] Failed for ${article.headline}:`, errorText);
          results.articleResults.push({
            articleId: article.id,
            headline: article.headline,
            success: false,
            error: errorText,
          });
          continue;
        }

        const result = await response.json();
        
        results.completedArticles++;
        results.totalQAsCreated += result.created || 0;
        results.totalQAsFailed += result.failed || 0;
        
        results.articleResults.push({
          articleId: article.id,
          headline: article.headline,
          success: true,
          created: result.created,
          failed: result.failed,
          hreflangGroups: result.hreflangGroups,
        });

        console.log(`[Orchestrator] ✅ Completed ${article.headline}: ${result.created} Q&As created`);

        // Delay between articles to avoid rate limits (5 seconds)
        if (i < articlesToProcess.length - 1) {
          console.log(`[Orchestrator] Waiting 5 seconds before next article...`);
          await new Promise(r => setTimeout(r, 5000));
        }

      } catch (error) {
        console.error(`[Orchestrator] Error processing ${article.headline}:`, error);
        results.articleResults.push({
          articleId: article.id,
          headline: article.headline,
          success: false,
          error: String(error),
        });
      }
    }

    // Calculate final stats
    const expectedTotal = articlesToProcess.length * 40; // 4 types × 10 languages per article

    console.log(`[Orchestrator] Complete!`);
    console.log(`[Orchestrator] Articles: ${results.completedArticles}/${results.totalArticles}`);
    console.log(`[Orchestrator] Q&As: ${results.totalQAsCreated}/${expectedTotal}`);

    return new Response(JSON.stringify({
      success: true,
      clusterId,
      dryRun,
      totalArticles: results.totalArticles,
      completedArticles: results.completedArticles,
      totalQAsCreated: results.totalQAsCreated,
      totalQAsFailed: results.totalQAsFailed,
      expectedTotal,
      completionPercent: Math.round((results.totalQAsCreated / expectedTotal) * 100),
      articleResults: results.articleResults,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Orchestrator] Error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
