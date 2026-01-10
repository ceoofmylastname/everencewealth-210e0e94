import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * repair-cluster-article-hreflang (v2 - English-Truth Mode)
 * 
 * STRICT FIX: Forces all non-English articles to adopt the hreflang_group_id
 * of their corresponding English sibling using deterministic positional matching.
 * 
 * Strategy:
 * 1. Sort English articles by created_at to establish stable positions (1-6)
 * 2. For each non-English language, sort articles by created_at to get same positions
 * 3. Match by position: non-English article #1 → English article #1's group_id
 * 4. Rebuild translations JSONB for all siblings in each group
 * 
 * This fixes the endless loop where non-English articles have orphaned group_ids
 * that don't match any English article, causing Q&A unification to fail repeatedly.
 */

interface Article {
  id: string;
  language: string;
  slug: string;
  headline: string;
  hreflang_group_id: string | null;
  translations: Record<string, string> | null;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clusterId, dryRun = false } = await req.json();

    if (!clusterId) {
      throw new Error('clusterId is required');
    }

    console.log(`[RepairHreflang v2] Starting for cluster ${clusterId} (dryRun: ${dryRun})`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published articles for this cluster, ordered by created_at
    const { data: allArticles, error: fetchError } = await supabase
      .from('blog_articles')
      .select('id, language, slug, headline, hreflang_group_id, translations, created_at')
      .eq('cluster_id', clusterId)
      .eq('status', 'published')
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }

    if (!allArticles || allArticles.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No published articles found in cluster',
        articlesChecked: 0,
        articlesFixed: 0,
        readyForQATranslation: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[RepairHreflang v2] Found ${allArticles.length} published articles`);

    // Separate by language and sort each by created_at for stable positional matching
    const articlesByLanguage = new Map<string, Article[]>();
    for (const article of allArticles) {
      if (!articlesByLanguage.has(article.language)) {
        articlesByLanguage.set(article.language, []);
      }
      articlesByLanguage.get(article.language)!.push(article as Article);
    }

    // Sort each language's articles by created_at (should already be sorted, but ensure)
    for (const [lang, articles] of articlesByLanguage.entries()) {
      articles.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    const englishArticles = articlesByLanguage.get('en') || [];
    
    if (englishArticles.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No English articles found - cannot establish truth source',
        articlesChecked: allArticles.length,
        articlesFixed: 0,
        readyForQATranslation: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[RepairHreflang v2] ${englishArticles.length} English articles (positions 0-${englishArticles.length - 1})`);

    // PHASE 1: Ensure all English articles have hreflang_group_id
    const englishUpdates: { id: string; hreflang_group_id: string }[] = [];
    for (const enArticle of englishArticles) {
      if (!enArticle.hreflang_group_id) {
        enArticle.hreflang_group_id = crypto.randomUUID();
        englishUpdates.push({
          id: enArticle.id,
          hreflang_group_id: enArticle.hreflang_group_id,
        });
        console.log(`[RepairHreflang v2] English article "${enArticle.slug}" assigned new group: ${enArticle.hreflang_group_id}`);
      }
    }

    // PHASE 2: Match non-English articles to English by position
    const nonEnglishUpdates: { id: string; hreflang_group_id: string; fromPosition: number }[] = [];
    const mismatchedArticles: { id: string; language: string; slug: string; currentGroupId: string | null; correctGroupId: string; position: number }[] = [];
    
    for (const [lang, langArticles] of articlesByLanguage.entries()) {
      if (lang === 'en') continue;
      
      console.log(`[RepairHreflang v2] Processing ${lang}: ${langArticles.length} articles`);
      
      for (let position = 0; position < langArticles.length; position++) {
        const langArticle = langArticles[position];
        
        // Match to English article at same position (if exists)
        if (position < englishArticles.length) {
          const correctEnglishArticle = englishArticles[position];
          const correctGroupId = correctEnglishArticle.hreflang_group_id!;
          
          if (langArticle.hreflang_group_id !== correctGroupId) {
            mismatchedArticles.push({
              id: langArticle.id,
              language: lang,
              slug: langArticle.slug,
              currentGroupId: langArticle.hreflang_group_id,
              correctGroupId,
              position,
            });
            
            nonEnglishUpdates.push({
              id: langArticle.id,
              hreflang_group_id: correctGroupId,
              fromPosition: position,
            });
          }
        } else {
          console.warn(`[RepairHreflang v2] ${lang} article at position ${position} has no English counterpart`);
        }
      }
    }

    console.log(`[RepairHreflang v2] ${mismatchedArticles.length} non-English articles need group reassignment`);

    // Language counts for summary
    const languageArticleCounts: Record<string, number> = {};
    for (const [lang, articles] of articlesByLanguage.entries()) {
      languageArticleCounts[lang] = articles.length;
    }

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        message: `Would fix ${englishUpdates.length} English articles and ${nonEnglishUpdates.length} non-English articles`,
        articlesChecked: allArticles.length,
        englishToFix: englishUpdates.length,
        nonEnglishToFix: nonEnglishUpdates.length,
        languageArticleCounts,
        mismatchedArticles: mismatchedArticles.slice(0, 20),
        readyForQATranslation: englishArticles.length >= 6,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PHASE 3: Apply English article updates
    let englishFixed = 0;
    for (const update of englishUpdates) {
      const { error: updateError } = await supabase
        .from('blog_articles')
        .update({ hreflang_group_id: update.hreflang_group_id })
        .eq('id', update.id);

      if (updateError) {
        console.error(`[RepairHreflang v2] Error updating English article ${update.id}:`, updateError);
      } else {
        englishFixed++;
      }
    }

    // PHASE 4: Apply non-English article updates
    let nonEnglishFixed = 0;
    for (const update of nonEnglishUpdates) {
      const { error: updateError } = await supabase
        .from('blog_articles')
        .update({ hreflang_group_id: update.hreflang_group_id })
        .eq('id', update.id);

      if (updateError) {
        console.error(`[RepairHreflang v2] Error updating article ${update.id}:`, updateError);
      } else {
        nonEnglishFixed++;
      }
    }

    console.log(`[RepairHreflang v2] Fixed ${englishFixed} English + ${nonEnglishFixed} non-English articles`);

    // PHASE 5: Rebuild translations JSONB for all groups
    // Refetch articles to get updated hreflang_group_ids
    const { data: updatedArticles, error: refetchError } = await supabase
      .from('blog_articles')
      .select('id, language, slug, hreflang_group_id')
      .eq('cluster_id', clusterId)
      .eq('status', 'published');

    if (refetchError) {
      console.error('[RepairHreflang v2] Error refetching articles:', refetchError);
    }

    // Group by hreflang_group_id
    const articlesByGroup = new Map<string, { id: string; language: string; slug: string }[]>();
    for (const article of (updatedArticles || [])) {
      if (article.hreflang_group_id) {
        if (!articlesByGroup.has(article.hreflang_group_id)) {
          articlesByGroup.set(article.hreflang_group_id, []);
        }
        articlesByGroup.get(article.hreflang_group_id)!.push(article);
      }
    }

    // Rebuild translations for each group
    let translationsRebuilt = 0;
    for (const [groupId, groupArticles] of articlesByGroup.entries()) {
      const translations: Record<string, string> = {};
      for (const article of groupArticles) {
        translations[article.language] = article.slug;
      }

      for (const article of groupArticles) {
        const { error: updateError } = await supabase
          .from('blog_articles')
          .update({ translations })
          .eq('id', article.id);

        if (!updateError) {
          translationsRebuilt++;
        }
      }
    }

    console.log(`[RepairHreflang v2] Rebuilt translations for ${translationsRebuilt} articles across ${articlesByGroup.size} groups`);

    const totalFixed = englishFixed + nonEnglishFixed;
    
    return new Response(JSON.stringify({
      success: true,
      message: `Fixed ${totalFixed} articles (${englishFixed} English, ${nonEnglishFixed} non-English) using positional matching`,
      articlesChecked: allArticles.length,
      articlesFixed: totalFixed,
      englishFixed,
      nonEnglishFixed,
      translationsRebuilt,
      groupsUpdated: articlesByGroup.size,
      languageArticleCounts,
      readyForQATranslation: englishArticles.length >= 6,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[RepairHreflang v2] Fatal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
