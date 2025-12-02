import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClusterGroup {
  cluster_id?: string;
  cluster_theme?: string;
  articles: Array<{
    id: string;
    slug: string;
    language: string;
    headline: string;
    cluster_id?: string;
    cluster_theme?: string;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Starting translation auto-linking...');

    // Fetch all published articles with minimal data
    const { data: articles, error: fetchError } = await supabase
      .from('blog_articles')
      .select('id, slug, language, headline, cluster_id, cluster_theme, translations')
      .eq('status', 'published');

    if (fetchError) throw fetchError;

    console.log(`📊 Found ${articles.length} published articles`);

    // Group articles by cluster_id or cluster_theme
    const clusters = new Map<string, ClusterGroup>();

    for (const article of articles) {
      const key = article.cluster_id || article.cluster_theme || 'orphan';
      
      if (!clusters.has(key)) {
        clusters.set(key, {
          cluster_id: article.cluster_id,
          cluster_theme: article.cluster_theme,
          articles: []
        });
      }

      clusters.get(key)!.articles.push(article);
    }

    console.log(`🗂️  Grouped into ${clusters.size} clusters`);

    // Process each cluster to link translations
    const updates: Array<{ id: string; translations: Record<string, string> }> = [];
    let linkedCount = 0;

    for (const [clusterKey, cluster] of clusters.entries()) {
      if (cluster.articles.length <= 1) {
        console.log(`⏭️  Skipping cluster "${clusterKey}" (only 1 article)`);
        continue;
      }

      console.log(`🔗 Processing cluster "${clusterKey}" with ${cluster.articles.length} articles`);

      // For each article in the cluster, link all other articles as translations
      for (const article of cluster.articles) {
        const translations: Record<string, string> = {};

        // Add all sibling articles in different languages
        for (const sibling of cluster.articles) {
          if (sibling.id !== article.id && sibling.language !== article.language) {
            translations[sibling.language] = sibling.slug;
          }
        }

        if (Object.keys(translations).length > 0) {
          updates.push({
            id: article.id,
            translations
          });
          linkedCount++;
        }
      }
    }

    console.log(`💾 Preparing to update ${updates.length} articles with translations`);

    // Batch update articles (in chunks of 100)
    const chunkSize = 100;
    let processedChunks = 0;

    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      
      // Update each article in the chunk
      for (const update of chunk) {
        const { error: updateError } = await supabase
          .from('blog_articles')
          .update({ translations: update.translations })
          .eq('id', update.id);

        if (updateError) {
          console.error(`❌ Failed to update article ${update.id}:`, updateError);
        }
      }

      processedChunks++;
      console.log(`✅ Processed chunk ${processedChunks}/${Math.ceil(updates.length / chunkSize)}`);
    }

    console.log(`✨ Auto-linking complete! Linked ${linkedCount} articles across ${clusters.size} clusters`);

    return new Response(
      JSON.stringify({
        success: true,
        totalArticles: articles.length,
        clustersProcessed: clusters.size,
        articlesLinked: linkedCount,
        updatesApplied: updates.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Auto-linking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
