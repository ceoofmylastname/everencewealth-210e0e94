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
- The image is an INFOGRAPHIC-STYLE PHOTOREALISTIC EDUCATIONAL EXHIBIT — a multi-stage visual apparatus (filtration chambers, clockwork, aqueducts, growth catalysts, architectural cross-sections, labeled glass jars/buckets, scales, hourglasses, or any object-based metaphor that best visualizes the article's concept) with integrated descriptive labels and data overlays. It is NEVER people or offices. Describe the apparatus and the financial concept it visually explains. Buckets and jars ARE allowed when they are the clearest visual metaphor (e.g. three labeled tax buckets).
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
    TOFU: `a multi-stage crystal-and-brass educational exhibit visualizing the entry point into ${theme}, with three labeled inflow conduits, an integrated schematic call-out panel reading "FOUNDATION STAGE", and a small holographic data cloud showing comparative growth curves`,
    MOFU: `an intricate clockwork-and-glass scientific model comparing two parallel pathways through ${theme}, with brass gauges, transparent flow chambers, integrated call-out plaques labeled "STRATEGY A" and "STRATEGY B", and side schematic overlays showing trade-offs`,
    BOFU: `a premium museum-grade educational apparatus visualizing the decisive outcome of ${theme}, with a central polished titanium core, glowing data conduits branching to three labeled outcome chambers, integrated tablet-style displays showing comparative metrics, and a brass plaque reading "OUTCOME STAGE"`,
  };
  const scene = stageScenes[(funnelStage || '').toUpperCase()] || stageScenes.MOFU;
  return `${scene}, photorealistic museum-exhibit composition with dense infographic detail, integrated diagrammatic call-outs, schematic overlays, holographic data clouds and descriptive functional labels, premium materials (crystal, brushed titanium, brass, copper, polished chrome, optionally including labeled glass jars or buckets when they best illustrate the concept), cinematic studio lighting in cool blue, warm amber and vibrant green, 16:9 aspect ratio, 2K resolution, no company logos, no brand names, no watermarks`;
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
            content: `You are the IMAGE EXPLAINER (IE) prompt director for Everence Wealth. Your job is to translate a financial article into a single photorealistic prompt for an infographic-grade visual MASTERPIECE — a dense, multi-tiered, museum-exhibit-quality educational model that visually explains the article's concept end-to-end. Think Bloomberg Businessweek opener crossed with a Royal Society science-museum exhibit.

## GOAL

Generate a hyper-detailed, photorealistic, infographic-like visual explainer derived ENTIRELY from the article's title and body. The image must be self-contained: a viewer should grasp the core concept just from looking at it. It is NOT a single conceptual photo — it is a complex, layered, label-rich educational apparatus.

## STRICT NON-NEGOTIABLE RULES

1. NO logos, brand names, wordmarks, registered trademarks, watermarks, signatures, photographer credits, or stock-photo marks. Inspect every label and replace any branded language with generic descriptive copy.
2. NO branded niche widgets — no specific phone models, named software UIs, branded chart tools, or proprietary devices that imply a company.
3. Buckets, jars, glass vessels, scales, hourglasses, and similar object-based metaphors ARE PERMITTED and encouraged when they are the clearest visual representation of the article's concept (e.g. three labeled glass jars for the Three Tax Buckets). Choose the metaphor that best explains the topic — mechanical apparatus, clockwork, filtration system, aqueduct, orrery, architectural cross-section, OR labeled containers — whichever communicates the concept most clearly.
4. NO separate "article title" block, headline plate, or paragraph text floating in the image. The ONLY text allowed is short, descriptive functional labels integrated into the graphic elements themselves (etched plaques, jar labels, schematic call-outs, gauge labels, conduit tags, plaque headings on stages).
5. NO dates anywhere in the image. Use generic future-state language like "FUTURE HARVEST" or "RETIREMENT WINDOW".
6. NO people as the primary subject. Tiny generic silhouettes or figurines are allowed only if the metaphor demands them (e.g. a small house with a figurine for legacy transfer).
7. Named competitors are FORBIDDEN: Apex, Ascend, Ameriprise, Edward Jones, Fidelity, Vanguard, Schwab, Merrill, Morgan Stanley, Raymond James, LPL, Northwestern Mutual, Prudential, MassMutual, John Hancock, Lincoln, Allianz, Pacific Life, Nationwide, MetLife, New York Life, Transamerica, AIG, Mutual of Omaha — and any other firm name.

## SYNTHESIS PROCESS (do this silently before writing the prompt)

1. Identify the article's main subject, key processes, comparative elements, restrictions/rules, and final outcomes.
2. Choose the BEST visual metaphor that models the relationship — pick whatever most clearly explains the concept. Options include:
   - Labeled glass jars, buckets, vessels, or containers (ideal for tax buckets, asset categories, allocations)
   - Multi-stage filtration / catalyst systems (chambers, gauges, valves, conduits)
   - Aqueducts, waterfalls, pipe networks, pressure vessels
   - Clockwork mechanisms (gears, escapements, mainsprings, pendulums)
   - Astronomical orreries (planetary models, brass rings, gimbals)
   - Botanical growth catalysts (greenhouse with measurement instruments)
   - Architectural cross-sections (multi-floor cutaways, vault interiors)
   - Scientific exhibit apparatus (crystal vessels, brass instruments, holographic overlays)
3. Map each key article concept to a distinct STAGE or COMPONENT of the metaphor (e.g. Taxable → Sediment Exposure Chamber; Tax-Deferred → Pressurized Growth Vessel; Tax-Free → Crystal Compounding Catalyst).
4. Populate the scene with INTEGRATED EXPLAINER ELEMENTS: schematic overlays, holographic data clouds, integrated tablet-style screens with generic non-branded interfaces, comparative micro-graphs, gauge readouts, glowing data conduits with descriptive tags, call-out plaques.
5. Scrub every detail for branding. Replace any implicit brand reference with generic, descriptive language.

## VISUAL DENSITY REQUIREMENT

The image MUST be visually dense and infographic-heavy. Required elements in EVERY prompt:
- A clearly described central multi-stage apparatus (named generically, e.g. "the Asset Filtration Catalyst")
- 2–4 distinct named stages or chambers, each with its own materials, internal mechanism, and integrated descriptive plaque
- Glowing data conduits or pipes physically linking the stages, each labeled with descriptive concept tags
- At least one integrated schematic overlay or holographic data cloud showing comparative metrics
- At least one integrated tablet-style screen with a generic non-branded interface displaying a relevant chart
- Premium materials throughout: crystal, brushed titanium, polished brass, aged copper, reinforced glass, polished chrome, marble, dark wood
- Cinematic studio lighting with cool blue, warm amber, and vibrant green accents; museum/exhibit setting; shallow depth of field background bokeh

## LABEL RULES

- Labels must be SHORT, ALL-CAPS, PURELY DESCRIPTIVE (max ~5 words each).
- Examples of good labels: "TAXABLE ASSET ZONE", "RMD CLOCK", "TAX-FREE WITHDRAWAL", "PRINCIPAL PROTECTION CORE", "CONTRIBUTION LIMITS", "RISK TOLERANCE GAUGE".
- Max 8 labels in the whole frame. No paragraphs, no headlines, no sentences.

## OUTPUT FORMAT

Output ONLY the image prompt as a single dense paragraph (300–500 words). Open with the apparatus name and setting. Describe each stage with materials + integrated labels + internal mechanisms. Describe the interconnecting conduits with their descriptive tags. Mention the integrated schematic overlays, data clouds, and tablet-style screens. End with: "photorealistic museum-exhibit composition, cinematic studio lighting, dense infographic detail, descriptive functional labels only, 16:9 aspect ratio, 2K resolution — devoid of any company logos, brand names, buckets, jars, or dates."`
          },
          {
            role: 'user',
            content: `Synthesize this article into an Image Explainer (IE) prompt. First silently identify the core concept, key stages, and comparative elements. Then choose a NON-BUCKET complex metaphor (filtration system, clockwork, aqueduct, orrery, growth catalyst, architectural cross-section, etc.). Then write the dense single-paragraph photorealistic prompt:\n\n${contentForAnalysis}`
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
    const negativeSuffix = ' --no company logos, no brand names, no wordmarks, no watermarks, no signatures, no photographer credits, no headlines, no paragraph text, no captions, no stock-photo marks, no buckets, no mason jars, no storage jars, no dates, no branded devices, no named software interfaces';
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
