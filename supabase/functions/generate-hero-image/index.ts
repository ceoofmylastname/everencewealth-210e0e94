import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateImage as kieGenerateImage } from "../_shared/kieClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Upload generated image to Supabase Storage
 */
async function uploadToStorage(
  sourceImageUrl: string,
  supabase: any,
  bucket: string = 'article-images',
  prefix: string = 'img'
): Promise<string> {
  try {
    if (!sourceImageUrl) return sourceImageUrl;
    // Skip if already on Supabase
    if (sourceImageUrl.includes('supabase') && sourceImageUrl.includes('/storage/')) {
      return sourceImageUrl;
    }

    console.log(`📥 Downloading generated image...`);
    const imageResponse = await fetch(sourceImageUrl);
    
    if (!imageResponse.ok) {
      console.error(`❌ Failed to download image: ${imageResponse.status}`);
      return sourceImageUrl;
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedPrefix = prefix
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .substring(0, 50);
    const filename = `${sanitizedPrefix}-${timestamp}-${randomSuffix}.png`;
    
    console.log(`📤 Uploading to Supabase Storage: ${bucket}/${filename}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: false
      });
    
    if (uploadError) {
      console.error(`❌ Upload failed:`, uploadError);
      return sourceImageUrl;
    }
    
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);
    
    const supabaseUrl = publicUrlData?.publicUrl;
    
    if (supabaseUrl) {
      console.log(`✅ Image uploaded to Supabase: ${supabaseUrl}`);
      return supabaseUrl;
    }
    
    return sourceImageUrl;
    
  } catch (error) {
    console.error(`❌ Storage upload error:`, error);
    return sourceImageUrl;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!Deno.env.get('KIE_API_KEY')) {
      throw new Error('KIE_API_KEY is not configured');
    }

    // Initialize Supabase client for storage uploads
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Desktop prompt - couple on RIGHT side
    const desktopPrompt = `A photorealistic, high-end lifestyle photograph of an attractive couple in their late 50s relaxing at a luxury modern professional villa in wealth management. The couple is positioned on the RIGHT SIDE of the frame, sitting intimately together on a plush beige outdoor lounge sofa. They are holding champagne glasses and leaning into each other warmly. A champagne bottle in an ice bucket sits nearby with fruit. The villa features modern architecture with natural stone walls and large glass doors. The foreground has potted olive trees and professional plants. An infinity pool with sleek glass railing is visible, with a breathtaking panoramic view of the professional Sea and rolling hills in the background. WARM GOLDEN HOUR lighting - soft, luminous, and well-exposed with a gradient sky from soft peach to pale blue. Beige, cream, and taupe color palette. Shot in the style of Architectural Digest, 8k resolution, wide establishing shot, cinematic depth of field. IMPORTANT: Keep the LEFT side of the image clear of people - show villa architecture and landscaping there. Couple must be on the RIGHT third of the frame.`;

    // Mobile prompt - SITTING couple on terrace at SUNSET, positioned in UPPER THIRD
    const mobilePrompt = `A photorealistic, high-end lifestyle photograph of an attractive couple in their late 50s SITTING together on a plush outdoor sofa on the terrace of their luxury modern professional villa in wealth management. The couple is positioned in the UPPER THIRD of the frame, sitting close together, the man's arm around his wife. They are casually elegant in white/cream linen, holding champagne flutes, looking relaxed and content. Behind them, a stunning infinity pool with glass railing and GOLDEN SUNSET sky with warm orange-pink hues reflecting on the professional Sea. Modern villa architecture with floor-to-ceiling glass and natural stone. GOLDEN HOUR SUNSET lighting - warm, romantic, cinematic. Beige, cream, coral, and gold color palette. Shot in the style of Architectural Digest, 8k resolution, portrait composition. CRITICAL: Couple must be SITTING in the UPPER THIRD. The LOWER portion shows the terrace, pool, and sunset - NO PEOPLE in those areas.`;

    console.log('Generating hero images with Kie.ai Nano Banana 2 (4K)...');

    // Nano Banana 2 returns one image per task. Run 3 desktop + 3 mobile in parallel.
    const NUM_VARIATIONS = 3;
    const desktopPromises = Array.from({ length: NUM_VARIATIONS }, () =>
      kieGenerateImage({
        prompt: desktopPrompt,
        aspectRatio: "16:9",
        resolution: "4K",
        outputFormat: "png",
      })
    );
    const mobilePromises = Array.from({ length: NUM_VARIATIONS }, () =>
      kieGenerateImage({
        prompt: mobilePrompt,
        aspectRatio: "4:3",
        resolution: "4K",
        outputFormat: "png",
      })
    );

    const [desktopResults, mobileResults] = await Promise.all([
      Promise.all(desktopPromises),
      Promise.all(mobilePromises),
    ]);

    console.log('Desktop images generated:', desktopResults.length);
    console.log('Mobile images generated:', mobileResults.length);

    // Upload all images to Supabase Storage
    console.log('📤 Uploading images to Supabase Storage...');

    const uploadedDesktopImages = await Promise.all(
      desktopResults.map(async (r, i) => ({
        url: await uploadToStorage(r.url, supabase, 'article-images', `hero-desktop-${i}`),
      }))
    );

    const uploadedMobileImages = await Promise.all(
      mobileResults.map(async (r, i) => ({
        url: await uploadToStorage(r.url, supabase, 'article-images', `hero-mobile-${i}`),
      }))
    );

    console.log('✅ All images uploaded to Supabase Storage');

    return new Response(
      JSON.stringify({ 
        desktop: uploadedDesktopImages,
        mobile: uploadedMobileImages,
        desktopPrompt: desktopPrompt,
        mobilePrompt: mobilePrompt
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating hero image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
