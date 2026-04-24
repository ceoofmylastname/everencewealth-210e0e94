import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TextAnalysisResult {
  hasText: boolean;
  textType: 'none' | 'watermark' | 'gibberish' | 'readable' | 'logo' | 'brand_mark';
  severity: 'none' | 'low' | 'high';
  description: string;
  hasLogo?: boolean;
  brandName?: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, mode } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const isLogoMode = mode === 'logo';
    console.log(`Analyzing image (${isLogoMode ? 'LOGO mode' : 'text mode'}): ${imageUrl.substring(0, 100)}...`);

    const systemInstruction = isLogoMode
      ? `You are a strict brand-mark detector for Everence Wealth. Inspect the image and detect ANY company logo, brand wordmark, financial-services brand mark, advisor firm logo, shield/badge emblem, monogram, watermark, or photographer credit. This includes faint or partial marks in corners.

Common offenders to flag: Apex, APEX Financial Advisors, Ascend, Ameriprise, Edward Jones, Fidelity, Vanguard, Charles Schwab, Merrill, Morgan Stanley, Raymond James, LPL, Northwestern Mutual, Prudential, MassMutual, John Hancock, Lincoln, Allianz, Pacific Life, Nationwide, MetLife, New York Life, Transamerica, AIG, Mutual of Omaha, AAA, Getty, Shutterstock, iStock, Adobe Stock, Unsplash credits.

If the only visible mark IS "Everence Wealth" treat it as none/low. Anything else with a brand name or logo = high severity.

Respond ONLY with valid JSON (no markdown):
{
  "hasText": boolean,
  "hasLogo": boolean,
  "textType": "none" | "watermark" | "gibberish" | "readable" | "logo" | "brand_mark",
  "severity": "none" | "low" | "high",
  "brandName": string | null,
  "description": "Brief description of what was found (max 100 chars)"
}

Severity:
- "none": clean image, no brand marks
- "low": tiny ambiguous mark, no readable brand name
- "high": ANY identifiable third-party logo, wordmark, watermark, or brand name`
      : `Analyze this financial services/insurance image carefully. Look for ANY visible text, words, letters, watermarks, logos, or gibberish characters that appear baked into the image (not natural signs in the scene).

Focus on detecting:
1. AI-generated gibberish text (random letters, distorted words, fake text)
2. Watermarks or photographer credits
3. Logos or brand marks
4. Overlaid text or captions

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "hasText": boolean,
  "hasLogo": boolean,
  "textType": "none" | "watermark" | "gibberish" | "readable" | "logo" | "brand_mark",
  "severity": "none" | "low" | "high",
  "brandName": string | null,
  "description": "Brief description of what was found (max 100 chars)"
}`;

    // Use Lovable AI Gateway (Gemini vision) — no extra API key required
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemInstruction },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this image and respond with the JSON schema described in the system message.' },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required — add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Lovable AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('Vision response:', content.substring(0, 200));

    // Parse the JSON response
    let result: TextAnalysisResult;
    try {
      // Clean up potential markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(cleanContent);
      // Ensure new fields exist for downstream code
      if (typeof result.hasLogo !== 'boolean') {
        result.hasLogo = result.textType === 'logo' || result.textType === 'brand_mark' || result.textType === 'watermark';
      }
      if (result.brandName === undefined) result.brandName = null;
    } catch (parseError) {
      console.error('Failed to parse vision response:', content);
      // Default to no issues if we can't parse
      result = {
        hasText: false,
        hasLogo: false,
        textType: 'none',
        severity: 'none',
        brandName: null,
        description: 'Unable to analyze image'
      };
    }

    return new Response(
      JSON.stringify({ success: true, analysis: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-image-for-text:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
