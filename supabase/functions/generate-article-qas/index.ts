import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'German',
  nl: 'Dutch',
  fr: 'French',
  pl: 'Polish',
  sv: 'Swedish',
  da: 'Danish',
  hu: 'Hungarian',
  fi: 'Finnish',
  no: 'Norwegian',
};

const ALL_LANGUAGES = ['en', 'de', 'nl', 'fr', 'pl', 'sv', 'da', 'hu', 'fi', 'no'];

// 4 Q&A types per article - realistic buyer questions
const QA_TYPES = [
  { id: 'pitfalls', prompt: 'PITFALLS question - What common mistakes, pitfalls, or traps should buyers avoid?' },
  { id: 'costs', prompt: 'HIDDEN COSTS question - What unexpected or hidden costs should buyers know about?' },
  { id: 'process', prompt: 'PROCESS question - How does the buying/application process work step by step?' },
  { id: 'legal', prompt: 'LEGAL/REGULATORY question - What legal requirements, regulations, or documentation is needed?' },
];

const LANGUAGE_WORD_COUNTS: Record<string, { min: number; max: number }> = {
  'en': { min: 300, max: 800 },
  'de': { min: 250, max: 750 },
  'nl': { min: 250, max: 750 },
  'fr': { min: 260, max: 780 },
  'pl': { min: 220, max: 700 },
  'sv': { min: 220, max: 750 },
  'da': { min: 220, max: 750 },
  'hu': { min: 220, max: 650 },
  'fi': { min: 200, max: 600 },
  'no': { min: 220, max: 750 },
};

/**
 * Generate a single Q&A in a specific language
 */
async function generateQAInLanguage(
  sourceContent: { headline: string; content: string; clusterId: string; category: string; topic: string },
  qaType: { id: string; prompt: string },
  language: string,
  apiKey: string
): Promise<any | null> {
  const languageName = LANGUAGE_NAMES[language];
  const thresholds = LANGUAGE_WORD_COUNTS[language];

  const prompt = `Generate a Q&A page in ${languageName} about Costa del Sol real estate.

LANGUAGE: ${languageName.toUpperCase()} (code: ${language})
${language !== 'en' ? `⚠️ CRITICAL: Write ALL content in ${languageName}. NO English text allowed.` : ''}

Q&A TYPE: ${qaType.prompt}

ARTICLE TOPIC: ${sourceContent.topic}
ARTICLE TITLE: ${sourceContent.headline}
ARTICLE SUMMARY: ${sourceContent.content.substring(0, 2000)}

REQUIREMENTS:
- Word count: ${thresholds.min}-${thresholds.max} words
- Structure: Short answer (80-120 words) + 3-4 H3 sections + closing paragraph
- Tone: Neutral, factual, advisory (no "we", no marketing, no CTAs)
- NO links, NO bullet points in short answer
- Question must be specific to the article topic

Return ONLY valid JSON:
{
  "question_main": "Question in ${languageName} ending with ?",
  "answer_main": "Complete markdown answer with H3 sections",
  "title": "Page title (50-60 chars)",
  "slug": "url-friendly-slug",
  "meta_title": "Meta title ≤60 chars",
  "meta_description": "Meta description ≤160 chars in ${languageName}",
  "speakable_answer": "Voice-ready summary (50-80 words) in ${languageName}"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: `You are an expert Q&A content generator for real estate. Write in ${languageName} ONLY. Return valid JSON only.` 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        console.log(`[Rate limit] Waiting before retry for ${language}/${qaType.id}...`);
        await new Promise(r => setTimeout(r, 10000));
        return null;
      }
      throw new Error(`API error: ${status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found');
    
    const qaData = JSON.parse(content.slice(start, end + 1));
    
    return qaData;
    
  } catch (error) {
    console.error(`[Generate] Failed ${language}/${qaType.id}:`, error);
    return null;
  }
}

/**
 * Translate image alt text to target language
 */
async function translateAltText(altText: string, language: string, apiKey: string): Promise<string> {
  if (language === 'en' || !altText) return altText;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `Translate to ${LANGUAGE_NAMES[language]}. Return ONLY the translation.` },
          { role: 'user', content: altText }
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || altText;
    }
  } catch (err) {
    console.warn(`[Generate] Alt translation failed for ${language}:`, err);
  }
  return altText;
}

/**
 * Main handler - generates ALL 40 Q&As for a single article (4 types × 10 languages)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { englishArticleId, dryRun = false } = await req.json();
    
    if (!englishArticleId) {
      return new Response(JSON.stringify({ error: 'englishArticleId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const apiKey = Deno.env.get('OPENAI_API_KEY')!;

    console.log(`[Generate] Starting article Q&A generation for: ${englishArticleId}`);

    // Get English article as source (master content)
    const { data: englishArticle, error: articleError } = await supabase
      .from('blog_articles')
      .select('id, headline, slug, detailed_content, meta_description, category, cluster_theme, cluster_id, hreflang_group_id, featured_image_url, featured_image_alt')
      .eq('id', englishArticleId)
      .eq('language', 'en')
      .single();

    if (articleError || !englishArticle) {
      return new Response(JSON.stringify({ 
        error: 'English article not found',
        englishArticleId 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Generate] Source: ${englishArticle.headline}`);
    console.log(`[Generate] Cluster: ${englishArticle.cluster_id}`);
    console.log(`[Generate] Article hreflang_group_id: ${englishArticle.hreflang_group_id}`);

    // Get ALL sibling articles in all languages (same hreflang_group_id or same cluster)
    const { data: siblingArticles } = await supabase
      .from('blog_articles')
      .select('id, language, slug, headline, featured_image_url, featured_image_alt')
      .eq('cluster_id', englishArticle.cluster_id)
      .eq('status', 'published');

    // Build map of articles by language
    const articlesByLang: Record<string, any> = {};
    for (const article of siblingArticles || []) {
      // Prefer matching by hreflang_group_id if available
      if (englishArticle.hreflang_group_id) {
        const { data: exactMatch } = await supabase
          .from('blog_articles')
          .select('id, language, slug, headline, featured_image_url, featured_image_alt')
          .eq('hreflang_group_id', englishArticle.hreflang_group_id)
          .eq('language', article.language)
          .single();
        
        if (exactMatch) {
          articlesByLang[article.language] = exactMatch;
          continue;
        }
      }
      // Fallback to cluster-based matching
      if (!articlesByLang[article.language]) {
        articlesByLang[article.language] = article;
      }
    }

    console.log(`[Generate] Found sibling articles in: ${Object.keys(articlesByLang).join(', ')}`);

    const sourceContent = {
      headline: englishArticle.headline,
      content: englishArticle.detailed_content || englishArticle.meta_description || '',
      clusterId: englishArticle.cluster_id,
      category: englishArticle.category || 'Real Estate',
      topic: englishArticle.cluster_theme || englishArticle.headline,
    };

    const results = {
      created: 0,
      failed: 0,
      qaPages: [] as any[],
      hreflangGroups: [] as string[],
    };

    // Generate 4 Q&A types
    for (const qaType of QA_TYPES) {
      // Create shared hreflang_group_id for this Q&A type (all 10 languages share this)
      const hreflangGroupId = crypto.randomUUID();
      results.hreflangGroups.push(hreflangGroupId);
      
      const languageSlugs: Record<string, string> = {};
      const createdPages: any[] = [];

      console.log(`[Generate] Starting ${qaType.id} with hreflang_group: ${hreflangGroupId}`);

      // Generate each language version
      for (const lang of ALL_LANGUAGES) {
        const langArticle = articlesByLang[lang];
        
        console.log(`[Generate] Generating ${lang}/${qaType.id}...`);
        
        const qaData = await generateQAInLanguage(sourceContent, qaType, lang, apiKey);

        if (qaData) {
          // Create unique slug with language suffix
          const baseSlug = (qaData.slug || `${qaType.id}-${sourceContent.topic.toLowerCase().replace(/\s+/g, '-')}`).substring(0, 80);
          const finalSlug = `${baseSlug}-${lang}`.replace(/--+/g, '-');
          
          languageSlugs[lang] = finalSlug;
          
          // Translate image alt text
          const imageAlt = await translateAltText(
            langArticle?.featured_image_alt || englishArticle.featured_image_alt || 'Costa del Sol property',
            lang,
            apiKey
          );
          
          const pageData = {
            source_article_id: langArticle?.id || englishArticle.id,
            source_article_slug: langArticle?.slug || englishArticle.slug,
            cluster_id: englishArticle.cluster_id,
            language: lang,
            source_language: 'en',
            hreflang_group_id: hreflangGroupId,
            qa_type: qaType.id,
            title: qaData.title || qaData.question_main,
            slug: finalSlug,
            canonical_url: `https://www.delsolprimehomes.com/${lang}/qa/${finalSlug}`,
            question_main: qaData.question_main,
            answer_main: qaData.answer_main,
            related_qas: [],
            speakable_answer: qaData.speakable_answer,
            meta_title: (qaData.meta_title || '').substring(0, 60),
            meta_description: (qaData.meta_description || '').substring(0, 160),
            featured_image_url: langArticle?.featured_image_url || englishArticle.featured_image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
            featured_image_alt: imageAlt,
            category: sourceContent.category,
            status: 'published',
            translations: {}, // Will be filled after all languages
          };

          createdPages.push(pageData);
          results.created++;
          
          // Rate limiting delay
          await new Promise(r => setTimeout(r, 1500));
        } else {
          results.failed++;
          console.error(`[Generate] Failed to generate ${lang}/${qaType.id}`);
        }
      }

      // Update all pages with complete translations JSONB (including self-reference)
      for (const page of createdPages) {
        page.translations = { ...languageSlugs };
      }

      if (!dryRun && createdPages.length > 0) {
        console.log(`[Generate] Inserting ${createdPages.length} pages for ${qaType.id}`);
        
        const { error: insertError, data: insertedData } = await supabase
          .from('qa_pages')
          .insert(createdPages)
          .select('id, language, slug, hreflang_group_id');

        if (insertError) {
          console.error(`[Generate] Insert error for ${qaType.id}:`, insertError);
          results.created -= createdPages.length;
          results.failed += createdPages.length;
        } else {
          console.log(`[Generate] ✅ Inserted ${insertedData?.length || 0} pages for ${qaType.id}`);
          results.qaPages.push(...createdPages.map((p, i) => ({
            ...p,
            id: insertedData?.[i]?.id,
          })));
        }
      } else if (dryRun) {
        results.qaPages.push(...createdPages);
      }

      // Delay between Q&A types
      await new Promise(r => setTimeout(r, 3000));
    }

    console.log(`[Generate] Complete! Created: ${results.created}, Failed: ${results.failed}`);

    return new Response(JSON.stringify({
      success: true,
      englishArticleId,
      articleHeadline: englishArticle.headline,
      clusterId: englishArticle.cluster_id,
      created: results.created,
      failed: results.failed,
      expected: QA_TYPES.length * ALL_LANGUAGES.length, // 40 pages
      hreflangGroups: results.hreflangGroups,
      qaPages: results.qaPages.map(p => ({ 
        language: p.language, 
        qa_type: p.qa_type, 
        slug: p.slug,
        source_article_id: p.source_article_id,
        hreflang_group_id: p.hreflang_group_id,
      })),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Generate] Error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
