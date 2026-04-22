import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateImage as kieGenerateImage, type KieAspectRatio } from "../_shared/kieClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMAGE_CONFIGS = [
  {
    key: 'about',
    aspect_ratio: '4:3',
    prompt: 'A photorealistic editorial photograph of a professional financial advisor in a tailored navy suit reviewing retirement plans with an affluent client couple in their 50s, seated at a polished conference table in a modern glass-walled office. Warm golden ambient lighting, shallow depth of field, natural expressions. Bookshelves with leather-bound volumes visible in the background. Shot in the style of Bloomberg Businessweek editorial photography, 8k resolution.',
  },
  {
    key: 'services',
    aspect_ratio: '16:9',
    prompt: 'A wide cinematic establishing shot of a premium wealth management office interior. Warm ambient lighting from brass desk lamps, floor-to-ceiling bookshelves with leather-bound volumes, a large mahogany desk with a green banker lamp. Panoramic floor-to-ceiling windows revealing a twilight city skyline with golden lights. Rich tones of deep green, warm wood, and brass. Architectural Digest style, 8k resolution, ultra-detailed.',
  },
  {
    key: 'philosophy',
    aspect_ratio: '16:9',
    prompt: 'Aerial golden-hour photograph of a modern financial district skyline. Dramatic clouds painted in warm orange and gold tones. Glass skyscrapers reflecting the sunset light. A river or harbor visible below with city lights beginning to emerge. Cinematic composition, ultra high resolution, professional architectural photography.',
  },
  {
    key: 'cta',
    aspect_ratio: '16:9',
    prompt: 'A photorealistic lifestyle photograph of a happy retired couple in their 60s walking barefoot along a pristine beach at golden hour sunset. They are holding hands, dressed in casual elegant linen clothing in cream and white tones. Warm golden light, soft ocean waves, a serene and aspirational mood. Shot in the style of luxury lifestyle brand photography, 8k resolution.',
  },
  {
    key: 'assessment',
    aspect_ratio: '16:9',
    prompt: 'A photorealistic close-up photograph of hands reviewing financial documents spread on a premium mahogany desk. A Mont Blanc pen, reading glasses, and a crystal paperweight are visible. Warm directional lighting from a desk lamp creates elegant shadows. Shallow depth of field, rich wood tones, professional and sophisticated atmosphere. Editorial style, 8k resolution.',
  },
];

async function uploadToStorage(
  sourceImageUrl: string,
  supabase: any,
  key: string
): Promise<string> {
  try {
    if (!sourceImageUrl) return sourceImageUrl;
    console.log(`📥 Downloading image for "${key}"...`);
    const imageResponse = await fetch(sourceImageUrl);
    if (!imageResponse.ok) {
      console.error(`❌ Failed to download: ${imageResponse.status}`);
      return sourceImageUrl;
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const timestamp = Date.now();
    const filename = `homepage-${key}-${timestamp}.png`;

    console.log(`📤 Uploading to article-images/${filename}`);
    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      console.error(`❌ Upload failed:`, uploadError);
      return sourceImageUrl;
    }

    const { data: publicUrlData } = supabase.storage
      .from('article-images')
      .getPublicUrl(filename);

    return publicUrlData?.publicUrl || sourceImageUrl;
  } catch (error) {
    console.error(`❌ Storage error for "${key}":`, error);
    return sourceImageUrl;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!Deno.env.get('KIE_API_KEY')) throw new Error('KIE_API_KEY is not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: Record<string, { url: string; prompt: string }> = {};

    for (const config of IMAGE_CONFIGS) {
      console.log(`🎨 Generating image for "${config.key}"...`);
      try {
        const { url } = await kieGenerateImage({
          prompt: config.prompt,
          aspectRatio: config.aspect_ratio as KieAspectRatio,
          resolution: "2K",
          outputFormat: "png",
        });

        if (url) {
          const permanentUrl = await uploadToStorage(url, supabase, config.key);
          results[config.key] = { url: permanentUrl, prompt: config.prompt };
          console.log(`✅ "${config.key}" done: ${permanentUrl.substring(0, 80)}...`);
        }
      } catch (imgError) {
        console.error(`❌ Failed to generate "${config.key}":`, imgError);
      }
    }

    // Upsert all into homepage_images
    for (const [key, data] of Object.entries(results)) {
      const { error } = await supabase
        .from('homepage_images')
        .upsert(
          { section_key: key, image_url: data.url, prompt: data.prompt },
          { onConflict: 'section_key' }
        );
      if (error) console.error(`❌ Upsert failed for "${key}":`, error);
      else console.log(`💾 Upserted "${key}" into homepage_images`);
    }

    return new Response(
      JSON.stringify({ success: true, generated: Object.keys(results) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
