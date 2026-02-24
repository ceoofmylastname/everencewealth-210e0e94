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
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-lite',
              messages: [
                { role: 'system', content: `You are an expert at writing image generation prompts for financial advisory blog articles. Given an article headline and optional content, create a single detailed prompt for a photorealistic image. Rules: specific to the topic, professional warm tones, end with "ultra-realistic, 4K resolution, crisp sharp details, professional photography, no text, no watermarks". Return ONLY the prompt text.` },
                { role: 'user', content: `Article headline: "${headline}"${contentSnippet ? `\n\nContent excerpt:\n${contentSnippet}` : ''}` }
              ],
            }),
          });
          if (promptGenResponse.ok) {
            const promptData = await promptGenResponse.json();
            finalPrompt = promptData.choices?.[0]?.message?.content?.trim() ||
              `Professional financial advisory scene illustrating "${headline}", ultra-realistic, 4K resolution, crisp details, no text, no watermarks`;
          } else {
            finalPrompt = `Professional financial advisory scene illustrating "${headline}", ultra-realistic, 4K resolution, crisp sharp details, no text, no watermarks`;
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

    // IMAGE EDITING via Lovable AI Gateway (supports image-to-image)
    if (imageUrl) {
      const apiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!apiKey) throw new Error('LOVABLE_API_KEY is not configured');

      console.log('Editing image with Lovable AI Gateway:', { promptLength: finalPrompt.length });

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-3-pro-image-preview',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: `${finalPrompt}. IMPORTANT: Output the image at the highest possible resolution, at least 4K quality. Maintain all original details, sharpness and clarity. The result must be ultra-crisp, not blurry or degraded.` },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }],
          modalities: ['image', 'text'],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image edit error:', errorText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again shortly.' }), {
            status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error(`Image editing failed: ${response.status}`);
      }

      const data = await response.json();
      const editedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!editedImageUrl) throw new Error('No edited image returned');

      return new Response(
        JSON.stringify({ images: [{ url: editedImageUrl }], prompt: finalPrompt }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // IMAGE GENERATION via Fal.ai nano-banana-pro
    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) throw new Error('FAL_KEY is not configured');
    fal.config({ credentials: falKey });

    const imageSize = DIMENSION_MAP[dimensions || '1:1'] || DIMENSION_MAP['1:1'];
    console.log('Generating image with Fal.ai nano-banana-pro:', { promptLength: finalPrompt.length, imageSize });

    const result = await fal.subscribe("fal-ai/nano-banana-pro", {
      input: {
        prompt: finalPrompt,
        negative_prompt: "blurry, low quality, pixelated, text, watermark, logo, distorted, noisy, grainy, out of focus",
        image_size: imageSize,
        num_images: 1,
        num_inference_steps: 40,
        guidance_scale: 7.5,
      },
    });

    const generatedImageUrl = result?.data?.images?.[0]?.url;
    if (!generatedImageUrl) {
      console.error('Fal.ai response:', JSON.stringify(result));
      throw new Error('No image returned from Fal.ai');
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ images: [{ url: generatedImageUrl }], prompt: finalPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error generating images:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate images';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
