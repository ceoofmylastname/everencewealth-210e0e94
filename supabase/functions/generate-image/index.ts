import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to detect article topic
const detectArticleTopic = (headline: string): string => {
  const text = headline.toLowerCase();
  if (text.match(/\b(retirement|retire|pension|401k|ira|social security)\b/)) return 'retirement';
  if (text.match(/\b(life insurance|term life|whole life|universal life)\b/)) return 'life-insurance';
  if (text.match(/\b(annuit|fixed annuity|variable annuity|indexed annuity)\b/)) return 'annuities';
  if (text.match(/\b(estate plan|trust|will|inheritance|legacy|probate)\b/)) return 'estate-planning';
  if (text.match(/\b(tax|deduction|roth|conversion|capital gains)\b/)) return 'tax-planning';
  if (text.match(/\b(market|trends|forecast|outlook|economic|inflation)\b/)) return 'market-analysis';
  if (text.match(/\b(invest|portfolio|diversif|asset allocation)\b/)) return 'investment';
  if (text.match(/\b(medicare|health|long.term care|ltc)\b/)) return 'health-coverage';
  if (text.match(/\b(compare|vs|versus|best|choose|which|difference)\b/)) return 'comparison';
  if (text.match(/\b(family|protect|child|college|education|529)\b/)) return 'family-protection';
  return 'general-financial';
};

const topicPrompts: Record<string, string> = {
  'retirement': 'Happy retired couple meeting with financial advisor in a modern office, retirement savings charts on screen, warm optimistic atmosphere',
  'life-insurance': 'Financial advisor explaining life insurance policy options to a young family in a modern office, reassuring atmosphere',
  'annuities': 'Senior couple reviewing annuity income options with advisor, income projection charts on laptop, secure confident feeling',
  'estate-planning': 'Multi-generational family meeting with estate planning attorney, legal documents on conference table, professional law office',
  'tax-planning': 'Financial advisor reviewing tax documents with client, tax forms and financial statements, organized professional office',
  'market-analysis': 'Professional analyst reviewing market data on multiple monitors showing charts, modern financial office',
  'investment': 'Wealth manager discussing portfolio strategy with client, diversification charts on screen, upscale office with city views',
  'health-coverage': 'Insurance advisor helping senior couple understand Medicare options, health coverage documents, warm caring office',
  'comparison': 'Advisor showing side-by-side comparison of financial options on tablet, clean modern office, clear organized presentation',
  'family-protection': 'Young family discussing financial security with advisor, warm home office setting, life insurance documents visible',
  'general-financial': 'Professional financial advisor meeting with client in modern office, financial planning documents and laptop, warm professional atmosphere',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, headline, imageUrl } = await req.json();

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let finalPrompt: string;
    if (prompt) {
      finalPrompt = prompt;
    } else if (headline) {
      const topic = detectArticleTopic(headline);
      const base = topicPrompts[topic] || topicPrompts['general-financial'];
      finalPrompt = `${base}, ultra-realistic, 8k resolution, professional photography, no text, no watermarks, 16:9 aspect ratio`;
      console.log('Generated prompt for topic:', topic);
    } else {
      finalPrompt = 'Professional financial advisory consultation, modern office, warm lighting, advisor and client, ultra-realistic, 8k, no text, no watermarks, 16:9 aspect ratio';
    }

    console.log('Generating image with Lovable AI (Nano Banana Pro)');

    const messages: any[] = [];
    
    if (imageUrl) {
      // Edit existing image
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: finalPrompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: `Generate this image: ${finalPrompt}`
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages,
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error('No image returned from AI model');
    }

    // Return in same format as before for compatibility
    return new Response(
      JSON.stringify({
        images: [{ url: generatedImage }],
        prompt: finalPrompt,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating images:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate images' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
