import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const TARGET_LANGUAGES = ['es'];

const LANGUAGE_INFO: Record<string, { name: string; flag: string }> = {
  'en': { name: 'English', flag: '🇺🇸' },
  'es': { name: 'Spanish', flag: '🇪🇸' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { clusterId, targetLanguage, forceRegenerate = false } = await req.json();

    if (!clusterId) {
      throw new Error('clusterId is required');
    }

    if (!targetLanguage || !TARGET_LANGUAGES.includes(targetLanguage)) {
      throw new Error(`targetLanguage must be one of: ${TARGET_LANGUAGES.join(', ')}`);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const langInfo = LANGUAGE_INFO[targetLanguage];

    console.log(`[translate-cluster-to-language] Enqueuing translation jobs for cluster ${clusterId} to ${langInfo.name} (${langInfo.flag})`);

    // Step 1: Get all English articles in the cluster
    const { data: englishArticles, error: fetchError } = await supabase
      .from('blog_articles')
      .select('id, headline, hreflang_group_id, cluster_theme, detailed_content')
      .eq('cluster_id', clusterId)
      .eq('language', 'en')
      .eq('status', 'published')
      .order('cluster_number', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch English articles: ${fetchError.message}`);
    }

    if (!englishArticles || englishArticles.length === 0) {
      throw new Error(`No English articles found in cluster ${clusterId}`);
    }

    console.log(`[translate-cluster-to-language] Found ${englishArticles.length} English articles`);

    // Step 2: Check which translations already exist
    const { data: existingTranslations, error: existingError } = await supabase
      .from('blog_articles')
      .select('id, hreflang_group_id, headline')
      .eq('cluster_id', clusterId)
      .eq('language', targetLanguage)
      .eq('status', 'published');

    if (existingError) {
      console.warn(`[translate-cluster-to-language] Warning checking existing translations: ${existingError.message}`);
    }

    const existingHreflangGroups = new Set(
      (existingTranslations || []).map(t => t.hreflang_group_id).filter(Boolean)
    );

    console.log(`[translate-cluster-to-language] Found ${existingHreflangGroups.size} existing ${targetLanguage} translations`);

    // Step 3: Filter articles that need translation
    const articlesToTranslate = forceRegenerate 
      ? englishArticles 
      : englishArticles.filter(article => {
          // Check both hreflang_group_id AND article id (for articles that are their own hreflang group)
          const groupId = article.hreflang_group_id || article.id;
          return !existingHreflangGroups.has(groupId);
        });

    if (articlesToTranslate.length === 0) {
      console.log(`[translate-cluster-to-language] All articles already translated to ${targetLanguage}`);
      return new Response(
        JSON.stringify({
          success: true,
          mode: 'queue',
          clusterId,
          targetLanguage,
          languageName: langInfo.name,
          languageFlag: langInfo.flag,
          jobsCreated: 0,
          jobsSkipped: englishArticles.length,
          message: `All ${englishArticles.length} articles already translated to ${langInfo.name}`,
          duration: `${((Date.now() - startTime) / 1000).toFixed(1)} seconds`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[translate-cluster-to-language] Will enqueue ${articlesToTranslate.length} translation jobs`);

    // Step 4: Create queue jobs for each article
    const jobsToCreate = articlesToTranslate.map((article, index) => ({
      cluster_id: clusterId,
      english_article_id: article.id,
      target_language: targetLanguage,
      status: 'pending',
      priority: 10 - index, // Higher priority for earlier articles
      retry_count: 0,
      max_retries: 3,
      created_at: new Date().toISOString()
    }));

    // Delete any existing pending/failed jobs for same cluster+language to avoid duplicates
    await supabase
      .from('cluster_translation_queue')
      .delete()
      .eq('cluster_id', clusterId)
      .eq('target_language', targetLanguage)
      .in('status', ['pending', 'failed']);

    const { data: insertedJobs, error: insertError } = await supabase
      .from('cluster_translation_queue')
      .insert(jobsToCreate)
      .select('id');

    if (insertError) {
      throw new Error(`Failed to create queue jobs: ${insertError.message}`);
    }

    console.log(`[translate-cluster-to-language] ✅ Created ${insertedJobs?.length || 0} queue jobs`);

    // Step 5: Update or create cluster progress tracking
    const clusterTheme = englishArticles[0]?.cluster_theme || 'Unknown';
    
    const { data: existingProgress } = await supabase
      .from('cluster_completion_progress')
      .select('*')
      .eq('cluster_id', clusterId)
      .single();

    const languagesStatus = existingProgress?.languages_status || {};
    languagesStatus[targetLanguage] = {
      count: existingHreflangGroups.size,
      queued: articlesToTranslate.length,
      completed: false,
      status: 'queued',
      queued_at: new Date().toISOString()
    };

    if (existingProgress) {
      await supabase
        .from('cluster_completion_progress')
        .update({
          languages_status: languagesStatus,
          status: 'queued',
          last_updated: new Date().toISOString()
        })
        .eq('cluster_id', clusterId);
    } else {
      await supabase
        .from('cluster_completion_progress')
        .insert({
          cluster_id: clusterId,
          cluster_theme: clusterTheme,
          status: 'queued',
          tier: 'tier1',
          english_articles: englishArticles.length,
          total_articles_needed: englishArticles.length * 10,
          translations_completed: existingHreflangGroups.size,
          articles_completed: englishArticles.length + existingHreflangGroups.size,
          languages_status: languagesStatus,
          started_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const skippedCount = englishArticles.length - articlesToTranslate.length;

    return new Response(
      JSON.stringify({
        success: true,
        mode: 'queue',
        clusterId,
        targetLanguage,
        languageName: langInfo.name,
        languageFlag: langInfo.flag,
        jobsCreated: insertedJobs?.length || 0,
        jobsSkipped: skippedCount,
        totalEnglishArticles: englishArticles.length,
        message: `Created ${insertedJobs?.length || 0} translation jobs. Use Translation Queue to process.`,
        queueUrl: '/admin/translation-queue',
        duration: `${duration} seconds`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[translate-cluster-to-language] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        duration: `${((Date.now() - startTime) / 1000).toFixed(1)} seconds`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
