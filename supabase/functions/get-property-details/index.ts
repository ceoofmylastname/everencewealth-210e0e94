import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_MAP: Record<string, number> = {
  en: 1, es: 2, de: 3, fr: 4, nl: 5, ru: 6, pl: 7, it: 8, pt: 9, sv: 10, no: 11, da: 12, fi: 13, hu: 14
};

// Proxy server URL
const PROXY_BASE_URL = 'http://188.34.164.137:3000';

// Call proxy server to get property by reference
async function callProxyPropertyDetails(reference: string, langNum: number): Promise<any> {
  const requestUrl = `${PROXY_BASE_URL}/property/${encodeURIComponent(reference)}?lang=${langNum}`;

  console.log('🔄 Calling Proxy Server (GET) - /property/:reference');
  console.log('📤 Request URL:', requestUrl);

  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Proxy error:', response.status, errorText);
    throw new Error(`Proxy error: ${response.status} ${errorText}`.trim());
  }

  const data = await response.json();
  console.log('✅ Proxy response received');
  console.log('📦 Raw response keys:', Object.keys(data));
  console.log('📦 Property array?:', data.Property?.length);
  console.log('📦 Has property?:', !!data.property);
  
  // Handle all possible proxy response formats
  const rawProp = data.Property?.[0] || 
                  data.property?.[0] ||
                  data.property || 
                  (data.Reference ? data : null);
  
  if (rawProp) {
    console.log('📦 Raw property Pictures structure:', typeof rawProp.Pictures, rawProp.Pictures ? Object.keys(rawProp.Pictures) : 'none');
  }
  
  return rawProp;
}

/**
 * Extracts main image URL - aligned with search-properties logic
 */
function extractMainImage(raw: any): string {
  return raw.Pictures?.Picture?.[0]?.PictureURL ||
         raw.MainImage ||
         raw.Pictures?.[0]?.PictureURL ||
         raw.Pictures?.[0] ||
         '';
}

/**
 * Extracts all image URLs - aligned with search-properties logic
 */
function extractImages(raw: any): string[] {
  let images: string[] = [];
  if (raw.Pictures?.Picture && Array.isArray(raw.Pictures.Picture)) {
    images = raw.Pictures.Picture.map((p: any) => p.PictureURL || p).filter(Boolean);
  } else if (Array.isArray(raw.Pictures)) {
    images = raw.Pictures.map((p: any) => typeof p === 'string' ? p : p.PictureURL || p).filter(Boolean);
  }
  return images;
}

/**
 * Extracts features from property data
 */
function extractFeatures(prop: any): string[] {
  const features: string[] = [];
  
  if (prop.HasPool === 'Yes' || prop.Pool === 'Yes' || prop.CommunityPool === 'Yes') {
    features.push('Pool');
  }
  if (prop.HasGarden === 'Yes' || prop.Garden === 'Yes') {
    features.push('Garden');
  }
  if (prop.Parking !== undefined && prop.Parking !== 'None' && prop.Parking !== '0') {
    features.push('Parking');
  }
  if (prop.AirConditioning === 'Yes' || prop.AC === 'Yes') {
    features.push('Air Conditioning');
  }
  if (prop.Heating === 'Yes') {
    features.push('Heating');
  }
  if (prop.Terrace === 'Yes') {
    features.push('Terrace');
  }
  if (prop.Garage === 'Yes') {
    features.push('Garage');
  }
  if (prop.Storage === 'Yes') {
    features.push('Storage Room');
  }
  if (prop.Lift === 'Yes' || prop.Elevator === 'Yes') {
    features.push('Elevator');
  }
  if (prop.Security === 'Yes' || prop.Security24h === 'Yes') {
    features.push('24h Security');
  }
  if (prop.Gym === 'Yes' || prop.CommunityGym === 'Yes') {
    features.push('Gym');
  }
  if (prop.Jacuzzi === 'Yes') {
    features.push('Jacuzzi');
  }
  if (prop.Sauna === 'Yes') {
    features.push('Sauna');
  }
  if (prop.SeaViews === 'Yes') {
    features.push('Sea Views');
  }
  if (prop.GolfViews === 'Yes') {
    features.push('Golf Views');
  }
  if (prop.MountainViews === 'Yes') {
    features.push('Mountain Views');
  }
  
  return features;
}

/**
 * Normalizes property data to a consistent format
 */
function normalizeProperty(prop: any) {
  // Parse numeric values
  const parseNumeric = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Get location string
  const location = prop.Location || prop.Area || prop.Town || prop.City || 'Costa del Sol';
  const province = prop.Province || prop.Region || 'Málaga';

  // Extract images using aligned logic
  const mainImage = extractMainImage(prop);
  const images = extractImages(prop);
  
  // Log warning if no images found
  if (!mainImage && images.length === 0) {
    console.warn('⚠️ No images extracted. Raw Pictures data:', JSON.stringify(prop.Pictures || prop.pictures || 'none'));
  } else {
    console.log(`✅ Images extracted: mainImage=${mainImage ? 'yes' : 'no'}, images count=${images.length}`);
  }

  return {
    reference: prop.Reference || prop.reference || '',
    propertyType: prop.PropertyType?.Type || prop.Type || prop.PropertyType || 'Property',
    location,
    province,
    price: parseNumeric(prop.Price || prop.CurrentPrice || 0),
    priceMax: parseNumeric(prop.PriceMax || prop.PriceTo || 0),
    currency: prop.Currency || 'EUR',
    bedrooms: parseNumeric(prop.Bedrooms || prop.BedroomsFrom || 0),
    bedroomsMax: parseNumeric(prop.BedroomsMax || prop.BedroomsTo || 0),
    bathrooms: parseNumeric(prop.Bathrooms || prop.BathroomsFrom || 0),
    bathroomsMax: parseNumeric(prop.BathroomsMax || prop.BathroomsTo || 0),
    builtArea: parseNumeric(prop.Built || prop.BuiltArea || prop.BuiltM2 || 0),
    builtAreaMax: parseNumeric(prop.BuiltMax || prop.BuiltTo || 0),
    plotArea: parseNumeric(prop.Plot || prop.PlotArea || prop.PlotM2 || 0),
    plotAreaMax: parseNumeric(prop.PlotMax || prop.PlotTo || 0),
    mainImage,
    images,
    description: prop.Description || prop.FullDescription || prop.LongDescription || '',
    features: extractFeatures(prop),
    pool: prop.HasPool === 'Yes' || prop.Pool === 'Yes' || prop.CommunityPool === 'Yes',
    garden: prop.HasGarden === 'Yes' || prop.Garden === 'Yes',
    parking: prop.Parking !== undefined && prop.Parking !== 'None' && prop.Parking !== '0',
    orientation: prop.Orientation || '',
    views: prop.Views || '',
    newDevelopment: prop.NewDevelopment === 'Yes' || prop.OffPlan === 'Yes',
    status: prop.Status || 'Available',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, lang = 'en' } = await req.json();

    if (!reference) {
      throw new Error('Property reference is required');
    }

    const langNum = LANGUAGE_MAP[lang] || 1;
    console.log(`🏠 Fetching PropertyDetails for: ${reference} (lang: ${lang}/${langNum})`);

    // Call proxy server
    const rawProp = await callProxyPropertyDetails(reference, langNum);

    if (!rawProp) {
      console.log('❌ Property not found');
      return new Response(
        JSON.stringify({ property: null, error: 'Property not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize the property data
    const property = normalizeProperty(rawProp);

    console.log(`✅ Property ${reference} normalized successfully`);

    return new Response(
      JSON.stringify({ property }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ PropertyDetails error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
