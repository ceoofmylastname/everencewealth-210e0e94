import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TextAnalysisResult {
  hasText: boolean;
  textType: 'none' | 'watermark' | 'gibberish' | 'readable' | 'logo';
  severity: 'none' | 'low' | 'high';
  description: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log(`Analyzing image for text: ${imageUrl.substring(0, 100)}...`);

    // Use GPT-4o Vision to analyze the image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this real estate/property image carefully. Look for ANY visible text, words, letters, watermarks, logos, or gibberish characters that appear baked into the image (not natural signs in the scene).

Focus on detecting:
1. AI-generated gibberish text (random letters, distorted words, fake text)
2. Watermarks or photographer credits
3. Logos or brand marks
4. Overlaid text or captions

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "hasText": boolean,
  "textType": "none" | "watermark" | "gibberish" | "readable" | "logo",
  "severity": "none" | "low" | "high",
  "description": "Brief description of what was found (max 100 chars)"
}

Severity guide:
- "none": No problematic text detected
- "low": Minor watermarks or small logos that don't distract
- "high": Obvious gibberish, large watermarks, or prominent text that ruins the image`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('GPT-4o Vision response:', content);

    // Parse the JSON response
    let result: TextAnalysisResult;
    try {
      // Clean up potential markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', content);
      // Default to no issues if we can't parse
      result = {
        hasText: false,
        textType: 'none',
        severity: 'none',
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
