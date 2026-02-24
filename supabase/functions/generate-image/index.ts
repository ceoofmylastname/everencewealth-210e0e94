import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fal } from "https://esm.sh/@fal-ai/client@1.2.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DIMENSION_MAP: Record<string, { width: number; height: number }> = {
  '1:1':  { width: 2048, height: 2048 },
  '16:9': { width: 3840, height: 2160 },
  '9:16': { width: 2160, height: 3840 },
  '4:1':  { width: 3840, height: 960 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) {
      throw new Error('FAL_KEY is not configured');
    }
    fal.config({ credentials: falKey });

    const { prompt, headline, content, imageUrl, dimensions } = await req.json();

    let finalPrompt: string;

    if (prompt) {
      finalPrompt = prompt;
    } else if (headline) {
      // Use Lovable AI to generate a content-specific prompt
      const apiKey = Deno.env.get('LOVABLE_API_KEY');
      const contentSnippet = content ? content.substring(0, 1500) : '';

      if (apiKey) {
        try {
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
- End with: "ultra-realistic, 4K resolution, crisp sharp details, professional photography, no text, no watermarks"
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

          if (promptGenResponse.ok) {
            const promptData = await promptGenResponse.json();
            finalPrompt = promptData.choices?.[0]?.message?.content?.trim() ||
              `Professional financial advisory scene illustrating "${headline}", ultra-realistic, 4K resolution, crisp details, no text, no watermarks`;
          } else {
            finalPrompt = `Professional financial advisory scene illustrating "${headline}", modern office setting, warm lighting, ultra-realistic, 4K resolution, crisp sharp details, professional photography, no text, no watermarks`;
          }
        } catch {
          finalPrompt = `Professional financial advisory scene illustrating "${headline}", ultra-realistic, 4K resolution, crisp sharp details, no text, no watermarks`;
        }
      } else {
        finalPrompt = `Professional financial advisory scene illustrating "${headline}", ultra-realistic, 4K resolution, crisp sharp details, no text, no watermarks`;
      }

      console.log('AI-generated image prompt:', finalPrompt);
    } else {
      finalPrompt = 'Professional financial advisory consultation, modern office, warm lighting, ultra-realistic, 4K resolution, crisp sharp details, no text, no watermarks';
    }

    // Resolve dimensions
    const imageSize = DIMENSION_MAP[dimensions || '1:1'] || DIMENSION_MAP['1:1'];

    console.log('Generating image with Fal.ai nano-banana-pro:', { promptLength: finalPrompt.length, imageSize });

    let result: any;

    if (imageUrl) {
      // Image-to-image editing
      result = await fal.subscribe("fal-ai/nano-banana-pro/image-to-image", {
        input: {
          prompt: finalPrompt,
          image_url: imageUrl,
          negative_prompt: "blurry, low quality, pixelated, text, watermark, logo, distorted, noisy, grainy, out of focus",
          image_size: imageSize,
          num_images: 1,
          num_inference_steps: 40,
          guidance_scale: 7.5,
          strength: 0.75,
        },
      });
    } else {
      // Text-to-image generation
      result = await fal.subscribe("fal-ai/nano-banana-pro", {
        input: {
          prompt: finalPrompt,
          negative_prompt: "blurry, low quality, pixelated, text, watermark, logo, distorted, noisy, grainy, out of focus",
          image_size: imageSize,
          num_images: 1,
          num_inference_steps: 40,
          guidance_scale: 7.5,
        },
      });
    }

    const generatedImageUrl = result?.data?.images?.[0]?.url;

    if (!generatedImageUrl) {
      console.error('Fal.ai response:', JSON.stringify(result));
      throw new Error('No image returned from Fal.ai');
    }

    console.log('Image generated successfully:', generatedImageUrl.substring(0, 80));

    return new Response(
      JSON.stringify({
        images: [{ url: generatedImageUrl }],
        prompt: finalPrompt,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating images:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate images';
    const status = message.includes('rate') || message.includes('Rate') ? 429 : 500;
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status,
      }
    );
  }
});
