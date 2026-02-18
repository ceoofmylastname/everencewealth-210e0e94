import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Sanitize user input: strip characters that could break prompt context
function sanitize(str: string, maxLen: number): string {
  return str
    .replace(/[`\\]/g, '')           // remove backticks and backslashes
    .replace(/"{2,}/g, '"')          // collapse multiple quotes
    .replace(/\n{3,}/g, '\n\n')      // limit consecutive newlines
    .trim()
    .substring(0, maxLen);
}

const ALLOWED_LANGUAGES = ['en', 'es'];
const ALLOWED_CATEGORIES = [
  'tax_planning',
  'retirement_strategies',
  'iul_education',
  'estate_planning',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Issue 2: Auth check — verify JWT + admin role ──────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuthClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuthClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role via is_admin function
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: isAdmin } = await adminClient.rpc('is_admin', { _user_id: userId });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // ── End auth check ─────────────────────────────────────────────────────

    const { category, topic, target_audience, language = 'en', state, generate_cover_image = false } = await req.json();

    if (!category || !topic) {
      return new Response(JSON.stringify({ error: 'category and topic are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Issue 3: Input validation & sanitization ───────────────────────────
    if (!ALLOWED_LANGUAGES.includes(language)) {
      return new Response(JSON.stringify({ error: 'Invalid language. Must be one of: en, es' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return new Response(JSON.stringify({ error: 'Invalid category.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const safeTopic = sanitize(String(topic), 200);
    const safeAudience = sanitize(String(target_audience || 'pre-retirees aged 50-65'), 150);
    const safeState = state ? sanitize(String(state), 50) : null;

    if (!safeTopic) {
      return new Response(JSON.stringify({ error: 'topic cannot be empty after sanitization' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // ── End input validation ───────────────────────────────────────────────

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const stateContext = safeState ? ` Focus specifically on ${safeState} state laws, tax rules, and retirement planning considerations.` : '';

    const prompt = `You are Steven Rosenberg, Founder & Chief Wealth Strategist at Everence Wealth. Generate an educational brochure/guide about "${safeTopic}" in the "${category.replace(/_/g, ' ')}" category for ${safeAudience}.${stateContext}

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
  "cover_image_alt": "Descriptive alt text for the cover image that describes the financial concept visually",
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
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status} - ${errText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error('No content from AI');

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Generate unique slug with random suffix to avoid conflicts
    const baseSlug = parsed.slug || slugify(parsed.title);
    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    const uniqueSlug = `${baseSlug}-${uniqueSuffix}`;

    // Build brochure data (returned to client, NOT auto-saved)
    const brochure: Record<string, unknown> = {
      title: parsed.title,
      slug: uniqueSlug,
      category,
      hero_headline: parsed.hero_headline || parsed.title,
      subtitle: parsed.subtitle || null,
      meta_title: parsed.meta_title || parsed.title.substring(0, 60),
      meta_description: parsed.meta_description || '',
      speakable_intro: parsed.speakable_intro || '',
      cover_image_alt: parsed.cover_image_alt || `${parsed.title} - Everence Wealth`,
      tags: parsed.tags || [],
      sections: parsed.sections || [],
      language,
      status: 'draft',
      gated: true,
      featured: false,
    };

    // Generate cover image with Nano Banana Pro if requested
    if (generate_cover_image) {
      try {
        const imagePrompt = `Professional, high-quality cover image for a financial educational guide titled "${parsed.title}". 
The image should convey: ${parsed.cover_image_alt || safeTopic}.
Style: Clean, modern, professional financial advisory aesthetic. Warm lighting, sophisticated color palette with navy blue and gold accents. 
NO text or words in the image. Photorealistic quality. Landscape orientation 16:9 aspect ratio.
Theme: Wealth management, retirement planning, financial security.`;

        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-pro-image-preview',
            messages: [{ role: 'user', content: imagePrompt }],
            modalities: ['image', 'text'],
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (base64Image) {
            // Extract base64 data
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            const fileName = `brochure-cover-${uniqueSlug}-${Date.now()}.png`;

            const { error: uploadError } = await adminClient.storage
              .from('article-images')
              .upload(fileName, imageBytes, { contentType: 'image/png', upsert: true });

            if (!uploadError) {
              const { data: publicUrlData } = adminClient.storage
                .from('article-images')
                .getPublicUrl(fileName);
              brochure.cover_image_url = publicUrlData.publicUrl;
            } else {
              console.error('Image upload error:', uploadError.message);
            }
          }
        } else {
          console.error('Image generation failed:', await imageResponse.text());
        }
      } catch (imgErr) {
        console.error('Cover image generation error:', imgErr);
        // Non-fatal - continue without image
      }
    }

    return new Response(JSON.stringify({ success: true, brochure }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-guide-content:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
