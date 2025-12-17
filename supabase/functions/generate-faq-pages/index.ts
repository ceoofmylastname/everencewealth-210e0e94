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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleIds, mode = 'single', languages = ['en'], jobId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create or get job
    let job;
    if (jobId) {
      const { data } = await supabase.from('faq_generation_jobs').select('*').eq('id', jobId).single();
      job = data;
    } else {
      const { data, error } = await supabase
        .from('faq_generation_jobs')
        .insert({
          user_id: null,
          status: 'running',
          mode,
          languages,
          article_ids: articleIds,
          total_articles: articleIds.length,
          total_faq_pages: articleIds.length * 2 * languages.length,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      job = data;
    }

    // Fetch articles
    const { data: articles, error: articlesError } = await supabase
      .from('blog_articles')
      .select('id, headline, detailed_content, meta_description, language, featured_image_url, featured_image_alt, featured_image_caption, slug, author_id, cluster_id')
      .in('id', articleIds)
      .eq('status', 'published');

    if (articlesError) throw articlesError;

    const results: any[] = [];
    let processedArticles = 0;
    let generatedFaqPages = 0;

    for (const article of articles || []) {
      try {
        // Determine languages to generate for
        let targetLanguages = languages;
        if (languages.includes('all') || languages[0] === 'all') {
          // Get all sibling languages from cluster
          if (article.cluster_id) {
            const { data: siblings } = await supabase
              .from('blog_articles')
              .select('language')
              .eq('cluster_id', article.cluster_id)
              .eq('status', 'published');
            targetLanguages = [...new Set(siblings?.map(s => s.language) || [article.language])];
          } else {
            targetLanguages = [article.language];
          }
        }

        for (const lang of targetLanguages) {
          // Get article content in target language
          let sourceArticle: any = article;
          if (lang !== article.language && article.cluster_id) {
            const { data: langArticle } = await supabase
              .from('blog_articles')
              .select('id, headline, detailed_content, meta_description, language, featured_image_url, featured_image_alt, featured_image_caption, slug, author_id, cluster_id')
              .eq('cluster_id', article.cluster_id)
              .eq('language', lang)
              .eq('status', 'published')
              .single();
            if (langArticle) sourceArticle = langArticle;
          }

          const languageName = LANGUAGE_NAMES[lang] || 'English';
          
          // Generate 2 FAQ pages using AI
          const prompt = `CRITICAL: ALL OUTPUT MUST BE WRITTEN ENTIRELY IN ${languageName}.
Do NOT use English unless the target language IS English.
Every word, phrase, and sentence must be native ${languageName}.

You are generating 2 standalone FAQ pages derived from this blog article:

ARTICLE TITLE: ${sourceArticle.headline}
ARTICLE CONTENT: ${sourceArticle.detailed_content?.substring(0, 4000)}
LANGUAGE: ${languageName}

Generate exactly 2 FAQ pages with DIFFERENT angles:

FAQ PAGE #1 (TYPE: "core"):
- Focus: Core explanation, how-to, educational
- Main question should be "What is..." or "How to..." style
- Answer should be comprehensive, helpful, structured

FAQ PAGE #2 (TYPE: "decision"):  
- Focus: Decision-making, comparison, common mistakes
- Main question should be "Should I...", "What to avoid...", "Best way to..." style
- Answer should help readers make informed decisions

For EACH FAQ page, return a JSON object with these exact fields:
{
  "faq_type": "core" or "decision",
  "title": "Full page title in ${languageName} (50-60 chars)",
  "slug": "url-friendly-slug-in-target-language",
  "question_main": "The primary question in ${languageName}",
  "answer_main": "Complete, citeable, helpful answer in HTML format (300-500 words) in ${languageName}",
  "related_faqs": [
    {"question": "Related Q1 in ${languageName}", "answer": "Answer in ${languageName}"},
    {"question": "Related Q2 in ${languageName}", "answer": "Answer in ${languageName}"}
  ],
  "speakable_answer": "Short, citation-ready voice answer (50-80 words) in ${languageName}",
  "meta_title": "SEO title ≤60 chars in ${languageName}",
  "meta_description": "SEO description ≤160 chars in ${languageName}"
}

Return a JSON array with exactly 2 objects. No markdown, no explanation, just valid JSON.`;

          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'You are an expert SEO content generator. Return only valid JSON, no markdown or explanation.' },
                { role: 'user', content: prompt }
              ],
            }),
          });

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error('AI API error:', errorText);
            throw new Error(`AI API error: ${aiResponse.status}`);
          }

          const aiData = await aiResponse.json();
          let faqPagesData;
          
          try {
            let content = aiData.choices?.[0]?.message?.content || '';
            content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            faqPagesData = JSON.parse(content);
          } catch (parseError) {
            console.error('Failed to parse AI response:', aiData.choices?.[0]?.message?.content);
            throw new Error('Failed to parse AI response as JSON');
          }

          // Save each FAQ page
          for (const faqData of faqPagesData) {
            const baseSlug = faqData.slug || `faq-${sourceArticle.slug}-${faqData.faq_type}`;
            const slug = `${baseSlug}-${lang}`;
            
            // Check for existing slug
            const { data: existing } = await supabase
              .from('faq_pages')
              .select('id')
              .eq('slug', slug)
              .eq('language', lang)
              .single();

            if (existing) {
              console.log(`FAQ page already exists: ${slug}`);
              continue;
            }

            const { data: faqPage, error: insertError } = await supabase
              .from('faq_pages')
              .insert({
                source_article_id: sourceArticle.id,
                language: lang,
                faq_type: faqData.faq_type,
                title: faqData.title,
                slug,
                question_main: faqData.question_main,
                answer_main: faqData.answer_main,
                related_faqs: faqData.related_faqs || [],
                speakable_answer: faqData.speakable_answer,
                meta_title: faqData.meta_title?.substring(0, 60) || faqData.title.substring(0, 60),
                meta_description: faqData.meta_description?.substring(0, 160) || '',
                featured_image_url: sourceArticle.featured_image_url,
                featured_image_alt: sourceArticle.featured_image_alt || faqData.title,
                featured_image_caption: sourceArticle.featured_image_caption,
                source_article_slug: sourceArticle.slug,
                author_id: sourceArticle.author_id,
                status: 'draft',
              })
              .select()
              .single();

            if (insertError) {
              console.error('Insert error:', insertError);
              throw insertError;
            }

            generatedFaqPages++;
            results.push({
              faq_page_id: faqPage.id,
              source_article_id: sourceArticle.id,
              language: lang,
              faq_type: faqData.faq_type,
              title: faqData.title,
              slug,
            });
          }
        }

        processedArticles++;
        
        // Update job progress
        await supabase
          .from('faq_generation_jobs')
          .update({
            processed_articles: processedArticles,
            generated_faq_pages: generatedFaqPages,
            results,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);

      } catch (articleError) {
        console.error(`Error processing article ${article.id}:`, articleError);
        results.push({
          source_article_id: article.id,
          error: articleError instanceof Error ? articleError.message : 'Unknown error',
        });
      }
    }

    // Link translations between FAQ pages from same cluster
    const faqPagesByCluster: Record<string, any[]> = {};
    for (const result of results) {
      if (result.faq_page_id) {
        const key = `${result.source_article_id}-${result.faq_type}`;
        if (!faqPagesByCluster[key]) faqPagesByCluster[key] = [];
        faqPagesByCluster[key].push(result);
      }
    }

    for (const pages of Object.values(faqPagesByCluster)) {
      if (pages.length > 1) {
        const translations: Record<string, string> = {};
        for (const page of pages) {
          translations[page.language] = page.slug;
        }
        
        for (const page of pages) {
          await supabase
            .from('faq_pages')
            .update({ translations })
            .eq('id', page.faq_page_id);
        }
      }
    }

    // Mark job as completed
    await supabase
      .from('faq_generation_jobs')
      .update({
        status: 'completed',
        processed_articles: processedArticles,
        generated_faq_pages: generatedFaqPages,
        results,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return new Response(JSON.stringify({
      success: true,
      jobId: job.id,
      processedArticles,
      generatedFaqPages,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-faq-pages:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
