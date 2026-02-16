import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish'
};

const MAX_CONTENT_LENGTH = 6000;
const REQUEST_TIMEOUT_MS = 45000;

serve(async (req) => {
  const functionStartTime = Date.now();

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { batchSize = 1, dryRun = false } = await req.json().catch(() => ({}));
    const results: any[] = [];
    const processedCount = Math.min(batchSize, 3); // Max 3 per call to stay within timeout

    for (let i = 0; i < processedCount; i++) {
      // Check if we're running low on time (reserve 10s for cleanup)
      if (Date.now() - functionStartTime > 50000) {
        console.log('Approaching timeout, stopping batch processing');
        break;
      }

      // Get next pending job (highest priority first)
      const { data: job, error: fetchError } = await supabase
        .from('cluster_translation_queue')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (fetchError || !job) {
        console.log('No more jobs in queue or error:', fetchError?.message);
        break;
      }

      console.log(`Processing job ${job.id}: ${job.target_language} for article ${job.english_article_id}`);

      if (dryRun) {
        results.push({ job: job.id, status: 'would_process', target: job.target_language });
        continue;
      }

      // Mark job as processing
      await supabase
        .from('cluster_translation_queue')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', job.id);

      // Update cluster progress to in_progress
      await supabase
        .from('cluster_completion_progress')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        })
        .eq('cluster_id', job.cluster_id)
        .in('status', ['queued', 'pending']);

      try {
        // Get the English article to translate (FULL ARTICLE)
        const { data: englishArticle, error: articleError } = await supabase
          .from('blog_articles')
          .select('*')
          .eq('id', job.english_article_id)
          .single();

        if (articleError || !englishArticle) {
          throw new Error(`English article not found: ${job.english_article_id}`);
        }

        // Check if translation already exists using correct lookup
        const hreflangGroupId = englishArticle.hreflang_group_id || englishArticle.id;
        const { data: existingArticle } = await supabase
          .from('blog_articles')
          .select('id, slug')
          .eq('hreflang_group_id', hreflangGroupId)
          .eq('language', job.target_language)
          .eq('status', 'published')
          .limit(1)
          .single();

        if (existingArticle) {
          console.log(`Translation already exists for ${job.target_language}: ${existingArticle.slug}`);
          await supabase
            .from('cluster_translation_queue')
            .update({ 
              status: 'skipped',
              completed_at: new Date().toISOString(),
              error_message: 'Translation already exists'
            })
            .eq('id', job.id);
          results.push({ job: job.id, status: 'skipped', reason: 'already_exists' });
          continue;
        }

        // Translate the FULL article
        console.log(`Translating full article (${englishArticle.detailed_content?.length || 0} chars) to ${job.target_language}`);
        const translatedArticle = await translateFullArticle(englishArticle, job.target_language, functionStartTime);

        // Insert the translated article
        const { data: newArticle, error: insertError } = await supabase
          .from('blog_articles')
          .insert({
            ...translatedArticle,
            cluster_id: job.cluster_id,
            cluster_number: englishArticle.cluster_number,
            cluster_theme: englishArticle.cluster_theme,
            hreflang_group_id: hreflangGroupId,
            status: 'published',
            date_published: new Date().toISOString(),
            date_modified: new Date().toISOString(),
            source_language: 'en'
          })
          .select('id, slug')
          .single();

        if (insertError) {
          throw new Error(`Failed to insert translation: ${insertError.message}`);
        }

        // Update English article's translations JSONB
        const updatedTranslations = {
          ...(englishArticle.translations || {}),
          [job.target_language]: newArticle.slug
        };

        await supabase
          .from('blog_articles')
          .update({ translations: updatedTranslations })
          .eq('id', englishArticle.id);

        // Mark job as completed with created article id
        await supabase
          .from('cluster_translation_queue')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            created_article_id: newArticle.id
          })
          .eq('id', job.id);

        // Update cluster progress
        await updateClusterProgress(supabase, job.cluster_id, job.target_language);

        console.log(`Successfully created ${job.target_language} translation: ${newArticle.slug}`);
        results.push({ 
          job: job.id, 
          status: 'completed', 
          articleId: newArticle.id,
          slug: newArticle.slug,
          language: job.target_language
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error processing job ${job.id}:`, errorMessage);
        
        const newRetryCount = (job.retry_count || 0) + 1;
        const isFinalFailure = newRetryCount >= (job.max_retries || 3);

        await supabase
          .from('cluster_translation_queue')
          .update({ 
            status: isFinalFailure ? 'failed' : 'pending',
            error_message: errorMessage,
            retry_count: newRetryCount
          })
          .eq('id', job.id);

        // Update error count in progress
        if (isFinalFailure) {
          const { data: progress } = await supabase
            .from('cluster_completion_progress')
            .select('error_count')
            .eq('cluster_id', job.cluster_id)
            .single();

          await supabase
            .from('cluster_completion_progress')
            .update({ 
              error_count: (progress?.error_count || 0) + 1,
              last_updated: new Date().toISOString()
            })
            .eq('cluster_id', job.cluster_id);
        }

        results.push({ 
          job: job.id, 
          status: isFinalFailure ? 'failed' : 'retry',
          error: errorMessage,
          retryCount: newRetryCount
        });
      }
    }

    // Get queue stats
    const { data: statsData } = await supabase
      .from('cluster_translation_queue')
      .select('status');
    
    const stats = { pending: 0, processing: 0, completed: 0, failed: 0, skipped: 0, total: 0 };
    statsData?.forEach(item => {
      const status = item.status as keyof typeof stats;
      if (status in stats) stats[status]++;
      stats.total++;
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
        queueStats: stats,
        message: results.length === 0 ? 'No jobs in queue' : `Processed ${results.length} jobs`,
        duration: `${((Date.now() - functionStartTime) / 1000).toFixed(1)}s`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Queue processor error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper to update cluster progress after successful translation
async function updateClusterProgress(supabase: any, clusterId: string, targetLanguage: string) {
  try {
    // Count completed translations for this language
    const { count } = await supabase
      .from('cluster_translation_queue')
      .select('*', { count: 'exact', head: true })
      .eq('cluster_id', clusterId)
      .eq('target_language', targetLanguage)
      .eq('status', 'completed');

    const { data: progress } = await supabase
      .from('cluster_completion_progress')
      .select('*')
      .eq('cluster_id', clusterId)
      .single();

    if (progress) {
      const languagesStatus = progress.languages_status || {};
      languagesStatus[targetLanguage] = {
        ...languagesStatus[targetLanguage],
        count: count || 0,
        status: 'in_progress',
        last_updated: new Date().toISOString()
      };

      await supabase
        .from('cluster_completion_progress')
        .update({
          languages_status: languagesStatus,
          translations_completed: (progress.translations_completed || 0) + 1,
          articles_completed: (progress.articles_completed || 0) + 1,
          last_updated: new Date().toISOString()
        })
        .eq('cluster_id', clusterId);
    }
  } catch (err) {
    console.warn('Failed to update cluster progress:', err);
  }
}

// Full translation function that handles chunked content
async function translateFullArticle(englishArticle: any, targetLanguage: string, functionStartTime: number) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
  const contentLength = englishArticle.detailed_content?.length || 0;

  console.log(`[translateFullArticle] Content: ${contentLength} chars, Target: ${languageName}`);

  // Translate content (chunked if needed)
  let translatedContent = englishArticle.detailed_content;
  
  if (contentLength > MAX_CONTENT_LENGTH) {
    console.log(`[translateFullArticle] Using chunked translation for ${contentLength} chars`);
    const chunks = splitContentByHeadings(englishArticle.detailed_content);
    const translatedChunks: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      // Check function timeout
      if (Date.now() - functionStartTime > 45000) {
        throw new Error(`Timeout approaching during chunk ${i + 1}/${chunks.length}`);
      }

      console.log(`[translateFullArticle] Translating chunk ${i + 1}/${chunks.length}...`);
      const translated = await translateChunk(chunks[i], languageName, apiKey);
      translatedChunks.push(translated);
    }

    translatedContent = translatedChunks.join('\n');
    console.log(`[translateFullArticle] All ${chunks.length} chunks translated`);
  }

  // Translate metadata
  const metadataPrompt = `You are a professional translator for wealth management and financial planning content.

Translate these fields from English to ${languageName}:

**Headline:** ${englishArticle.headline}
**Meta Title (max 60 chars):** ${englishArticle.meta_title}
**Meta Description (max 155 chars):** ${englishArticle.meta_description}
**Speakable Answer (50-80 words):** ${englishArticle.speakable_answer}
**Image Alt:** ${englishArticle.featured_image_alt}
**Image Caption:** ${englishArticle.featured_image_caption || ''}

${contentLength <= MAX_CONTENT_LENGTH ? `**Content (HTML - keep all tags):** ${englishArticle.detailed_content}` : ''}

RESPOND IN JSON ONLY (no markdown):
{
  "headline": "...",
  "meta_title": "... (max 60 chars)",
  "meta_description": "... (max 155 chars)",
  "speakable_answer": "...",
  "featured_image_alt": "...",
  "featured_image_caption": "..."${contentLength <= MAX_CONTENT_LENGTH ? ',\n  "detailed_content": "..."' : ''}
}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: metadataPrompt }],
        max_tokens: contentLength > MAX_CONTENT_LENGTH ? 4000 : 16000
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse translation response');
    }

    const translated = JSON.parse(jsonMatch[0]);

    // Use chunked content if we did chunked translation
    if (contentLength > MAX_CONTENT_LENGTH) {
      translated.detailed_content = translatedContent;
    }

    // Ensure length limits
    if (translated.meta_title?.length > 60) {
      translated.meta_title = translated.meta_title.substring(0, 57) + '...';
    }
    if (translated.meta_description?.length > 160) {
      translated.meta_description = translated.meta_description.substring(0, 157) + '...';
    }

    // Create slug
    const slug = translated.headline
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80);

    return {
      language: targetLanguage,
      headline: translated.headline,
      meta_title: translated.meta_title,
      meta_description: translated.meta_description,
      speakable_answer: translated.speakable_answer,
      slug: slug,
      detailed_content: translated.detailed_content || englishArticle.detailed_content,
      featured_image_url: englishArticle.featured_image_url,
      featured_image_alt: translated.featured_image_alt || translated.headline,
      featured_image_caption: translated.featured_image_caption || englishArticle.featured_image_caption,
      category: englishArticle.category,
      funnel_stage: englishArticle.funnel_stage,
      author_id: englishArticle.author_id,
      reviewer_id: englishArticle.reviewer_id,
      canonical_url: `https://www.everencewealth.com/${targetLanguage}/blog/${slug}`,
      external_citations: englishArticle.external_citations,
      internal_links: [],
      qa_entities: englishArticle.qa_entities, // Keep QA for now, could translate later
      diagram_url: englishArticle.diagram_url,
      diagram_description: englishArticle.diagram_description,
      diagram_alt: englishArticle.diagram_alt,
      diagram_caption: englishArticle.diagram_caption,
      content_type: englishArticle.content_type,
      read_time: englishArticle.read_time
    };

  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Split content by H2 headings
function splitContentByHeadings(html: string): string[] {
  if (!html || html.length < MAX_CONTENT_LENGTH) {
    return [html];
  }
  
  const parts = html.split(/(?=<h2[^>]*>)/i);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const part of parts) {
    if ((currentChunk + part).length < MAX_CONTENT_LENGTH / 2) {
      currentChunk += part;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = part;
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  
  return chunks;
}

// Translate a single chunk
async function translateChunk(chunk: string, languageName: string, apiKey: string): Promise<string> {
  const prompt = `Translate this HTML content from English to ${languageName}.
Keep ALL HTML tags exactly as-is. Only translate the text content.
Keep brand names like "Everence Wealth" unchanged.

Content:
${chunk}

Respond with ONLY the translated HTML, no explanations.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Chunk translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}
