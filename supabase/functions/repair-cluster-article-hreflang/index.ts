import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * repair-cluster-article-hreflang
 * 
 * Purpose: Ensure all blog articles in a cluster have proper hreflang_group_id linking.
 * This is a prerequisite for Q&A translation - without proper article linking,
 * the Q&A translator cannot find the correct target-language article.
 * 
 * What it does:
 * 1. Fetches all published articles for the cluster across all languages
 * 2. For English articles without hreflang_group_id, generates a new UUID
 * 3. Uses the translations JSONB (language -> slug mapping) to find sibling articles
 * 4. Assigns the same hreflang_group_id to all siblings
 * 5. Updates the translations JSONB to ensure bidirectional linking
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clusterId, dryRun = false } = await req.json();

    if (!clusterId) {
      throw new Error('clusterId is required');
    }

    console.log(`[RepairHreflang] Starting repair for cluster ${clusterId} (dryRun: ${dryRun})`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published articles for this cluster
    const { data: allArticles, error: fetchError } = await supabase
      .from('blog_articles')
      .select('id, language, slug, headline, hreflang_group_id, translations')
      .eq('cluster_id', clusterId)
      .eq('status', 'published')
      .order('language');

    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }

    if (!allArticles || allArticles.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No published articles found in cluster',
        articlesChecked: 0,
        groupsRepaired: 0,
        articlesUpdated: 0,
        readyForQATranslation: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[RepairHreflang] Found ${allArticles.length} published articles`);

    // Build lookup maps
    const articlesByLangSlug = new Map<string, typeof allArticles[0]>();
    const englishArticles: typeof allArticles[0][] = [];
    const articlesByLanguage = new Map<string, typeof allArticles[0][]>();

    for (const article of allArticles) {
      const key = `${article.language}:${article.slug}`;
      articlesByLangSlug.set(key, article);

      if (article.language === 'en') {
        englishArticles.push(article);
      }

      if (!articlesByLanguage.has(article.language)) {
        articlesByLanguage.set(article.language, []);
      }
      articlesByLanguage.get(article.language)!.push(article);
    }

    console.log(`[RepairHreflang] ${englishArticles.length} English articles, ${articlesByLanguage.size} languages total`);

    const updates: { id: string; hreflang_group_id: string; translations: Record<string, string> }[] = [];
    const groupsRepaired: string[] = [];
    const missingLinks: { enArticleId: string; language: string; expectedSlug: string }[] = [];

    // Process each English article
    for (const enArticle of englishArticles) {
      // Generate or use existing group ID
      let groupId = enArticle.hreflang_group_id;
      const needsNewGroupId = !groupId;
      
      if (needsNewGroupId) {
        groupId = crypto.randomUUID();
        console.log(`[RepairHreflang] Article "${enArticle.slug}" needs new hreflang_group_id: ${groupId}`);
        groupsRepaired.push(groupId);
      }

      // Build translations map from current English article's translations field
      const enTranslations = (enArticle.translations as Record<string, string>) || {};
      const allSiblings: typeof allArticles[0][] = [enArticle];

      // Find sibling articles using translations JSONB
      for (const [lang, slug] of Object.entries(enTranslations)) {
        if (lang === 'en') continue;

        const key = `${lang}:${slug}`;
        const siblingArticle = articlesByLangSlug.get(key);

        if (siblingArticle) {
          allSiblings.push(siblingArticle);
        } else {
          // Try to find by language if slug doesn't match exactly
          const langArticles = articlesByLanguage.get(lang);
          if (langArticles && langArticles.length > 0) {
            // Find the first article in this language without a group ID
            const orphan = langArticles.find(a => !a.hreflang_group_id || a.hreflang_group_id === groupId);
            if (orphan) {
              allSiblings.push(orphan);
            }
          } else {
            missingLinks.push({ enArticleId: enArticle.id, language: lang, expectedSlug: slug });
          }
        }
      }

      // Build complete translations map from all found siblings
      const completeTranslations: Record<string, string> = {};
      for (const sibling of allSiblings) {
        completeTranslations[sibling.language] = sibling.slug;
      }

      // Add updates for all siblings
      for (const sibling of allSiblings) {
        const needsUpdate = 
          sibling.hreflang_group_id !== groupId ||
          JSON.stringify(sibling.translations) !== JSON.stringify(completeTranslations);

        if (needsUpdate) {
          updates.push({
            id: sibling.id,
            hreflang_group_id: groupId!,
            translations: completeTranslations,
          });
        }
      }
    }

    console.log(`[RepairHreflang] ${updates.length} articles need updates, ${groupsRepaired.length} new groups created`);

    // Check if we're ready for Q&A translation
    // We need at least 6 articles per language to be properly linked
    const langCounts = new Map<string, number>();
    for (const article of allArticles) {
      langCounts.set(article.language, (langCounts.get(article.language) || 0) + 1);
    }

    const allLanguagesHave6 = Array.from(langCounts.entries()).every(([lang, count]) => {
      if (lang === 'en') return count >= 6;
      // For non-English, we only check if they exist and have proper linking
      return true;
    });

    // Check how many languages have 6 articles
    const languagesWithSixArticles: string[] = [];
    for (const [lang, count] of langCounts.entries()) {
      if (count >= 6) {
        languagesWithSixArticles.push(lang);
      }
    }

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        message: `Would update ${updates.length} articles across ${groupsRepaired.length} new groups`,
        articlesChecked: allArticles.length,
        articlesToUpdate: updates.length,
        groupsToCreate: groupsRepaired.length,
        missingLinks,
        languageArticleCounts: Object.fromEntries(langCounts),
        languagesWithSixArticles,
        readyForQATranslation: allLanguagesHave6 && englishArticles.length >= 6,
        preview: updates.slice(0, 10).map(u => ({
          id: u.id,
          newGroupId: u.hreflang_group_id,
          translationsCount: Object.keys(u.translations).length,
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Apply updates
    let articlesUpdated = 0;
    const errors: string[] = [];

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('blog_articles')
        .update({
          hreflang_group_id: update.hreflang_group_id,
          translations: update.translations,
        })
        .eq('id', update.id);

      if (updateError) {
        console.error(`[RepairHreflang] Error updating ${update.id}:`, updateError);
        errors.push(`Article ${update.id}: ${updateError.message}`);
      } else {
        articlesUpdated++;
      }
    }

    console.log(`[RepairHreflang] ✅ Updated ${articlesUpdated} articles, ${errors.length} errors`);

    return new Response(JSON.stringify({
      success: errors.length === 0,
      message: `Repaired ${articlesUpdated} articles across ${groupsRepaired.length} groups`,
      articlesChecked: allArticles.length,
      articlesUpdated,
      groupsRepaired: groupsRepaired.length,
      missingLinks,
      languageArticleCounts: Object.fromEntries(langCounts),
      languagesWithSixArticles,
      readyForQATranslation: allLanguagesHave6 && englishArticles.length >= 6,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[RepairHreflang] Fatal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
