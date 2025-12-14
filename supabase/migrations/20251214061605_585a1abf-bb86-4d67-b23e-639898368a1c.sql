-- Create city_brochures table for admin-editable brochure content
CREATE TABLE public.city_brochures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  
  -- Hero Section
  hero_image TEXT,
  hero_headline TEXT,
  hero_subtitle TEXT,
  
  -- Description Section
  description TEXT,
  
  -- Gallery Section (3-4 images)
  gallery_images JSONB DEFAULT '[]'::JSONB,
  
  -- Features Section (bullet list)
  features JSONB DEFAULT '[]'::JSONB,
  
  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status & Timestamps
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.city_brochures ENABLE ROW LEVEL SECURITY;

-- Public read access for published brochures
CREATE POLICY "Public can view published brochures" 
ON public.city_brochures 
FOR SELECT 
USING (is_published = true);

-- Authenticated users can manage brochures (admin check in app layer)
CREATE POLICY "Authenticated users can manage brochures" 
ON public.city_brochures 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_city_brochures_updated_at
BEFORE UPDATE ON public.city_brochures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial 7 cities with data migrated from constants
INSERT INTO public.city_brochures (slug, name, hero_headline, hero_subtitle, description, features, meta_title, meta_description, is_published) VALUES
(
  'marbella',
  'Marbella',
  'Luxury Living in Marbella',
  'The jewel of the Costa del Sol',
  'Marbella represents the pinnacle of Mediterranean luxury living. This glamorous destination combines pristine beaches, world-class golf courses, and an unparalleled lifestyle that attracts discerning international buyers. From the iconic Golden Mile to the charming Old Town, Marbella offers exceptional investment opportunities in one of Europe''s most prestigious real estate markets.',
  '["Prime beachfront locations", "World-renowned golf courses", "Exclusive gated communities", "Michelin-starred dining", "Year-round sunshine", "International schools", "Private healthcare facilities", "Luxury marina lifestyle"]'::JSONB,
  'Luxury Properties in Marbella | Del Sol Prime Homes',
  'Discover exceptional luxury properties in Marbella. From beachfront villas to exclusive penthouses, find your dream home on the Costa del Sol.',
  true
),
(
  'estepona',
  'Estepona',
  'Authentic Charm in Estepona',
  'Where tradition meets modern luxury',
  'Estepona captivates with its authentic Andalusian character and rapidly growing appeal among international buyers. Known as the "Garden of the Costa del Sol," this charming town offers a perfect blend of traditional Spanish culture and contemporary luxury developments. Its award-winning beaches and vibrant marina make it an ideal choice for those seeking genuine Mediterranean living.',
  '["Award-winning beaches", "Charming Old Town", "Modern marina district", "Botanical gardens throughout", "Growing expat community", "Excellent value proposition", "Family-friendly environment", "Authentic Spanish culture"]'::JSONB,
  'Luxury Properties in Estepona | Del Sol Prime Homes',
  'Explore beautiful properties in Estepona. Authentic Andalusian charm combined with modern luxury on the Costa del Sol.',
  true
),
(
  'fuengirola',
  'Fuengirola',
  'Vibrant Living in Fuengirola',
  'The heart of Costa del Sol lifestyle',
  'Fuengirola offers an unbeatable combination of accessibility, amenities, and Mediterranean lifestyle. This vibrant coastal town boasts excellent transport links, a lively promenade, and a thriving international community. With its 8km of sandy beaches and year-round activities, Fuengirola is perfect for those seeking an active, connected lifestyle on the Costa del Sol.',
  '["8km of sandy beaches", "Excellent transport links", "Vibrant promenade", "Year-round activities", "Strong rental market", "International community", "Shopping and dining", "Family attractions"]'::JSONB,
  'Luxury Properties in Fuengirola | Del Sol Prime Homes',
  'Find your perfect property in Fuengirola. Vibrant coastal living with excellent amenities on the Costa del Sol.',
  true
),
(
  'benalmadena',
  'Benalmádena',
  'Stunning Views in Benalmádena',
  'Where mountains meet the Mediterranean',
  'Benalmádena enchants visitors with its dramatic scenery and diverse offerings. From the traditional Pueblo to the modern Costa, this destination provides spectacular mountain and sea views. The famous Puerto Marina, cable car to Mount Calamorro, and proximity to Málaga make Benalmádena an increasingly popular choice for property investors.',
  '["Award-winning Puerto Marina", "Cable car to Mount Calamorro", "Traditional pueblo charm", "Sea and mountain views", "Butterfly Park", "Casino and nightlife", "Close to Málaga airport", "Diverse property options"]'::JSONB,
  'Luxury Properties in Benalmádena | Del Sol Prime Homes',
  'Discover stunning properties in Benalmádena. Spectacular views and diverse lifestyle options on the Costa del Sol.',
  true
),
(
  'mijas',
  'Mijas',
  'Tranquil Elegance in Mijas',
  'Hillside serenity with coastal access',
  'Mijas offers the best of both worlds: the tranquility of a traditional white village and easy access to the coast. This picturesque municipality spans from the charming Mijas Pueblo to the beaches of Mijas Costa, providing diverse property options. Known for its artistic community and stunning views, Mijas attracts buyers seeking peace without isolation.',
  '["Traditional white village", "Panoramic coastal views", "Artistic community", "Golf courses nearby", "Peaceful environment", "Easy coastal access", "Authentic Spanish architecture", "Strong community spirit"]'::JSONB,
  'Luxury Properties in Mijas | Del Sol Prime Homes',
  'Explore beautiful properties in Mijas. Tranquil hillside living with stunning coastal views on the Costa del Sol.',
  true
),
(
  'sotogrande',
  'Sotogrande',
  'Exclusive Living in Sotogrande',
  'Europe''s most prestigious residential resort',
  'Sotogrande stands as Europe''s largest privately-owned residential development, offering unparalleled exclusivity and prestige. Home to world-famous polo fields and championship golf courses, this elite enclave attracts high-net-worth individuals seeking privacy and luxury. The marina, beach clubs, and international schools complete this exceptional lifestyle destination.',
  '["World-class polo facilities", "Championship golf courses", "Prestigious marina", "Private beach clubs", "International schools", "Ultimate privacy", "Elite community", "Investment-grade properties"]'::JSONB,
  'Luxury Properties in Sotogrande | Del Sol Prime Homes',
  'Discover exclusive properties in Sotogrande. Europe''s most prestigious residential resort on the Costa del Sol.',
  true
),
(
  'malaga-city',
  'Málaga City',
  'Urban Sophistication in Málaga',
  'A vibrant cultural capital',
  'Málaga has transformed into one of Europe''s most exciting cities, combining rich cultural heritage with contemporary urban living. The birthplace of Picasso now boasts world-class museums, a thriving culinary scene, and excellent connectivity. The historic center and beach districts offer sophisticated property options in this increasingly desirable destination.',
  '["World-class museums", "Picasso''s birthplace", "Historic city center", "Excellent connectivity", "Thriving food scene", "Beach and urban lifestyle", "Growing tech hub", "Cultural events year-round"]'::JSONB,
  'Luxury Properties in Málaga City | Del Sol Prime Homes',
  'Find exceptional properties in Málaga City. Urban sophistication meets Mediterranean charm in Andalusia''s cultural capital.',
  true
);