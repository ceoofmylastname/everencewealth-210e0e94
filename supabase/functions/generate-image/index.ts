import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, headline, content, imageUrl } = await req.json();

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let finalPrompt: string;

    if (prompt) {
      finalPrompt = prompt;
    } else if (headline) {
      // Use AI to generate a content-specific image prompt
      const contentSnippet = content ? content.substring(0, 1500) : '';
      
      const promptGenResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-lite',
          messages: [
            {
              role: 'system',
              content: `You are an expert at writing image generation prompts for financial advisory blog articles. Given an article headline and optional content, create a single detailed prompt for a photorealistic image that directly illustrates the SPECIFIC topic of the article. 

Rules:
- The image must be specific to the article topic, not generic stock photography
- Include specific visual elements that relate to the article's subject matter
- Use professional, warm, trustworthy tones suitable for a wealth management firm
- End with: "ultra-realistic, 8k resolution, professional photography, no text, no watermarks, 16:9 aspect ratio"
- Return ONLY the prompt text, nothing else
- Never include people's names or brand names in the prompt
- Focus on scenes, settings, objects, and atmospheres that embody the article's message`
            },
            {
              role: 'user',
              content: `Article headline: "${headline}"${contentSnippet ? `\n\nArticle content excerpt:\n${contentSnippet}` : ''}`
            }
          ],
        }),
      });

      if (!promptGenResponse.ok) {
        console.error('Prompt generation failed, using headline fallback');
        finalPrompt = `Professional financial advisory scene illustrating "${headline}", modern office setting, warm lighting, ultra-realistic, 8k resolution, professional photography, no text, no watermarks, 16:9 aspect ratio`;
      } else {
        const promptData = await promptGenResponse.json();
        finalPrompt = promptData.choices?.[0]?.message?.content?.trim() || 
          `Professional financial advisory scene illustrating "${headline}", ultra-realistic, 8k, no text, no watermarks, 16:9 aspect ratio`;
      }
      
      console.log('AI-generated image prompt:', finalPrompt);
    } else {
      finalPrompt = 'Professional financial advisory consultation, modern office, warm lighting, advisor and client, ultra-realistic, 8k, no text, no watermarks, 16:9 aspect ratio';
    }

    console.log('Generating image with prompt length:', finalPrompt.length);

    const messages: any[] = [];
    
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: finalPrompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: `Generate this image: ${finalPrompt}`
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages,
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation error:', errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again shortly.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error('No image returned from AI model');
    }

    return new Response(
      JSON.stringify({
        images: [{ url: generatedImage }],
        prompt: finalPrompt,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating images:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate images' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});