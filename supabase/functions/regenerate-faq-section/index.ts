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
    const { faqPageId, section } = await req.json();

    if (!faqPageId || !section) {
      return new Response(JSON.stringify({ error: 'faqPageId and section are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validSections = ['answer', 'speakable', 'meta', 'related_faqs'];
    if (!validSections.includes(section)) {
      return new Response(JSON.stringify({ error: `Invalid section. Must be one of: ${validSections.join(', ')}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get FAQ page
    const { data: faqPage, error: faqError } = await supabase
      .from('faq_pages')
      .select('*, blog_articles!source_article_id(headline, detailed_content)')
      .eq('id', faqPageId)
      .single();

    if (faqError || !faqPage) {
      return new Response(JSON.stringify({ error: 'FAQ page not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const languageName = LANGUAGE_NAMES[faqPage.language] || 'English';
    const article = faqPage.blog_articles;

    let prompt = '';
    let updateFields: Record<string, any> = {};

    switch (section) {
      case 'answer':
        prompt = `CRITICAL: Write the answer ENTIRELY in ${languageName}. No English unless target language IS English.

Based on this question: "${faqPage.question_main}"
And this article context: ${article?.detailed_content?.substring(0, 2000) || ''}

Generate a comprehensive, helpful, citeable answer in HTML format (300-500 words) in ${languageName}.
Return ONLY the HTML answer text, no JSON, no markdown code blocks.`;
        break;

      case 'speakable':
        prompt = `CRITICAL: Write the answer ENTIRELY in ${languageName}. No English unless target language IS English.

Based on this question: "${faqPage.question_main}"
And this answer: ${faqPage.answer_main.substring(0, 1000)}

Generate a short, citation-ready voice answer (50-80 words) suitable for voice assistants in ${languageName}.
Return ONLY the speakable text, no JSON, no markdown.`;
        break;

      case 'meta':
        prompt = `CRITICAL: Write ENTIRELY in ${languageName}. No English unless target language IS English.

Based on this FAQ page:
Title: ${faqPage.title}
Question: ${faqPage.question_main}

Generate SEO meta tags in ${languageName}:
1. meta_title: ≤60 characters
2. meta_description: ≤160 characters

Return JSON only: {"meta_title": "...", "meta_description": "..."}`;
        break;

      case 'related_faqs':
        prompt = `CRITICAL: Write ENTIRELY in ${languageName}. No English unless target language IS English.

Based on this main question: "${faqPage.question_main}"
And article context: ${article?.detailed_content?.substring(0, 2000) || ''}

Generate 2-3 related FAQ questions and answers in ${languageName}.
Each answer should be 50-100 words.

Return JSON array only: [{"question": "...", "answer": "..."}, ...]`;
        break;
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert SEO content generator. Follow instructions exactly.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    switch (section) {
      case 'answer':
        updateFields.answer_main = content;
        break;
      case 'speakable':
        updateFields.speakable_answer = content;
        break;
      case 'meta':
        const metaData = JSON.parse(content);
        updateFields.meta_title = metaData.meta_title?.substring(0, 60);
        updateFields.meta_description = metaData.meta_description?.substring(0, 160);
        break;
      case 'related_faqs':
        updateFields.related_faqs = JSON.parse(content);
        break;
    }

    updateFields.updated_at = new Date().toISOString();

    const { data: updatedFaq, error: updateError } = await supabase
      .from('faq_pages')
      .update(updateFields)
      .eq('id', faqPageId)
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      faqPage: updatedFaq,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in regenerate-faq-section:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
