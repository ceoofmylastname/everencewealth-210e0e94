import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// Declare EdgeRuntime for TypeScript
declare const EdgeRuntime: { waitUntil: (promise: Promise<unknown>) => void };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPECTED_STRUCTURE = [
  { funnelStage: 'TOFU', count: 3 },
  { funnelStage: 'MOFU', count: 2 },
  { funnelStage: 'BOFU', count: 1 },
];

// Helper to safely extract JSON from response
function extractJsonFromResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e2) { /* continue */ }
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (e3) { /* continue */ }
    }
    throw new Error('Could not extract valid JSON from response');
  }
}

function countWords(html: string): number {
  const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function validateContentQuality(article: any, plan: any): { isValid: boolean; issues: string[]; score: number; wordCount: number } {
  const issues: string[] = [];
  let score = 100;

  const headlineWords = plan.headline.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const contentLower = (article.detailed_content || '').toLowerCase();
  const mentionedWords = headlineWords.filter((w: string) => contentLower.includes(w)).length;

  if (mentionedWords < headlineWords.length * 0.5) {
    issues.push('Content may not fully address headline topic');
    score -= 15;
  }

  const h2Count = (article.detailed_content?.match(/<h2>/gi) || []).length;
  if (h2Count < 4) {
    issues.push('Insufficient content structure (need 4+ H2 headings)');
    score -= 10;
  }

  const wordCount = countWords(article.detailed_content || '');

  if (wordCount < 1200) {
    issues.push(`CRITICAL: Content severely under minimum (${wordCount} words, need 1500+)`);
    return { isValid: false, issues, score: 0, wordCount };
  }

  if (wordCount < 1500) {
    issues.push(`Content too short (${wordCount} words, minimum 1500)`);
    score -= 40;
  } else if (wordCount > 2500) {
    issues.push(`Content too long (${wordCount} words, maximum 2500)`);
    score -= 10;
  }

  if (article.qa_entities && Array.isArray(article.qa_entities)) {
    if (article.qa_entities.length < 5) {
      issues.push(`Too few FAQs: ${article.qa_entities.length} (need 5-8)`);
      score -= 10;
    }
  }

  return { isValid: score >= 60, issues, score, wordCount };
}

// Update job progress on the cluster_generations row (best-effort)
async function updateProgress(
  supabase: any,
  clusterId: string,
  patch: Record<string, any>
) {
  try {
    const { data: existing } = await supabase
      .from('cluster_generations')
      .select('progress')
      .eq('id', clusterId)
      .single();

    const merged = { ...(existing?.progress || {}), ...patch, last_heartbeat: new Date().toISOString() };

    await supabase
      .from('cluster_generations')
      .update({ progress: merged, updated_at: new Date().toISOString() })
      .eq('id', clusterId);
  } catch (err) {
    console.warn('[Missing] Failed to update progress:', err);
  }
}

// Self-trigger: invoke this same function again (fire-and-forget) to continue chain
async function selfContinue(
  supabaseUrl: string,
  serviceKey: string,
  clusterId: string,
  specificFunnelStage?: string
) {
  try {
    const url = `${supabaseUrl}/functions/v1/generate-missing-articles`;
    // Fire-and-forget; do not await response body
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
      },
      body: JSON.stringify({ clusterId, specificFunnelStage }),
    }).catch((e) => console.warn('[Missing] selfContinue fetch error:', e));
    console.log('[Missing] 🔁 Self-continuation triggered for next missing slot');
  } catch (err) {
    console.warn('[Missing] selfContinue error:', err);
  }
}

// The actual long-running work — runs as a background task
async function processChunk(clusterId: string, specificFunnelStage: string | undefined) {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY');
  if (!CLAUDE_API_KEY) {
    console.error('[Missing] CLAUDE_API_KEY missing — aborting background work');
    return;
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  GENERATE MISSING ARTICLES (bg)        ║`);
  console.log(`╚════════════════════════════════════════╝`);
  console.log(`[Missing] Cluster: ${clusterId}`);

  try {
    const { data: cluster, error: clusterError } = await supabase
      .from('cluster_generations')
      .select('*')
      .eq('id', clusterId)
      .single();

    if (clusterError || !cluster) {
      console.error(`[Missing] Cluster not found: ${clusterId}`);
      return;
    }

    const sourceLanguage = cluster.language || 'en';

    // Mark job as actively generating (badge + sweeper rely on this)
    try {
      await supabase
        .from('cluster_generations')
        .update({ status: 'generating', updated_at: new Date().toISOString() })
        .eq('id', clusterId);
    } catch (e) {
      console.warn('[Missing] Failed to set status=generating:', e);
    }

    // ALWAYS re-read state at the top so concurrent runs / retries stay idempotent
    const { data: existingArticles, error: articlesError } = await supabase
      .from('blog_articles')
      .select('id, funnel_stage, headline, cluster_number')
      .eq('cluster_id', clusterId)
      .eq('language', sourceLanguage);

    if (articlesError) {
      console.error('[Missing] Failed to read existing articles:', articlesError);
      await updateProgress(supabase, clusterId, {
        message: `Failed to read existing articles: ${articlesError.message || 'unknown error'}`,
        in_progress: false,
        last_error: 'read_articles_failed',
      });
      return;
    }

    const existingByStage: Record<string, number> = { TOFU: 0, MOFU: 0, BOFU: 0 };
    const usedClusterNumbers = new Set<number>();

    for (const article of existingArticles || []) {
      const stage = (article.funnel_stage || 'TOFU').toUpperCase();
      // normalize accidentally-typo'd BOFO into BOFU bucket
      const bucket = stage === 'BOFO' ? 'BOFU' : stage;
      existingByStage[bucket] = (existingByStage[bucket] || 0) + 1;
      if (article.cluster_number) {
        usedClusterNumbers.add(article.cluster_number);
      }
    }

    const missingClusterNumbers: number[] = [];
    for (let i = 1; i <= 6; i++) {
      if (!usedClusterNumbers.has(i)) missingClusterNumbers.push(i);
    }

    console.log(`[Missing] Existing by stage:`, existingByStage);
    console.log(`[Missing] Used cluster_numbers: [${Array.from(usedClusterNumbers).sort((a,b)=>a-b).join(', ')}]`);
    console.log(`[Missing] Missing cluster_numbers: [${missingClusterNumbers.join(', ')}]`);

    const missingArticles: { funnelStage: string; count: number }[] = [];
    for (const expected of EXPECTED_STRUCTURE) {
      const have = existingByStage[expected.funnelStage] || 0;
      const need = expected.count - have;
      if (need > 0) {
        if (!specificFunnelStage || specificFunnelStage === expected.funnelStage) {
          missingArticles.push({ funnelStage: expected.funnelStage, count: need });
        }
      }
    }

    const totalMissing = missingArticles.reduce((s, m) => s + m.count, 0);
    const sourceCountSoFar = (existingArticles || []).length;

    if (missingArticles.length === 0 || totalMissing === 0 || missingClusterNumbers.length === 0) {
      console.log('[Missing] ✅ Nothing to generate — cluster already complete');
      await updateProgress(supabase, clusterId, {
        saved_articles: sourceCountSoFar,
        message: 'Source articles complete. Ready for translation.',
        source_complete: sourceCountSoFar >= 6,
        needs_translation: sourceCountSoFar >= 6,
        in_progress: false,
      });
      if (sourceCountSoFar >= 6) {
        await supabase
          .from('cluster_generations')
          .update({ status: 'partial' })
          .eq('id', clusterId);
      }
      return;
    }

    const firstMissing = missingArticles[0];
    const nextClusterNumber = missingClusterNumbers[0];

    await updateProgress(supabase, clusterId, {
      saved_articles: sourceCountSoFar,
      current_article: nextClusterNumber,
      message: `Generating article ${nextClusterNumber}/6 (${firstMissing.funnelStage})...`,
      source_complete: false,
      in_progress: true,
    });

    // Fetch authors and categories
    const { data: authors } = await supabase.from('authors').select('*');
    const { data: categories } = await supabase.from('categories').select('*');
    const { data: promptData } = await supabase
      .from('content_settings')
      .select('setting_value')
      .eq('setting_key', 'master_content_prompt')
      .single();
    const masterPrompt = promptData?.setting_value || '';
    const validCategoryNames = (categories || []).map((c: any) => c.name);

    console.log(`\n[Missing] Generating ${firstMissing.funnelStage} article (cluster_number: ${nextClusterNumber})...`);

    // ─── PLAN ──────────────────────────────────────────
    const planPrompt = `Generate a single article plan for a ${firstMissing.funnelStage} (${
      firstMissing.funnelStage === 'TOFU' ? 'top-of-funnel, awareness' :
      firstMissing.funnelStage === 'MOFU' ? 'middle-of-funnel, consideration' :
      'bottom-of-funnel, decision/purchase'
    }) article about "${cluster.topic}" targeting "${cluster.primary_keyword}".

The cluster already has these articles:
${(existingArticles || []).map((a: any) => `- ${a.funnel_stage}: ${a.headline}`).join('\n')}

Generate a NEW, UNIQUE article that complements the existing ones without duplicating topics.

You MUST respond with a valid JSON object:
{
  "headline": "Compelling article headline",
  "targetKeyword": "primary target keyword",
  "contentAngle": "unique angle for this article",
  "funnelStage": "${firstMissing.funnelStage}"
}`;

    const planResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': CLAUDE_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: 'Return ONLY a valid JSON object as specified. No prose.',
        messages: [{ role: 'user', content: planPrompt }],
      }),
    });

    if (!planResponse.ok) {
      const errorText = await planResponse.text();
      console.error(`[Missing] Plan API error (${planResponse.status}):`, errorText.substring(0, 500));
      await updateProgress(supabase, clusterId, {
        message: `Plan generation failed (${planResponse.status})`,
        in_progress: false,
        last_error: `plan_api_${planResponse.status}`,
      });
      return;
    }

    const planData = await planResponse.json();
    const planText = planData?.content?.[0]?.text || '';
    if (!planText.trim()) {
      console.error('[Missing] Empty plan response');
      await updateProgress(supabase, clusterId, {
        message: 'Empty plan response from Claude',
        in_progress: false,
        last_error: 'plan_empty',
      });
      return;
    }

    let plan: any;
    try {
      plan = extractJsonFromResponse(planText);
    } catch (e) {
      console.error('[Missing] Plan parse error:', e);
      await updateProgress(supabase, clusterId, {
        message: `Plan JSON parse failed: ${e instanceof Error ? e.message : String(e)}`,
        in_progress: false,
        last_error: 'plan_parse_failed',
      });
      return;
    }

    console.log(`[Missing] Plan: ${plan.headline}`);
    await new Promise((r) => setTimeout(r, 1000));

    const article: any = {
      funnel_stage: firstMissing.funnelStage,
      language: sourceLanguage,
      status: 'draft',
      headline: plan.headline,
      slug: plan.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    };

    // ─── CATEGORY ──────────────────────────────────────
    const categoryPrompt = `Select the most appropriate category for this article.

Available categories:
${validCategoryNames.map((name: string, idx: number) => `${idx + 1}. ${name}`).join('\n')}

Article: ${plan.headline}
Keyword: ${plan.targetKeyword}
Funnel Stage: ${firstMissing.funnelStage}

Respond with JSON: { "category": "exact category name from the list" }`;

    const categoryResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': CLAUDE_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: 'Return ONLY a valid JSON object as specified. No prose.',
        messages: [{ role: 'user', content: categoryPrompt }],
      }),
    });

    let finalCategory = 'Buying Property';
    if (categoryResponse.ok) {
      const categoryData = await categoryResponse.json();
      try {
        const categoryJson = extractJsonFromResponse(categoryData?.content?.[0]?.text || '{}');
        const aiCategory = categoryJson.category;
        const matched = validCategoryNames.find(
          (name: string) => name.toLowerCase() === aiCategory?.toLowerCase()
        );
        finalCategory = matched || 'Buying Property';
      } catch (e) {
        console.warn('[Missing] Category parse failed, using default');
      }
    }
    article.category = finalCategory;

    // ─── CONTENT ───────────────────────────────────────
    const languageNameMap: Record<string, string> = {
      en: 'English', de: 'German', nl: 'Dutch', fr: 'French',
      pl: 'Polish', sv: 'Swedish', da: 'Danish', hu: 'Hungarian',
      fi: 'Finnish', no: 'Norwegian',
    };
    const languageName = languageNameMap[sourceLanguage] || 'English';

    const basePrompt = masterPrompt
      ? masterPrompt
          .replace(/\{\{headline\}\}/g, plan.headline)
          .replace(/\{\{targetKeyword\}\}/g, plan.targetKeyword || '')
          .replace(/\{\{contentAngle\}\}/g, plan.contentAngle || '')
          .replace(/\{\{funnelStage\}\}/g, firstMissing.funnelStage)
          .replace(/\{\{language\}\}/g, sourceLanguage)
          .replace(/\{\{languageName\}\}/g, languageName)
      : `Write a comprehensive article about "${plan.headline}" targeting the keyword "${plan.targetKeyword}".`;

    const contentPrompt = `${basePrompt}

CRITICAL WORD COUNT REQUIREMENT: The article MUST be between 1,200 and 2,000 words.
- Minimum: 1,200 words (articles under this will be REJECTED)
- Target: 1,400-1,600 words (ideal range)
- Maximum: 2,000 words

You MUST respond with a valid JSON object with this exact structure:
{
  "detailed_content": "<div class='article-content'>...full HTML article content (MINIMUM 1500 words, target 1800-2000)...</div>",
  "meta_title": "SEO title (50-60 characters)",
  "meta_description": "SEO meta description (150-160 characters)",
  "speakable_answer": "40-60 word summary answering the main question directly",
  "qa_entities": [
    {"question": "FAQ question 1?", "answer": "Detailed answer (80-120 words, single paragraph, no lists)"},
    {"question": "FAQ question 2?", "answer": "Detailed answer (80-120 words, single paragraph, no lists)"}
  ]
}

Include 5-8 FAQ questions in qa_entities. Each answer must be 80-120 words in a single paragraph.
The detailed_content must be proper HTML with at least 6 H2 headings, detailed paragraphs, examples, and expert insights.
REMEMBER: Minimum 1,500 words in detailed_content is MANDATORY.`;

    let contentJson: any = null;
    let attempts = 0;
    const maxAttempts = 2;
    let lastWordCount = 0;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[Missing] Content generation attempt ${attempts}/${maxAttempts}...`);

      let currentPrompt = contentPrompt;
      let systemPrompt = `You are an expert independent financial advisor specializing in tax-free retirement strategies, IUL, and wealth protection.

CRITICAL REQUIREMENTS:
1. You MUST respond with valid JSON only
2. Articles MUST be between 1,500 and 2,500 words - this is NON-NEGOTIABLE
3. Include at least 8 H2 sections, each with 3+ detailed paragraphs (150-200 words per section)
4. Before finalizing, mentally count your words - if under 1,500, ADD MORE CONTENT`;

      if (attempts === 2 && contentJson) {
        const prevWordCount = countWords(contentJson.detailed_content || '');
        systemPrompt = `You are an expert independent financial advisor. Your previous response was ONLY ${prevWordCount} words - this is UNACCEPTABLE.

MANDATORY: This response MUST be at least 1,500 words.
STRATEGY: Write 8 sections of 200+ words each = 1,600+ words minimum.
DO NOT submit anything under 1,500 words.`;

        currentPrompt = `${contentPrompt}

⚠️ PREVIOUS ATTEMPT FAILED: Only ${prevWordCount} words generated.

You MUST write a MUCH LONGER article. Use this structure:
1. Introduction (150+ words)
2-8. Seven body sections (200+ words each)
9. Conclusion (150+ words)`;
      }

      const contentResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': CLAUDE_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 12000,
          system: systemPrompt + '\n\nIMPORTANT: Return ONLY a valid JSON object as specified. No prose, no markdown fences.',
          messages: [{ role: 'user', content: currentPrompt }],
        }),
      });

      if (!contentResponse.ok) {
        const errorText = await contentResponse.text();
        console.error(`[Missing] Content API error (${contentResponse.status}):`, errorText.substring(0, 500));
        await updateProgress(supabase, clusterId, {
          message: `Content generation failed (${contentResponse.status})`,
          in_progress: false,
          last_error: `content_api_${contentResponse.status}`,
        });
        return;
      }

      const contentData = await contentResponse.json();
      const contentText = contentData?.content?.[0]?.text || '';
      if (!contentText.trim()) {
        console.error('[Missing] Empty content response');
        return;
      }

      try {
        contentJson = extractJsonFromResponse(contentText);
      } catch (e) {
        console.error('[Missing] Content parse error:', e);
        return;
      }

      lastWordCount = countWords(contentJson.detailed_content || '');
      console.log(`[Missing] ━━━ Attempt ${attempts}: ${lastWordCount} words ━━━`);

      if (lastWordCount >= 1200) {
        console.log('[Missing] ✅ Word count requirement met!');
        break;
      }

      if (attempts < maxAttempts) {
        console.warn(`[Missing] ⚠️ Word count ${lastWordCount} below 1200, will retry...`);
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (lastWordCount < 1000) {
      console.error(`[Missing] ❌ Failed to reach minimum word count (${lastWordCount}); skipping save`);
      await updateProgress(supabase, clusterId, {
        message: `Article ${nextClusterNumber} rejected (only ${lastWordCount} words)`,
        in_progress: false,
        last_error: 'word_count_too_low',
      });
      return;
    }

    article.detailed_content = contentJson.detailed_content || contentJson.content || '';
    article.meta_title = (contentJson.meta_title || plan.headline).substring(0, 60);
    article.meta_description = (contentJson.meta_description || '').substring(0, 160);
    article.speakable_answer = contentJson.speakable_answer || '';
    article.qa_entities = contentJson.qa_entities || contentJson.faqs || [];

    // Leave image null — regenerate-cluster-images will fill in content-aware Kie.ai images
    // once the cluster reaches 6/6 (see post-completion trigger below).
    article.featured_image_url = null;
    article.featured_image_alt = `${plan.headline} - Everence Wealth`;

    const randomAuthor = authors?.[Math.floor(Math.random() * (authors?.length || 1))] || { id: null };
    const randomReviewer = authors?.filter((a: any) => a.id !== randomAuthor.id)?.[0] || randomAuthor;
    article.author_id = randomAuthor.id;
    article.reviewer_id = randomReviewer.id;

    article.cluster_id = clusterId;
    article.cluster_number = nextClusterNumber;
    article.cluster_theme = cluster.topic;
    article.date_published = new Date().toISOString();
    article.date_modified = new Date().toISOString();

    const { data: siblingArticle } = await supabase
      .from('blog_articles')
      .select('hreflang_group_id')
      .eq('cluster_id', clusterId)
      .eq('cluster_number', nextClusterNumber)
      .not('hreflang_group_id', 'is', null)
      .limit(1)
      .single();

    article.hreflang_group_id = siblingArticle?.hreflang_group_id || crypto.randomUUID();
    console.log(`[Missing] Assigned hreflang_group_id: ${article.hreflang_group_id}`);

    const quality = validateContentQuality(article, plan);
    console.log(`[Missing] Article quality: ${quality.score}/100`);
    if (quality.issues.length > 0) {
      console.warn('[Missing] Quality issues:', quality.issues);
    }

    // ─── IDEMPOTENCY GUARD ────────────────────────────
    // Re-check that this slot is still open right before insert
    const { data: slotTaken } = await supabase
      .from('blog_articles')
      .select('id')
      .eq('cluster_id', clusterId)
      .eq('language', sourceLanguage)
      .eq('cluster_number', nextClusterNumber)
      .limit(1)
      .maybeSingle();

    if (slotTaken) {
      console.warn(`[Missing] ⚠️ Slot ${nextClusterNumber} was filled by a concurrent run — skipping insert`);
    } else {
      const { data: savedArticle, error: saveError } = await supabase
        .from('blog_articles')
        .insert(article)
        .select('id')
        .single();

      if (saveError) {
        // If race condition unique-violation, treat as success and continue chain
        if ((saveError as any).code === '23505') {
          console.warn(`[Missing] Insert race detected on slot ${nextClusterNumber}; continuing`);
        } else {
          console.error('[Missing] DB insert error:', saveError);
          await updateProgress(supabase, clusterId, {
            message: `DB insert failed: ${saveError.message}`,
            in_progress: false,
            last_error: 'db_insert_failed',
          });
          return;
        }
      } else {
        console.log(`[Missing] ✅ Article saved: ${savedArticle.id} (cluster_number: ${nextClusterNumber})`);
      }
    }

    // ─── RECOUNT + SELF-CONTINUE ──────────────────────
    const { count: finalCount } = await supabase
      .from('blog_articles')
      .select('id', { count: 'exact', head: true })
      .eq('cluster_id', clusterId)
      .eq('language', sourceLanguage);

    console.log(`[Missing] Final article count for source language: ${finalCount}`);

    const completeNow = (finalCount || 0) >= 6;

    await updateProgress(supabase, clusterId, {
      saved_articles: finalCount || 0,
      message: completeNow
        ? 'Source articles complete. Ready for translation.'
        : `Saved ${finalCount}/6 source articles. Continuing in background...`,
      source_complete: completeNow,
      needs_translation: completeNow,
      in_progress: !completeNow,
    });

    if (completeNow) {
      const { error: updateError } = await supabase
        .from('cluster_generations')
        .update({ status: 'partial' })
        .eq('id', clusterId);
      if (updateError) {
        console.error('[Missing] Failed to update cluster status:', updateError);
      } else {
        console.log(`[Missing] ✅ Cluster status set to 'partial' (ready for translation)`);
      }

      // Fire-and-forget: regenerate content-aware images for all 6 articles
      // (replaces any nulls / leftover Unsplash placeholders with Kie.ai images).
      try {
        const regenUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/regenerate-cluster-images`;
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        fetch(regenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
          },
          body: JSON.stringify({ clusterId }),
        }).catch((e) => console.warn('[Missing] regenerate-cluster-images fetch error:', e));
        console.log('[Missing] 🎨 Triggered regenerate-cluster-images for content-aware images');
      } catch (err) {
        console.warn('[Missing] Failed to trigger regenerate-cluster-images:', err);
      }

      return;
    }

    // Still missing — chain another background invocation
    await selfContinue(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, clusterId, specificFunnelStage);
  } catch (err) {
    console.error('[Missing] Unexpected background error:', err);
    try {
      const supa = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      await updateProgress(supa, clusterId, {
        message: `Background error: ${err instanceof Error ? err.message : String(err)}`,
        in_progress: false,
        last_error: 'unexpected_background_error',
      });
    } catch (_e) { /* swallow */ }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let clusterId: string | undefined;
  let specificFunnelStage: string | undefined;
  try {
    const body = await req.json();
    clusterId = body.clusterId;
    specificFunnelStage = body.specificFunnelStage;
  } catch (_e) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!clusterId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing clusterId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Kick off the long-running work in the background so the HTTP response
  // is returned immediately and survives client disconnects.
  try {
    // EdgeRuntime is provided by the Supabase Deno runtime
    // @ts-ignore - EdgeRuntime is a runtime global
    EdgeRuntime.waitUntil(processChunk(clusterId, specificFunnelStage));
  } catch (_e) {
    // Fallback: if EdgeRuntime is unavailable, still kick off the work without awaiting it
    processChunk(clusterId, specificFunnelStage).catch((err) =>
      console.error('[Missing] Background work failed (no waitUntil):', err)
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      accepted: true,
      clusterId,
      message: 'Background generation started. Poll cluster_generations.progress / blog_articles for state.',
    }),
    { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
