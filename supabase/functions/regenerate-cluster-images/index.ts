import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language names for localized metadata generation (EN + ES only)
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish'
};

/**
 * Retry wrapper for database updates with exponential backoff
 */
async function retryableUpdate(
  supabase: any,
  id: string,
  updates: Record<string, any>,
  maxRetries: number = 3
): Promise<{ success: boolean; error?: any }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await supabase
        .from('blog_articles')
        .update(updates)
        .eq('id', id);
      
      if (!error) return { success: true };
      
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed for ${id}:`, error.message);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
      }
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} threw for ${id}:`, err);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
      }
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

/**
 * Upload a base64 image to Supabase Storage
 */
async function uploadBase64ToStorage(
  base64Data: string,
  supabase: any,
  bucket: string,
  prefix: string
): Promise<string | null> {
  try {
    // Strip data URI prefix if present
    const raw = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const binaryStr = atob(raw);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedPrefix = prefix.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50);
    const filename = `${sanitizedPrefix}-${timestamp}-${randomSuffix}.png`;

    console.log(`📤 Uploading to storage: ${bucket}/${filename}`);
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, bytes, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: false
      });

    if (uploadError) {
      console.error(`❌ Upload failed:`, uploadError);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return publicUrlData?.publicUrl || null;
  } catch (error) {
    console.error(`❌ Storage upload error:`, error);
    return null;
  }
}

/**
 * Upload image from URL to Supabase Storage
 */
async function uploadUrlToStorage(
  imageUrl: string,
  supabase: any,
  bucket: string,
  prefix: string
): Promise<string> {
  try {
    if (!imageUrl) return imageUrl;

    console.log(`📥 Downloading image...`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`❌ Failed to download image: ${imageResponse.status}`);
      return imageUrl;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedPrefix = prefix.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50);
    const filename = `${sanitizedPrefix}-${timestamp}-${randomSuffix}.png`;

    console.log(`📤 Uploading to storage: ${bucket}/${filename}`);
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: false
      });

    if (uploadError) {
      console.error(`❌ Upload failed:`, uploadError);
      return imageUrl;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return publicUrlData?.publicUrl || imageUrl;
  } catch (error) {
    console.error(`❌ Storage upload error:`, error);
    return imageUrl;
  }
}

/**
 * Use Lovable AI to extract a hyper-specific image prompt from article content
 */
async function extractImagePrompt(
  articleContent: string,
  headline: string,
  lovableApiKey: string
): Promise<string> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You create image generation prompts for a financial advisory company (Everence Wealth). 
Read the article content and create ONE highly specific, visual image prompt that captures the core concept.

RULES:
- Focus on the specific financial concept (e.g., "tax-free retirement buckets", "IUL cash value growth curve", "estate planning generational wealth transfer")
- Include specific visual elements from the article content
- Professional, modern, clean aesthetic
- No text, no watermarks, no logos
- 16:9 aspect ratio, marketing quality
- Keep prompt under 200 words
- Return ONLY the prompt text, nothing else`
          },
          {
            role: 'user',
            content: `Headline: ${headline}\n\nArticle content (first 3000 chars):\n${articleContent.replace(/<[^>]*>/g, ' ').substring(0, 3000)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.error(`❌ Lovable AI prompt extraction failed: ${response.status}`);
      return `Professional financial advisory photograph related to ${headline}, bright natural lighting, high-end marketing quality, no text, no watermarks, clean composition`;
    }

    const data = await response.json();
    const prompt = data.choices?.[0]?.message?.content?.trim();
    
    if (prompt && prompt.length > 20) {
      console.log(`✅ Extracted content-specific prompt: ${prompt.substring(0, 100)}...`);
      return prompt;
    }
  } catch (error) {
    console.error(`❌ Prompt extraction error:`, error);
  }

  return `Professional financial advisory photograph related to ${headline}, bright natural lighting, high-end marketing quality, no text, no watermarks, clean composition`;
}

/**
 * Generate image using Fal.ai Nano Banana Pro (via Lovable AI gateway)
 */
async function generateContentImage(
  prompt: string,
  lovableApiKey: string
): Promise<string | null> {
  try {
    console.log(`🎨 Generating image with Nano Banana Pro...`);
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: `Generate a professional 16:9 marketing image: ${prompt}`
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      console.error(`❌ Image generation failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageUrl) {
      console.log(`✅ Image generated successfully`);
      return imageUrl;
    }
    
    console.error(`❌ No image in response`);
    return null;
  } catch (error) {
    console.error(`❌ Image generation error:`, error);
    return null;
  }
}

/**
 * Generate localized alt text and caption using Lovable AI
 */
async function generateLocalizedMetadata(
  article: { headline: string; language: string; detailed_content?: string },
  lovableApiKey: string
): Promise<{ altText: string; caption: string | null }> {
  const languageName = LANGUAGE_NAMES[article.language] || 'English';

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You create SEO-optimized image metadata in ${languageName} for Everence Wealth, a financial advisory and insurance planning company.

Output a JSON object with:
- "altText": Descriptive alt text for accessibility and SEO (100-150 characters). Include keywords related to the article topic.
- "caption": Engaging caption for display below the image (100-200 characters).

RULES:
- Write in ${languageName}
- Be specific to the article's financial topic
- Reference Everence Wealth where appropriate
- Return ONLY valid JSON, no markdown.`
          },
          {
            role: 'user',
            content: `Article headline: ${article.headline}\nGenerate alt text and caption in ${languageName}.`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const metadata = JSON.parse(content);
      return {
        altText: metadata.altText?.length >= 50 ? metadata.altText : `${article.headline} - Everence Wealth`,
        caption: metadata.caption?.length >= 50 ? metadata.caption : null
      };
    }
  } catch (error) {
    console.error(`Failed to generate ${languageName} metadata:`, error);
  }

  return {
    altText: `${article.headline} - Everence Wealth`,
    caption: null
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clusterId, dryRun = false, preserveEnglishImages = false } = await req.json();

    if (!clusterId) {
      return new Response(
        JSON.stringify({ error: 'clusterId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY is not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔄 Regenerating content-aware images for cluster: ${clusterId}`);

    // Fetch all articles including detailed_content for prompt extraction
    const { data: articles, error: fetchError } = await supabase
      .from('blog_articles')
      .select('id, headline, language, featured_image_url, funnel_stage, slug, cluster_number, detailed_content')
      .eq('cluster_id', clusterId)
      .order('cluster_number')
      .order('language');

    if (fetchError) throw new Error(`Failed to fetch articles: ${fetchError.message}`);

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No articles found for this cluster', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${articles.length} articles in cluster`);

    // Group articles by cluster_number (position 1-6)
    // Each position: 1 English + 1 Spanish = 2 articles
    // English gets a unique content-aware image, Spanish shares it with localized metadata
    const articlesByPosition: Record<number, {
      english: any | null;
      translations: any[];
      funnel_stage: string;
      position: number;
    }> = {};

    for (const article of articles) {
      const position = article.cluster_number || 0;
      if (!articlesByPosition[position]) {
        articlesByPosition[position] = {
          english: null,
          translations: [],
          funnel_stage: article.funnel_stage || 'unknown',
          position
        };
      }
      if (article.language === 'en') {
        articlesByPosition[position].english = article;
      } else {
        articlesByPosition[position].translations.push(article);
      }
    }

    const positions = Object.keys(articlesByPosition).sort((a, b) => Number(a) - Number(b));
    console.log(`📊 Found ${positions.length} positions: ${positions.join(', ')}`);

    if (dryRun) {
      const englishCount = Object.values(articlesByPosition).filter(g => g.english).length;
      const translationCount = Object.values(articlesByPosition).reduce((sum, g) => sum + g.translations.length, 0);

      return new Response(
        JSON.stringify({
          success: true,
          dryRun: true,
          articleCount: articles.length,
          uniqueImagesNeeded: preserveEnglishImages ? 0 : englishCount,
          imagesPreserved: preserveEnglishImages ? englishCount : 0,
          translationsToShare: translationCount,
          preserveMode: preserveEnglishImages,
          positionsFound: positions.length,
          message: preserveEnglishImages
            ? `Would preserve ${englishCount} existing images, share to ${translationCount} translations`
            : `Would generate ${englishCount} content-aware images, share to ${translationCount} translations`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let failCount = 0;
    let imagesPreserved = 0;
    const results: Array<{ id: string; language: string; success: boolean; newUrl?: string; shared?: boolean; preserved?: boolean }> = [];

    // Process each position
    for (const [positionKey, group] of Object.entries(articlesByPosition)) {
      const { english, translations, funnel_stage, position } = group;

      console.log(`\n📍 Processing position ${position} (${funnel_stage})`);

      let primaryImageUrl: string | null = null;

      // Check if English already has a Supabase image
      const hasSupabaseImage = english?.featured_image_url?.includes('supabase.co/storage');

      if (hasSupabaseImage) {
        console.log(`⏭️ Skipping position ${position} - already has Supabase image`);
        primaryImageUrl = english.featured_image_url;
        imagesPreserved++;
        successCount++;
        results.push({ id: english.id, language: 'en', success: true, newUrl: primaryImageUrl || undefined, preserved: true });
      } else if (english) {
        if (preserveEnglishImages && english.featured_image_url) {
          console.log(`📌 Preserving existing English image for position ${position}`);
          primaryImageUrl = english.featured_image_url;

          const { altText, caption } = await generateLocalizedMetadata(english, lovableApiKey);
          const updateResult = await retryableUpdate(supabase, english.id, {
            featured_image_alt: altText,
            featured_image_caption: caption,
            updated_at: new Date().toISOString()
          });

          if (updateResult.success) {
            imagesPreserved++;
            successCount++;
            results.push({ id: english.id, language: 'en', success: true, newUrl: primaryImageUrl || undefined, preserved: true });
          } else {
            failCount++;
            results.push({ id: english.id, language: 'en', success: false });
          }
        } else {
          // CONTENT-AWARE GENERATION: Read article content → extract prompt → generate image
          console.log(`🧠 Extracting content-specific prompt for position ${position}...`);

          const imagePrompt = await extractImagePrompt(
            english.detailed_content || '',
            english.headline,
            lovableApiKey
          );

          console.log(`🎨 Generating content-aware image for: "${english.headline.substring(0, 50)}..."`);

          try {
            const generatedImageData = await generateContentImage(imagePrompt, lovableApiKey);

            if (generatedImageData) {
              let newImageUrl: string | null;
              
              if (generatedImageData.startsWith('data:')) {
                // Base64 image from Lovable AI
                newImageUrl = await uploadBase64ToStorage(
                  generatedImageData,
                  supabase,
                  'article-images',
                  `cluster-pos-${position}-${funnel_stage}-${english.slug || english.id.slice(0, 8)}`
                );
              } else {
                // URL-based image
                newImageUrl = await uploadUrlToStorage(
                  generatedImageData,
                  supabase,
                  'article-images',
                  `cluster-pos-${position}-${funnel_stage}-${english.slug || english.id.slice(0, 8)}`
                );
              }

              if (newImageUrl) {
                const { altText, caption } = await generateLocalizedMetadata(english, lovableApiKey);

                const updateResult = await retryableUpdate(supabase, english.id, {
                  featured_image_url: newImageUrl,
                  featured_image_alt: altText,
                  featured_image_caption: caption,
                  updated_at: new Date().toISOString()
                });

                if (updateResult.success) {
                  primaryImageUrl = newImageUrl;
                  successCount++;
                  results.push({ id: english.id, language: 'en', success: true, newUrl: newImageUrl });
                } else {
                  failCount++;
                  results.push({ id: english.id, language: 'en', success: false });
                }
              } else {
                failCount++;
                results.push({ id: english.id, language: 'en', success: false });
              }
            } else {
              console.error(`❌ No image generated for position ${position}`);
              failCount++;
              results.push({ id: english.id, language: 'en', success: false });
            }
          } catch (error) {
            console.error(`❌ Error generating image for position ${position}:`, error);
            failCount++;
            results.push({ id: english.id, language: 'en', success: false });
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Share primary image to all translations with localized metadata
      if (primaryImageUrl && translations.length > 0) {
        console.log(`🔗 Sharing image to ${translations.length} translation(s)...`);

        for (const translation of translations) {
          try {
            const { altText, caption } = await generateLocalizedMetadata(translation, lovableApiKey);

            const updateResult = await retryableUpdate(supabase, translation.id, {
              featured_image_url: primaryImageUrl,
              featured_image_alt: altText,
              featured_image_caption: caption,
              updated_at: new Date().toISOString()
            });

            if (updateResult.success) {
              successCount++;
              results.push({ id: translation.id, language: translation.language, success: true, newUrl: primaryImageUrl, shared: true });
            } else {
              failCount++;
              results.push({ id: translation.id, language: translation.language, success: false });
            }
          } catch (error) {
            console.error(`❌ Error updating ${translation.language} translation:`, error);
            failCount++;
            results.push({ id: translation.id, language: translation.language, success: false });
          }
        }
      } else if (!primaryImageUrl && translations.length > 0) {
        for (const translation of translations) {
          failCount++;
          results.push({ id: translation.id, language: translation.language, success: false });
        }
      }
    }

    const uniqueImagesGenerated = results.filter(r => r.success && r.language === 'en' && !r.preserved).length;
    const imagesShared = results.filter(r => r.shared).length;

    console.log(`\n🎉 Completed: ${successCount} success, ${failCount} failed`);
    console.log(`   Content-aware images generated: ${uniqueImagesGenerated}`);
    console.log(`   Images preserved: ${imagesPreserved}`);
    console.log(`   Images shared to translations: ${imagesShared}`);

    return new Response(
      JSON.stringify({
        success: failCount === 0,
        clusterId,
        totalArticles: articles.length,
        uniqueImagesGenerated,
        imagesPreserved,
        imagesShared,
        successCount,
        failCount,
        preserveMode: preserveEnglishImages,
        results: results.slice(0, 30),
        failedArticleIds: results.filter(r => !r.success).map(r => r.id)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in regenerate-cluster-images:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message, success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
