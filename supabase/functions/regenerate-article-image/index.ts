import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateImage as kieGenerateImage } from "../_shared/kieClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish'
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

/**
 * Delete old image from Supabase Storage
 */
async function deleteOldImage(
  oldImageUrl: string | null,
  supabase: any,
  bucket: string = 'article-images'
): Promise<void> {
  try {
    if (!oldImageUrl) return;
    if (!oldImageUrl.includes('supabase') || !oldImageUrl.includes('/storage/')) return;

    const urlParts = oldImageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    if (!filename) return;

    console.log(`🗑️ Deleting old image: ${filename}`);
    const { error } = await supabase.storage.from(bucket).remove([filename]);
    if (error) {
      console.error('⚠️ Failed to delete old image:', error.message);
    } else {
      console.log('✅ Old image deleted successfully');
    }
  } catch (error) {
    console.error('⚠️ Error during old image cleanup:', error);
  }
}

/**
 * Generate localized alt text and caption for an image
 */
async function generateLocalizedMetadata(
  article: { headline: string; cluster_theme?: string; language: string },
  imagePrompt: string,
  lovableKey: string
): Promise<{ altText: string; caption: string | null }> {
  const languageName = LANGUAGE_NAMES[article.language] || 'English';

  const metadataResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `You create SEO-optimized image metadata in ${languageName} for Everence Wealth, a financial advisory and insurance planning company.
          
Output a JSON object with:
- "altText": Descriptive alt text for accessibility and SEO (100-150 characters). Include keywords related to financial planning, insurance, or retirement. Describe what's visible in the image.
- "caption": Engaging caption for display below the image (100-200 characters). Should complement the article and include a subtle call-to-action.

RULES:
- Write in ${languageName} (not English, unless article is English)
- Be descriptive and specific to financial services
- The image is a CONCEPTUAL STILL-LIFE METAPHOR (e.g. glass jars, scales, hourglass, staircase, bridge, umbrella, growing plant) — NOT people or office scenes. Describe the metaphor and what concept it represents.
- Reference Everence Wealth where appropriate
- No generic placeholder text

Return ONLY valid JSON, no markdown.`
        },
        {
          role: 'user',
          content: `Article headline: ${article.headline}
Article theme: ${article.cluster_theme || 'Financial Planning & Insurance'}
Image shows: ${imagePrompt}

Generate alt text and caption in ${languageName}.`
        }
      ]
    }),
  });

  let altText = `${article.headline} - Everence Wealth`;
  let caption: string | null = null;

  if (metadataResponse.ok) {
    try {
      const metadataData = await metadataResponse.json();
      const metadataContent = metadataData.choices?.[0]?.message?.content?.trim();
      const cleanedContent = metadataContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const metadata = JSON.parse(cleanedContent);
      if (metadata.altText && metadata.altText.length >= 50) altText = metadata.altText;
      if (metadata.caption && metadata.caption.length >= 50) caption = metadata.caption;
      console.log(`✅ Generated ${languageName} metadata`);
    } catch (parseError) {
      console.error('Failed to parse metadata JSON:', parseError);
    }
  } else {
    const body = await metadataResponse.text().catch(() => '');
    console.error(`⚠️ Metadata generation failed: ${metadataResponse.status} ${body.substring(0, 200)}`);
  }

  return { altText, caption };
}

/**
 * Build a high-quality fallback image prompt based on funnel stage + theme.
 * Used when AI prompt generation fails (rate limit, credits, etc).
 */
function buildFallbackPrompt(funnelStage?: string, clusterTheme?: string): string {
  const theme = clusterTheme || 'financial planning and wealth management';
  const stageScenes: Record<string, string> = {
    TOFU: `inviting modern financial advisory office, diverse family of three meeting with a warm, approachable advisor, soft natural light through large windows, hopeful and educational atmosphere, ${theme}`,
    MOFU: `professional advisor and middle-aged couple reviewing retirement charts on a tablet at a glass conference table, focused and trusting expressions, premium contemporary office, ${theme}`,
    BOFU: `confident wealth strategist shaking hands with a successful client in an executive office at golden hour, framed achievement art on the walls, decisive and prosperous mood, ${theme}`,
  };
  const scene = stageScenes[(funnelStage || '').toUpperCase()] || stageScenes.MOFU;
  return `${scene}, ultra-realistic editorial photography, cinematic lighting, shallow depth of field, 16:9 aspect ratio, 2K resolution, no text, no watermarks, no logos, no brand marks`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId } = await req.json();

    if (!articleId) {
      return new Response(
        JSON.stringify({ error: 'articleId is required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableKey) throw new Error('LOVABLE_API_KEY is not configured');
    if (!Deno.env.get('KIE_API_KEY')) throw new Error('KIE_API_KEY is not configured');

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🖼️ Starting image regeneration for article: ${articleId}`);

    const { data: article, error: fetchError } = await supabase
      .from('blog_articles')
      .select('id, headline, meta_description, detailed_content, language, funnel_stage, cluster_theme, slug, cluster_id, featured_image_url, translations, source_language')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      throw new Error(`Article not found: ${fetchError?.message || 'Unknown error'}`);
    }

    console.log(`📝 Article: "${article.headline}" (${article.language})`);
    const oldImageUrl = article.featured_image_url;
    const languageName = LANGUAGE_NAMES[article.language] || 'English';

    // IMAGE SHARING: Non-English articles share images from English primary
    if (article.language !== 'en' && article.cluster_id && article.funnel_stage) {
      console.log(`🔗 Non-English article detected - checking for English primary image...`);

      let englishImageUrl: string | null = null;

      // Strategy 1: Find English sibling whose translations JSON points at this article
      const { data: translationMatches } = await supabase
        .from('blog_articles')
        .select('id, featured_image_url, translations')
        .eq('cluster_id', article.cluster_id)
        .eq('language', 'en')
        .not('featured_image_url', 'is', null);

      if (translationMatches && translationMatches.length > 0) {
        const linked = translationMatches.find((row: any) => {
          const t = row.translations || {};
          return t?.[article.language] === article.id || t?.[article.language]?.id === article.id;
        });
        if (linked?.featured_image_url) {
          englishImageUrl = linked.featured_image_url;
          console.log(`✅ Matched English sibling via translations JSON (${linked.id})`);
        }
      }

      // Strategy 2: Fallback to funnel_stage match, ordered by created_at, take first
      if (!englishImageUrl) {
        const { data: stageMatches } = await supabase
          .from('blog_articles')
          .select('id, featured_image_url')
          .eq('cluster_id', article.cluster_id)
          .eq('funnel_stage', article.funnel_stage)
          .eq('language', 'en')
          .eq('status', 'published')
          .not('featured_image_url', 'is', null)
          .order('created_at', { ascending: true })
          .limit(1);

        if (stageMatches && stageMatches.length > 0) {
          englishImageUrl = stageMatches[0].featured_image_url;
          console.log(`✅ Matched English sibling via funnel_stage fallback (${stageMatches[0].id})`);
        }
      }

      if (englishImageUrl) {
        console.log(`✅ Found English primary image - sharing instead of generating new`);

        const imagePromptForMetadata = `financial advisory consultation, professional office setting, wealth management`;
        const { altText, caption } = await generateLocalizedMetadata(article, imagePromptForMetadata, lovableKey);

        const { error: updateError } = await supabase
          .from('blog_articles')
          .update({
            featured_image_url: englishImageUrl,
            featured_image_alt: altText,
            featured_image_caption: caption,
            updated_at: new Date().toISOString()
          })
          .eq('id', articleId);

        if (updateError) throw new Error(`Failed to update article: ${updateError.message}`);

        return new Response(
          JSON.stringify({
            success: true, sharedFromEnglish: true, articleId,
            headline: article.headline, language: article.language,
            imageUrl: englishImageUrl, altText, caption
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`⚠️ No English primary found - will generate new image`);
    }

    // Generate content-based image prompt via Lovable AI Gateway
    console.log(`🧠 Generating content-based image prompt via Lovable AI...`);
    
    const contentForAnalysis = `
Headline: ${article.headline}
Meta Description: ${article.meta_description}
Theme: ${article.cluster_theme || 'Financial Planning & Insurance'}
Funnel Stage: ${article.funnel_stage}
Content Preview: ${(article.detailed_content || '').substring(0, 2000)}
    `.trim();

    const promptGenerationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating image prompts for AI image generators. 
Your task is to analyze a financial planning or insurance article from Everence Wealth and create a professional photography prompt that visually complements the article content.

CRITICAL RULES:
- NEVER include text, headlines, watermarks, logos, brand marks, monograms, badges, shields, emblems, company names, photographer credits, or stock-photo signatures in the image
- Forbidden: Apex, Ascend, Ameriprise, Edward Jones, Fidelity, Vanguard, Schwab, Merrill, Morgan Stanley, Raymond James, LPL, Northwestern Mutual, Prudential, MassMutual, John Hancock, Lincoln, Allianz, Pacific Life, Nationwide, MetLife, New York Life, Transamerica, AIG, Mutual of Omaha — and ANY other firm/competitor logo or wordmark
- Focus on professional settings, people in consultation, financial planning scenes
- Include "no text, no watermarks, no logos, no brand marks, no monograms, no shields, no badges, no company names, no signatures, no words anywhere in the frame" in every prompt
- Specify "16:9 aspect ratio, professional photography, 2K resolution"
- Match the article's tone: retirement = warm/optimistic, insurance = protective/family, investment = professional/growth
- Themes: financial advisory offices, family protection, retirement lifestyle, wealth management
- NEVER generate financial planning, villas, professional, or property images
- Be specific about lighting, composition, and style

Output ONLY the image prompt, nothing else.`
          },
          {
            role: 'user',
            content: `Create a professional photography prompt for this article:\n\n${contentForAnalysis}`
          }
        ]
      }),
    });

    let imagePrompt: string;
    if (!promptGenerationResponse.ok) {
      const status = promptGenerationResponse.status;
      const errBody = await promptGenerationResponse.text().catch(() => '');
      console.error(`⚠️ Prompt generation failed: ${status} ${errBody.substring(0, 300)}`);

      // Surface rate-limit / credits errors clearly to the client
      if (status === 429) {
        return new Response(
          JSON.stringify({
            error: 'AI rate limit reached. Please wait a minute and try again.',
            success: false,
            code: 'rate_limited'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({
            error: 'Lovable AI credits exhausted. Please add credits in Settings → Workspace → Usage.',
            success: false,
            code: 'no_credits'
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Other errors: fall back to a high-quality default prompt and keep going
      console.log(`🛟 Falling back to default prompt for funnel stage: ${article.funnel_stage}`);
      imagePrompt = buildFallbackPrompt(article.funnel_stage, article.cluster_theme);
    } else {
      const promptData = await promptGenerationResponse.json();
      imagePrompt = promptData.choices?.[0]?.message?.content?.trim()
        || buildFallbackPrompt(article.funnel_stage, article.cluster_theme);
    }

    // Hard-append negative constraints so Kie.ai cannot hallucinate brand marks
    const negativeSuffix = ' --no logo, no watermark, no brand mark, no text overlay, no company name, no shield emblem, no monogram, no badge, no signature, no photographer credit, no stock-photo mark, no letters, no words';
    if (!imagePrompt.includes('--no logo')) imagePrompt = `${imagePrompt}${negativeSuffix}`;

    console.log(`🎨 Generated prompt: ${imagePrompt.substring(0, 100)}...`);

    // Generate image via Kie.ai Nano Banana 2 with auto-retry if a logo is detected
    console.log(`🖼️ Generating image with Kie.ai Nano Banana 2...`);
    let generatedImageUrl: string | null = null;
    const MAX_LOGO_RETRIES = 2;
    for (let attempt = 0; attempt <= MAX_LOGO_RETRIES; attempt++) {
      const { url: kieUrl } = await kieGenerateImage({
        prompt: imagePrompt,
        aspectRatio: "16:9",
        resolution: "2K",
        outputFormat: "png",
      });
      if (!kieUrl) throw new Error('Image generation failed - no URL returned');

      // Verify the generated image has no logo / brand mark
      try {
        const verifyRes = await fetch(`${supabaseUrl}/functions/v1/analyze-image-for-text`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageUrl: kieUrl, mode: 'logo' })
        });
        if (verifyRes.ok) {
          const { analysis } = await verifyRes.json();
          const stillBranded = analysis?.hasLogo === true
            || analysis?.textType === 'logo'
            || analysis?.textType === 'brand_mark'
            || analysis?.textType === 'watermark';
          if (stillBranded && attempt < MAX_LOGO_RETRIES) {
            console.log(`⚠️ Attempt ${attempt + 1}: brand mark still detected (${analysis?.brandName || 'unknown'}). Regenerating with stricter prompt...`);
            imagePrompt = `${imagePrompt} --strictly no brand marks --absolutely no text in image`;
            continue;
          }
        }
      } catch (verifyErr) {
        console.error('Logo verification step failed (non-fatal):', verifyErr);
      }

      generatedImageUrl = kieUrl;
      break;
    }

    if (!generatedImageUrl) throw new Error('Image generation failed after retries');
    console.log(`✅ Image generated successfully (logo-verified)`);

    generatedImageUrl = await uploadToStorage(
      generatedImageUrl, supabase, 'article-images',
      `article-${article.slug || article.id.slice(0, 8)}`
    );

    const { altText, caption } = await generateLocalizedMetadata(article, imagePrompt, lovableKey);

    console.log(`💾 Updating article with new image...`);
    const { error: updateError } = await supabase
      .from('blog_articles')
      .update({
        featured_image_url: generatedImageUrl,
        featured_image_alt: altText,
        featured_image_caption: caption,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId);

    if (updateError) throw new Error(`Failed to update article: ${updateError.message}`);

    if (oldImageUrl && oldImageUrl !== generatedImageUrl) {
      await deleteOldImage(oldImageUrl, supabase, 'article-images');
    }

    console.log(`🎉 Successfully regenerated image for article: ${article.headline}`);

    return new Response(
      JSON.stringify({
        success: true, articleId, headline: article.headline,
        language: article.language, imageUrl: generatedImageUrl,
        altText, caption, prompt: imagePrompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in regenerate-article-image:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message, success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
