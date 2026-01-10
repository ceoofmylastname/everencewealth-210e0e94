import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * repair-cluster-qa-article-linking
 * 
 * Purpose: Fix Q&As that are attached to the WRONG target-language article.
 * This happens when fallback logic or earlier bugs assigned Q&As incorrectly.
 * 
 * The correct mapping is:
 * 1. English Q&A has source_article_id = English article
 * 2. English article has hreflang_group_id = X
 * 3. Target-language article has hreflang_group_id = X
 * 4. Target-language Q&A should have source_article_id = that target-language article
 * 
 * This function:
 * 1. Fetches all Q&As for the cluster
 * 2. Fetches all articles with their hreflang_group_id
 * 3. For each target-language Q&A, verifies its source_article_id is correct
 * 4. If wrong, updates to the correct article (matching hreflang_group_id)
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clusterId, targetLanguage, dryRun = false } = await req.json();

    if (!clusterId) {
      throw new Error('clusterId is required');
    }

    console.log(`[RepairQALinking] Starting Q&A → Article linking repair for cluster ${clusterId}${targetLanguage ? ` (${targetLanguage} only)` : ''} (dryRun: ${dryRun})`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published articles for this cluster
    const { data: allArticles, error: articleError } = await supabase
      .from('blog_articles')
      .select('id, language, slug, hreflang_group_id')
      .eq('cluster_id', clusterId)
      .eq('status', 'published');

    if (articleError) {
      throw new Error(`Failed to fetch articles: ${articleError.message}`);
    }

    if (!allArticles || allArticles.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No published articles found in cluster',
        articlesChecked: 0,
        qasFixed: 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[RepairQALinking] Found ${allArticles.length} published articles`);

    // Build lookup maps
    // Map: hreflang_group_id -> { language -> article_id }
    const articlesByHreflangAndLang = new Map<string, Map<string, string>>();
    // Map: article_id -> hreflang_group_id
    const articleHreflangMap = new Map<string, string>();
    // Map: article_id -> language
    const articleLanguageMap = new Map<string, string>();

    for (const article of allArticles) {
      if (!article.hreflang_group_id) continue;
      
      articleHreflangMap.set(article.id, article.hreflang_group_id);
      articleLanguageMap.set(article.id, article.language);

      if (!articlesByHreflangAndLang.has(article.hreflang_group_id)) {
        articlesByHreflangAndLang.set(article.hreflang_group_id, new Map());
      }
      articlesByHreflangAndLang.get(article.hreflang_group_id)!.set(article.language, article.id);
    }

    // Fetch all Q&As for this cluster
    let qaQuery = supabase
      .from('qa_pages')
      .select('id, language, qa_type, source_article_id, hreflang_group_id, slug')
      .eq('cluster_id', clusterId);

    if (targetLanguage) {
      qaQuery = qaQuery.eq('language', targetLanguage);
    }

    const { data: allQAs, error: qaError } = await qaQuery;

    if (qaError) {
      throw new Error(`Failed to fetch Q&As: ${qaError.message}`);
    }

    if (!allQAs || allQAs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No Q&As found in cluster',
        qasChecked: 0,
        qasFixed: 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[RepairQALinking] Found ${allQAs.length} Q&As to check`);

    // Find English Q&As to build authoritative mapping
    // Map: hreflang_group_id -> English source_article_id
    const englishQASourceByGroup = new Map<string, string>();
    for (const qa of allQAs) {
      if (qa.language === 'en' && qa.hreflang_group_id && qa.source_article_id) {
        englishQASourceByGroup.set(qa.hreflang_group_id, qa.source_article_id);
      }
    }

    // Check each non-English Q&A
    const fixes: { qaId: string; currentArticleId: string; correctArticleId: string; language: string; qaType: string }[] = [];
    const conflicts: { qaId: string; reason: string }[] = [];
    const skipped: { qaId: string; reason: string }[] = [];

    for (const qa of allQAs) {
      // Skip English Q&As - they're the source of truth
      if (qa.language === 'en') continue;

      // Skip if no hreflang_group_id
      if (!qa.hreflang_group_id) {
        skipped.push({ qaId: qa.id, reason: 'No hreflang_group_id' });
        continue;
      }

      // Find the English Q&A's source article for this group
      const englishSourceArticleId = englishQASourceByGroup.get(qa.hreflang_group_id);
      if (!englishSourceArticleId) {
        skipped.push({ qaId: qa.id, reason: 'No English Q&A found for hreflang group' });
        continue;
      }

      // Get the hreflang_group_id of the English article
      const englishArticleHreflang = articleHreflangMap.get(englishSourceArticleId);
      if (!englishArticleHreflang) {
        skipped.push({ qaId: qa.id, reason: 'English source article has no hreflang_group_id' });
        continue;
      }

      // Find the correct target-language article
      const langArticleMap = articlesByHreflangAndLang.get(englishArticleHreflang);
      if (!langArticleMap) {
        skipped.push({ qaId: qa.id, reason: `No articles found in hreflang group ${englishArticleHreflang}` });
        continue;
      }

      const correctArticleId = langArticleMap.get(qa.language);
      if (!correctArticleId) {
        skipped.push({ qaId: qa.id, reason: `No ${qa.language} article in hreflang group` });
        continue;
      }

      // Check if current source_article_id is correct
      if (qa.source_article_id !== correctArticleId) {
        // Check if moving would cause a conflict (duplicate qa_type for same article)
        const wouldConflict = allQAs.some(other => 
          other.id !== qa.id &&
          other.source_article_id === correctArticleId &&
          other.qa_type === qa.qa_type &&
          other.language === qa.language
        );

        if (wouldConflict) {
          conflicts.push({ 
            qaId: qa.id, 
            reason: `Would create duplicate ${qa.qa_type} for article ${correctArticleId}` 
          });
          continue;
        }

        fixes.push({
          qaId: qa.id,
          currentArticleId: qa.source_article_id,
          correctArticleId,
          language: qa.language,
          qaType: qa.qa_type,
        });
      }
    }

    console.log(`[RepairQALinking] Analysis: ${fixes.length} fixes needed, ${conflicts.length} conflicts, ${skipped.length} skipped`);

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        message: `Would fix ${fixes.length} Q&A → Article links`,
        qasChecked: allQAs.length,
        qasToFix: fixes.length,
        conflicts: conflicts.length > 0 ? conflicts.slice(0, 10) : undefined,
        skipped: skipped.length,
        preview: fixes.slice(0, 20).map(f => ({
          qaId: f.qaId,
          language: f.language,
          qaType: f.qaType,
          from: f.currentArticleId.substring(0, 8) + '...',
          to: f.correctArticleId.substring(0, 8) + '...',
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Apply fixes
    let fixedCount = 0;
    const errors: string[] = [];

    for (const fix of fixes) {
      const { error: updateError } = await supabase
        .from('qa_pages')
        .update({
          source_article_id: fix.correctArticleId,
        })
        .eq('id', fix.qaId);

      if (updateError) {
        console.error(`[RepairQALinking] Error fixing ${fix.qaId}:`, updateError);
        errors.push(`${fix.qaId}: ${updateError.message}`);
      } else {
        fixedCount++;
        console.log(`[RepairQALinking] ✅ Fixed ${fix.qaType} (${fix.language}): ${fix.currentArticleId.substring(0, 8)} → ${fix.correctArticleId.substring(0, 8)}`);
      }
    }

    console.log(`[RepairQALinking] ✅ Fixed ${fixedCount}/${fixes.length} Q&A links`);

    return new Response(JSON.stringify({
      success: errors.length === 0,
      message: `Fixed ${fixedCount} Q&A → Article links`,
      qasChecked: allQAs.length,
      qasFixed: fixedCount,
      conflicts: conflicts.length > 0 ? conflicts.slice(0, 10) : undefined,
      skipped: skipped.length,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[RepairQALinking] Fatal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
