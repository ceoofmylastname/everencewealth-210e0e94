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
    TOFU: `conceptual still-life: an open glass jar with a single gold coin dropping in, soft seedling growing beside it on warm marble, representing the first step into ${theme}`,
    MOFU: `conceptual still-life: a polished brass balance scale weighing a stack of gold coins against a small hourglass on a clean studio backdrop, representing trade-offs in ${theme}`,
    BOFU: `conceptual still-life: an ascending staircase of gold bars leading toward warm light, with a small brass key resting on the top step, representing the decisive path in ${theme}`,
  };
  const scene = stageScenes[(funnelStage || '').toUpperCase()] || stageScenes.MOFU;
  return `${scene}, editorial financial-magazine photography in the style of Bloomberg Businessweek and The Economist, soft directional studio light, shallow depth of field, premium materials (glass, brass, marble, wood), photorealistic, 16:9 aspect ratio, 2K resolution, no company logos, no brand names, no watermarks`;
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
            content: `You are an editorial photo director for Everence Wealth, a wealth management and insurance planning firm. Your job is to translate a financial article into a CONCEPTUAL VISUAL METAPHOR rendered as a photorealistic still-life — the kind of image you'd see opening a feature in Bloomberg Businessweek or The Economist.

## STYLE — concept-first still-life metaphor

- DO NOT default to people, advisors, families, couples, handshakes, office desks, or laptops. Those are banned unless the article is literally about a human relationship.
- Identify the core financial concept in the article (tax buckets, compounding, fees eroding growth, retirement income gap, IUL cap-and-floor, sequence-of-returns risk, estate transfer, inflation erosion, etc.).
- Translate that concept into a PHYSICAL OBJECT METAPHOR — glass jars, stacks of coins, brass scales, hourglasses, ascending staircases of bars, umbrellas, shields, safes, growing plants, dominoes, bridges over chasms, leaking vessels, melting ice, locked vaults, wax-sealed envelopes, family-tree diagrams in brass, waterfalls into vessels.
- Compose like editorial financial-magazine photography: clean studio backdrop (linen, marble, dark wood), soft directional light, shallow depth of field, premium materials (glass, brass, gold, marble, wood, leather), photorealistic.

## CONCEPT LIBRARY (pick the closest, then elaborate)

- Tax buckets / Roth vs Traditional → three glass jars filled with gold coins, etched labels "Taxable", "Tax-Deferred", "Tax-Exempt"
- Hidden fees / fee drag → coins leaking from a cracked glass jar; or a staircase with crumbling steps
- Compounding / growth → a bonsai tree growing out of a single coin; an ascending stack of polished gold bars
- Retirement income gap → a brass bridge spanning a dark chasm between two cliff edges
- IUL / cap-and-floor → an upward arrow contained between a marble floor and a glass ceiling
- Insurance protection → a brass umbrella sheltering a small house figurine; a shield over a family silhouette
- Estate planning → a wax-sealed parchment envelope beside a brass family-tree diagram
- Annuity income stream → a steady waterfall of gold coins flowing into a marble vessel
- Inflation erosion → an ice cube melting on a folded dollar bill; a shrinking balloon tied to a coin
- Sequence-of-returns risk → a chain of dominoes mid-fall across an upward stock graph
- Diversification → a wooden tray with several distinct compartments, each holding a different material (gold, silver, glass beads, seeds)
- Long-term care → a brass key beside a small house with an aging hourglass on the porch

## LABELS (allowed, sparingly)

- Short labels physically embossed, etched, printed, or stamped on objects in the scene are ALLOWED if they clarify the metaphor (e.g. "Taxable" etched on a glass jar, "IRS" stamped on a wax seal).
- Max ~3 words per label. Max 4 labels in the whole frame. No paragraph text.

## STRICTLY FORBIDDEN

- Company logos, brand wordmarks, watermarks, signatures, photographer credits, stock-photo marks, headlines, paragraph text, captions.
- Named competitors: Apex, Ascend, Ameriprise, Edward Jones, Fidelity, Vanguard, Schwab, Merrill, Morgan Stanley, Raymond James, LPL, Northwestern Mutual, Prudential, MassMutual, John Hancock, Lincoln, Allianz, Pacific Life, Nationwide, MetLife, New York Life, Transamerica, AIG, Mutual of Omaha — and ANY other firm/competitor logo or wordmark.
- People as the primary subject (humans may appear only as small silhouettes or figurines if the metaphor calls for it).

## OUTPUT

Output ONLY the image prompt as a single paragraph. Specify the metaphor, physical materials, lighting, composition, and end with "16:9 aspect ratio, photorealistic editorial still-life, 2K resolution".`
          },
          {
            role: 'user',
            content: `Create a conceptual still-life metaphor prompt for this article. First identify the core financial concept, then choose the best physical metaphor from the library (or invent a comparable one), then describe materials, lighting, and composition:\n\n${contentForAnalysis}`
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

    // Hard-append negative constraints so Kie.ai cannot hallucinate brand marks.
    // NOTE: We intentionally allow short physical labels on objects (e.g. "Taxable" etched on a jar)
    // so the negative suffix bans branding/headlines but NOT all letters.
    const negativeSuffix = ' --no company logos, no brand names, no wordmarks, no watermarks, no signatures, no photographer credits, no headlines, no paragraph text, no captions, no stock-photo marks';
    const alreadyHasNegative = /no\s+(company\s+)?logos?\b/i.test(imagePrompt)
      || /no\s+brand(\s+names?)?\b/i.test(imagePrompt)
      || /no\s+watermarks?\b/i.test(imagePrompt);
    if (!alreadyHasNegative) imagePrompt = `${imagePrompt}${negativeSuffix}`;

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
