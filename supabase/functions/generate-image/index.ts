import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as fal from "https://esm.sh/@fal-ai/serverless-client@0.15.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FalImage {
  url: string;
  width?: number;
  height?: number;
  content_type?: string;
}

interface FalResult {
  images: FalImage[];
}

// Helper function to infer scene type from headline
const inferSceneType = (headline: string): string => {
  const text = headline.toLowerCase();
  if (text.includes('retirement') || text.includes('retire')) return 'retirement planning consultation';
  if (text.includes('insurance') || text.includes('life insurance')) return 'insurance policy review';
  if (text.includes('annuit')) return 'annuity planning session';
  if (text.includes('estate plan')) return 'estate planning meeting';
  if (text.includes('tax')) return 'tax strategy consultation';
  if (text.includes('wealth') || text.includes('portfolio')) return 'wealth management review';
  return 'financial advisory consultation';
};

// Helper function to detect article topic
const detectArticleTopic = (headline: string): string => {
  const text = headline.toLowerCase();

  if (text.match(/\b(retirement|retire|pension|401k|ira|social security|savings gap|shortfall)\b/)) {
    return 'retirement';
  }
  if (text.match(/\b(life insurance|term life|whole life|universal life|policy|coverage|beneficiary)\b/)) {
    return 'life-insurance';
  }
  if (text.match(/\b(annuit|fixed annuity|variable annuity|indexed annuity|income stream)\b/)) {
    return 'annuities';
  }
  if (text.match(/\b(estate plan|trust|will|inheritance|legacy|probate|beneficiary designation)\b/)) {
    return 'estate-planning';
  }
  if (text.match(/\b(tax|deduction|roth|conversion|tax-free|tax-deferred|capital gains)\b/)) {
    return 'tax-planning';
  }
  if (text.match(/\b(market|trends|forecast|outlook|analysis|economic|inflation|interest rate)\b/)) {
    return 'market-analysis';
  }
  if (text.match(/\b(invest|investment|portfolio|diversif|asset allocation|risk tolerance)\b/)) {
    return 'investment';
  }
  if (text.match(/\b(medicare|health|long.term care|ltc|supplement)\b/)) {
    return 'health-coverage';
  }
  if (text.match(/\b(guide|how to|step|beginner|start|basics|101)\b/)) {
    return 'educational-guide';
  }
  if (text.match(/\b(compare|vs|versus|best|choose|which|difference)\b/)) {
    return 'comparison';
  }
  if (text.match(/\b(family|protect|child|college|education|529)\b/)) {
    return 'family-protection';
  }
  return 'general-financial';
};

// Generate contextual image prompt based on article topic
const generateContextualImagePrompt = (
  headline: string,
  topic: string,
  sceneType: string
): string => {
  const baseQuality = 'ultra-realistic, 8k resolution, professional photography, no text, no watermarks';
  const timeOfDay = ['morning golden light', 'bright midday sun', 'soft afternoon light', 'warm evening light'][Math.floor(Math.random() * 4)];

  if (topic === 'retirement') {
    return `Professional retirement planning scene: 
      Happy retired couple meeting with financial advisor in modern office, 
      retirement savings charts on screen, comfortable professional setting, 
      warm and optimistic atmosphere, ${timeOfDay}, 
      focus on PEOPLE and PLANNING not properties, 
      ${baseQuality}`;
  }

  if (topic === 'life-insurance') {
    return `Professional life insurance consultation: 
      Financial advisor explaining policy options to young family, 
      modern office with warm lighting, policy documents on desk, 
      family with children, protective and reassuring atmosphere, 
      ${timeOfDay}, focus on FAMILY PROTECTION, 
      ${baseQuality}`;
  }

  if (topic === 'annuities') {
    return `Retirement income planning session: 
      Senior couple reviewing annuity options with advisor, 
      income projection charts on laptop screen, 
      comfortable modern office, confident and secure feeling, 
      ${timeOfDay}, focus on INCOME SECURITY, 
      ${baseQuality}`;
  }

  if (topic === 'estate-planning') {
    return `Estate planning consultation: 
      Multi-generational family meeting with estate planning attorney, 
      legal documents and trust paperwork on conference table, 
      professional law office setting, ${timeOfDay}, 
      focus on LEGACY and FAMILY, 
      ${baseQuality}`;
  }

  if (topic === 'tax-planning') {
    return `Tax strategy consultation: 
      Financial advisor reviewing tax documents with client, 
      tax forms and financial statements on desk, calculator, 
      modern accounting office, organized professional setting, 
      ${timeOfDay}, focus on TAX OPTIMIZATION, 
      ${baseQuality}`;
  }

  if (topic === 'market-analysis') {
    return `Financial market analysis scene: 
      Professional analyst reviewing market data and economic trends, 
      multiple monitors showing charts and graphs, 
      modern financial office, data-driven environment, 
      ${timeOfDay}, focus on DATA and ANALYSIS, 
      ${baseQuality}`;
  }

  if (topic === 'investment') {
    return `Investment portfolio review: 
      Wealth manager discussing portfolio strategy with client, 
      diversification charts and asset allocation on screen, 
      upscale office with city views, ${timeOfDay}, 
      focus on GROWTH and STRATEGY, 
      ${baseQuality}`;
  }

  if (topic === 'health-coverage') {
    return `Health insurance planning consultation: 
      Insurance advisor helping senior couple understand Medicare options, 
      health coverage comparison documents, warm office setting, 
      ${timeOfDay}, caring and supportive atmosphere, 
      focus on HEALTH PROTECTION, 
      ${baseQuality}`;
  }

  if (topic === 'educational-guide') {
    return `Financial education workshop: 
      Advisor presenting financial concepts to engaged audience, 
      whiteboard with financial planning diagrams, 
      bright modern seminar room, educational setting, 
      ${timeOfDay}, focus on LEARNING and EMPOWERMENT, 
      ${baseQuality}`;
  }

  if (topic === 'comparison') {
    return `Financial product comparison scene: 
      Advisor showing side-by-side comparison of financial options, 
      clean infographic-style materials on tablet, 
      modern office, clear and organized presentation, 
      ${timeOfDay}, focus on CLARITY and CHOICE, 
      ${baseQuality}`;
  }

  if (topic === 'family-protection') {
    return `Family financial protection planning: 
      Young family discussing financial security with advisor, 
      children playing nearby, warm home office setting, 
      life insurance and education savings documents, 
      ${timeOfDay}, focus on FAMILY and SECURITY, 
      ${baseQuality}`;
  }

  // Default: general financial advisory
  const defaultVariations = [
    `Professional financial advisory consultation: Advisor meeting with client in modern office, financial planning documents and laptop, warm and professional atmosphere, ${timeOfDay}, ${baseQuality}`,
    `Wealth management scene: Senior professional reviewing financial portfolio with client, upscale office setting, growth charts visible, ${timeOfDay}, ${baseQuality}`,
    `Financial planning lifestyle: Happy couple reviewing their financial plan together at home, laptop showing retirement projections, warm natural light, ${timeOfDay}, ${baseQuality}`
  ];
  return defaultVariations[Math.floor(Math.random() * defaultVariations.length)];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, headline, imageUrl } = await req.json();

    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) {
      throw new Error('FAL_KEY is not configured');
    }

    const cleanedFalKey = falKey.trim().replace(/[\r\n]/g, '');
    if (!cleanedFalKey || cleanedFalKey.length < 10) {
      throw new Error('FAL_KEY appears to be invalid or corrupted');
    }

    console.log('============ FAL.ai Configuration ============');
    console.log('FAL_KEY exists:', !!falKey);
    console.log('Prompt provided:', !!prompt);
    console.log('Headline provided:', !!headline);
    console.log('Image URL provided:', !!imageUrl);
    console.log('=============================================');

    fal.config({
      credentials: cleanedFalKey
    });

    let finalPrompt: string;
    if (prompt) {
      finalPrompt = prompt;
      console.log('Using custom user prompt');
    } else if (headline) {
      const sceneType = inferSceneType(headline);
      const articleTopic = detectArticleTopic(headline);
      finalPrompt = generateContextualImagePrompt(headline, articleTopic, sceneType);
      console.log('Generated contextual prompt for topic:', articleTopic);
    } else {
      finalPrompt = `Professional financial advisory consultation, modern office setting, warm lighting, advisor and client reviewing documents, ultra-realistic, 8k resolution, no text, no watermarks`;
      console.log('Using fallback prompt');
    }

    console.log('Final image prompt:', finalPrompt);

    let result: FalResult;

    if (imageUrl) {
      console.log('Editing existing image:', imageUrl);
      result = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
        input: {
          prompt: finalPrompt,
          aspect_ratio: "16:9",
          resolution: "2K",
          num_images: 1,
          image_urls: [imageUrl],
          output_format: "png"
        },
        logs: true,
      }) as FalResult;
    } else {
      console.log('Generating new image with Nano Banana Pro');
      result = await fal.subscribe("fal-ai/nano-banana-pro", {
        input: {
          prompt: finalPrompt,
          aspect_ratio: "16:9",
          resolution: "2K",
          num_images: 1,
          output_format: "png"
        },
        logs: true,
      }) as FalResult;
    }

    return new Response(
      JSON.stringify({ 
        images: result.images,
        prompt: finalPrompt 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate images';
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
