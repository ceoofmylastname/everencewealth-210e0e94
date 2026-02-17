import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, topic, target_audience, language = 'en', state } = await req.json();

    if (!category || !topic) {
      return new Response(JSON.stringify({ error: 'category and topic are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stateContext = state ? ` Focus specifically on ${state} state laws, tax rules, and retirement planning considerations.` : '';

    const prompt = `You are Steven Rosenberg, Founder & Chief Wealth Strategist at Everence Wealth. Generate an educational brochure/guide about "${topic}" in the "${category.replace(/_/g, ' ')}" category for ${target_audience || 'pre-retirees aged 50-65'}.${stateContext}

Challenge Wall Street conventions. Prioritize cash flow over net worth. Advocate for protected indexed strategies using the Three Tax Buckets framework.

Language: ${language === 'es' ? 'Spanish' : 'English'}

Return ONLY valid JSON with this structure:
{
  "title": "Guide title (compelling, educational)",
  "slug": "url-friendly-slug",
  "hero_headline": "Powerful H1 headline",
  "subtitle": "Supporting subtitle",
  "meta_title": "SEO title under 60 chars",
  "meta_description": "Meta description under 155 chars",
  "speakable_intro": "40-60 word intro paragraph summarizing the guide's value",
  "tags": ["tag1", "tag2", "tag3"],
  "sections": [
    {
      "section_number": 1,
      "title": "Section title",
      "content": "<p>Rich HTML content with <strong>key points</strong>, <ul><li>lists</li></ul>, and actionable advice. Minimum 150 words per section.</p>"
    }
  ]
}

Generate 5-6 sections. Each section must have substantial HTML content (150-300 words).
NO markdown. Use only: <p>, <ul>, <li>, <strong>, <em>, <h3>, <h4>
Return ONLY the JSON object.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${errText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error('No content from AI');

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Build brochure record
    const brochure = {
      title: parsed.title,
      slug: parsed.slug || slugify(parsed.title),
      category,
      hero_headline: parsed.hero_headline || parsed.title,
      subtitle: parsed.subtitle || null,
      meta_title: parsed.meta_title || parsed.title.substring(0, 60),
      meta_description: parsed.meta_description || '',
      speakable_intro: parsed.speakable_intro || '',
      tags: parsed.tags || [],
      sections: parsed.sections || [],
      language,
      status: 'draft',
      gated: true,
      featured: false,
    };

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabase.from('brochures').insert([brochure]).select('id').single();
    if (error) throw new Error(`DB insert error: ${error.message}`);

    return new Response(JSON.stringify({ success: true, brochure_id: data.id, brochure }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-guide-content:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
