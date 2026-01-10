import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * repair-cluster-qa-hreflang-unification (v2 - Article Prerequisite Check)
 * 
 * Purpose: Unify "orphaned" non-English Q&As with their correct English counterparts.
 * 
 * KEY IMPROVEMENT: Now returns explicit diagnostic when articles aren't properly linked,
 * guiding users to run "Fix Article Linking" FIRST before attempting Q&A unification.
 * 
 * Matching Strategy:
 * 1. Get each Q&A's source article's hreflang_group_id
 * 2. Find the English article with the same hreflang_group_id  
 * 3. Find the English Q&A linked to that article with the same qa_type
 * 4. Update the non-English Q&A to share the English Q&A's hreflang_group_id
 */

interface QAPage {
  id: string;
  language: string;
  slug: string;
  qa_type: string;
  source_article_id: string;
  hreflang_group_id: string | null;
  translations: Record<string, string> | null;
}

interface Article {
  id: string;
  language: string;
  slug: string;
  hreflang_group_id: string | null;
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

    console.log(`[QAUnification v2] Starting for cluster ${clusterId} (dryRun: ${dryRun})`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all Q&As for this cluster
    const { data: allQAs, error: qaError } = await supabase
      .from('qa_pages')
      .select('id, language, slug, qa_type, source_article_id, hreflang_group_id, translations, status')
      .eq('cluster_id', clusterId);

    if (qaError) {
      throw new Error(`Failed to fetch Q&As: ${qaError.message}`);
    }

    // Filter to only published/draft (non-archived status if any)
    const activeQAs = (allQAs || []).filter(qa => qa.status !== 'archived');

    if (activeQAs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No Q&As found in cluster',
        orphansFound: 0,
        unified: 0,
        articleLinkingRequired: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[QAUnification v2] Found ${activeQAs.length} active Q&As`);

    // Fetch all articles to get their hreflang mappings
    const { data: allArticles, error: articleError } = await supabase
      .from('blog_articles')
      .select('id, language, slug, hreflang_group_id')
      .eq('cluster_id', clusterId)
      .eq('status', 'published');

    if (articleError) {
      throw new Error(`Failed to fetch articles: ${articleError.message}`);
    }

    // Build article lookups
    const articlesById = new Map<string, Article>();
    const englishArticlesByGroup = new Map<string, Article>();
    const englishArticleGroupIds = new Set<string>();
    
    for (const article of (allArticles || [])) {
      articlesById.set(article.id, article as Article);
      
      if (article.language === 'en' && article.hreflang_group_id) {
        englishArticlesByGroup.set(article.hreflang_group_id, article as Article);
        englishArticleGroupIds.add(article.hreflang_group_id);
      }
    }

    // PREREQUISITE CHECK: Are non-English articles properly linked to English group IDs?
    const nonEnglishArticles = (allArticles || []).filter(a => a.language !== 'en');
    const articlesWithBadGroups = nonEnglishArticles.filter(a => 
      !a.hreflang_group_id || !englishArticleGroupIds.has(a.hreflang_group_id)
    );

    if (articlesWithBadGroups.length > 0) {
      const uniqueBadGroups = new Set(articlesWithBadGroups.map(a => a.hreflang_group_id).filter(Boolean));
      console.log(`[QAUnification v2] BLOCKED: ${articlesWithBadGroups.length} articles have group IDs not in English set`);
      
      return new Response(JSON.stringify({
        success: false,
        articleLinkingRequired: true,
        message: `Cannot unify Q&As: ${articlesWithBadGroups.length} articles have mismatched hreflang groups. Run "Fix Article Linking" first.`,
        articlesWithBadGroups: articlesWithBadGroups.length,
        badGroupIds: Array.from(uniqueBadGroups).slice(0, 10),
        affectedLanguages: [...new Set(articlesWithBadGroups.map(a => a.language))],
        orphansFound: 0,
        unified: 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Separate English and non-English Q&As
    const englishQAs = activeQAs.filter(qa => qa.language === 'en') as QAPage[];
    const nonEnglishQAs = activeQAs.filter(qa => qa.language !== 'en') as QAPage[];

    console.log(`[QAUnification v2] ${englishQAs.length} English Q&As, ${nonEnglishQAs.length} non-English Q&As`);

    // Build English Q&A lookup by (article_hreflang_group + qa_type)
    // This is the canonical source of truth
    const englishQAByArticleGroupAndType = new Map<string, QAPage>();
    const englishQAGroupIds = new Set<string>();
    
    for (const enQA of englishQAs) {
      const sourceArticle = articlesById.get(enQA.source_article_id);
      if (sourceArticle?.hreflang_group_id && enQA.hreflang_group_id) {
        const key = `${sourceArticle.hreflang_group_id}:${enQA.qa_type}`;
        englishQAByArticleGroupAndType.set(key, enQA);
        englishQAGroupIds.add(enQA.hreflang_group_id);
      }
    }

    // Find orphaned Q&As and categorize them
    const orphans: { qa: QAPage; correctEnglishQA: QAPage; correctGroupId: string }[] = [];
    const alreadyCorrect: QAPage[] = [];
    const noMatchFound: { qa: QAPage; reason: string }[] = [];

    for (const nonEnQA of nonEnglishQAs) {
      const sourceArticle = articlesById.get(nonEnQA.source_article_id);
      
      if (!sourceArticle) {
        noMatchFound.push({ qa: nonEnQA, reason: 'source_article_not_found' });
        continue;
      }

      if (!sourceArticle.hreflang_group_id) {
        noMatchFound.push({ qa: nonEnQA, reason: 'source_article_no_group' });
        continue;
      }

      // Find the English Q&A that should be this Q&A's counterpart
      const key = `${sourceArticle.hreflang_group_id}:${nonEnQA.qa_type}`;
      const correctEnglishQA = englishQAByArticleGroupAndType.get(key);

      if (!correctEnglishQA) {
        noMatchFound.push({ qa: nonEnQA, reason: 'no_english_qa_for_type' });
        continue;
      }

      if (!correctEnglishQA.hreflang_group_id) {
        noMatchFound.push({ qa: nonEnQA, reason: 'english_qa_no_group' });
        continue;
      }

      // Check if already correctly linked
      if (nonEnQA.hreflang_group_id === correctEnglishQA.hreflang_group_id) {
        alreadyCorrect.push(nonEnQA);
      } else {
        orphans.push({
          qa: nonEnQA,
          correctEnglishQA,
          correctGroupId: correctEnglishQA.hreflang_group_id,
        });
      }
    }

    console.log(`[QAUnification v2] ${orphans.length} orphaned, ${alreadyCorrect.length} correct, ${noMatchFound.length} no match`);

    // Aggregate no-match reasons
    const noMatchReasons: Record<string, number> = {};
    for (const { reason } of noMatchFound) {
      noMatchReasons[reason] = (noMatchReasons[reason] || 0) + 1;
    }

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        articleLinkingRequired: false,
        message: `Found ${orphans.length} orphaned Q&As to unify`,
        totalQAs: activeQAs.length,
        englishQAs: englishQAs.length,
        nonEnglishQAs: nonEnglishQAs.length,
        orphansFound: orphans.length,
        alreadyCorrect: alreadyCorrect.length,
        noMatchFound: noMatchFound.length,
        noMatchReasons,
        groupsAffected: new Set(orphans.map(o => o.correctGroupId)).size,
        preview: orphans.slice(0, 20).map(o => ({
          qaId: o.qa.id,
          language: o.qa.language,
          qaType: o.qa.qa_type,
          currentGroupId: o.qa.hreflang_group_id,
          correctGroupId: o.correctGroupId,
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Apply fixes
    let unified = 0;
    const errors: string[] = [];

    for (const orphan of orphans) {
      const { error: updateError } = await supabase
        .from('qa_pages')
        .update({ hreflang_group_id: orphan.correctGroupId })
        .eq('id', orphan.qa.id);

      if (updateError) {
        console.error(`[QAUnification v2] Error updating ${orphan.qa.id}:`, updateError);
        errors.push(`${orphan.qa.id}: ${updateError.message}`);
      } else {
        unified++;
      }
    }

    console.log(`[QAUnification v2] Unified ${unified} orphaned Q&As`);

    // Rebuild translations JSONB for affected groups
    const affectedGroupIds = new Set(orphans.map(o => o.correctGroupId));
    
    let translationsRebuilt = 0;
    for (const groupId of affectedGroupIds) {
      const { data: groupQAs, error: groupError } = await supabase
        .from('qa_pages')
        .select('id, language, slug')
        .eq('hreflang_group_id', groupId);

      if (groupError || !groupQAs) continue;

      const translations: Record<string, string> = {};
      for (const qa of groupQAs) {
        translations[qa.language] = qa.slug;
      }

      for (const qa of groupQAs) {
        const { error: updateError } = await supabase
          .from('qa_pages')
          .update({ translations })
          .eq('id', qa.id);

        if (!updateError) translationsRebuilt++;
      }
    }

    console.log(`[QAUnification v2] Rebuilt translations for ${translationsRebuilt} Q&As`);

    return new Response(JSON.stringify({
      success: errors.length === 0,
      articleLinkingRequired: false,
      message: `Unified ${unified} orphaned Q&As across ${affectedGroupIds.size} groups`,
      totalQAs: activeQAs.length,
      orphansFound: orphans.length,
      unified,
      translationsRebuilt,
      groupsAffected: affectedGroupIds.size,
      alreadyCorrect: alreadyCorrect.length,
      noMatchFound: noMatchFound.length,
      noMatchReasons,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[QAUnification v2] Fatal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
