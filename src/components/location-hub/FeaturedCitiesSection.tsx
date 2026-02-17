import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Skeleton } from '@/components/ui/skeleton';

interface CityData {
  city_slug: string;
  city_name: string;
  region: string;
  count: number;
  image?: string;
  imageAlt?: string;
}

interface FeaturedCitiesSectionProps {
  language: string;
  cities: CityData[];
  isLoading: boolean;
}

// City metadata for overlay tags
const CITY_METADATA: Record<string, { avgPrice: string; bestFor: string; vibe: string }> = {
  'los-angeles': { avgPrice: 'From $500K', bestFor: 'Entertainment & Tech', vibe: 'Dynamic' },
  'austin': { avgPrice: 'From $350K', bestFor: 'Tech & Music', vibe: 'Vibrant' },
  'phoenix': { avgPrice: 'From $300K', bestFor: 'Retirement & Growth', vibe: 'Sunny' },
  'new-york': { avgPrice: 'From $600K', bestFor: 'Finance & Culture', vibe: 'Fast-Paced' },
  'chicago': { avgPrice: 'From $250K', bestFor: 'Business & Architecture', vibe: 'Urban' },
  'houston': { avgPrice: 'From $250K', bestFor: 'Energy & Medical', vibe: 'Diverse' },
  'san-diego': { avgPrice: 'From $550K', bestFor: 'Biotech & Military', vibe: 'Coastal' },
  'dallas': { avgPrice: 'From $300K', bestFor: 'Business & Sports', vibe: 'Ambitious' },
  'miami': { avgPrice: 'From $400K', bestFor: 'International Finance', vibe: 'Tropical' },
  'san-francisco': { avgPrice: 'From $800K', bestFor: 'Tech & Innovation', vibe: 'Progressive' },
  'denver': { avgPrice: 'From $400K', bestFor: 'Outdoors & Tech', vibe: 'Active' },
  'seattle': { avgPrice: 'From $500K', bestFor: 'Tech & Nature', vibe: 'Green' },
};

const LOCALIZED_CONTENT: Record<string, {
  sectionTitle: string;
  sectionSubtitle: string;
  guidesLabel: string;
  guideLabel: string;
  exploreLabel: string;
  noGuides: string;
  noGuidesSubtitle: string;
}> = {
  en: {
    sectionTitle: "Explore by City",
    sectionSubtitle: "Select a city to discover comprehensive guides with financial insights, lifestyle data, and wealth planning analysis.",
    guidesLabel: "guides",
    guideLabel: "guide",
    exploreLabel: "Explore Guides",
    noGuides: "No Location Guides Yet",
    noGuidesSubtitle: "Location intelligence pages are coming soon. Check back later for comprehensive guides."
  },
  es: {
    sectionTitle: "Explorar por Ciudad",
    sectionSubtitle: "Seleccione una ciudad para descubrir guías completas con información financiera y análisis de planificación patrimonial.",
    guidesLabel: "guías",
    guideLabel: "guía",
    exploreLabel: "Explorar Guías",
    noGuides: "Sin Guías de Ubicación Aún",
    noGuidesSubtitle: "Las páginas de inteligencia de ubicación están en camino. Vuelva más tarde."
  }
};

// Fallback images for cities without custom images
const CITY_FALLBACK_IMAGES: Record<string, string> = {
  'los-angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80',
  'austin': 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&q=80',
  'phoenix': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'new-york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&q=80',
  'houston': 'https://images.unsplash.com/photo-1530089711124-9ca31fb9e863?w=800&q=80',
  'san-diego': 'https://images.unsplash.com/photo-1538097304804-2a1b932466a9?w=800&q=80',
  'dallas': 'https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=800&q=80',
  'miami': 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800&q=80',
  'san-francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
  'denver': 'https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=800&q=80',
  'seattle': 'https://images.unsplash.com/photo-1502175353174-a7a70e73b4c3?w=800&q=80',
};

export const FeaturedCitiesSection: React.FC<FeaturedCitiesSectionProps> = ({ 
  language, 
  cities, 
  isLoading 
}) => {
  const content = LOCALIZED_CONTENT[language] || LOCALIZED_CONTENT.en;

  // Sort cities: featured first, then by guide count
  const sortedCities = React.useMemo(() => {
    const featured = ['los-angeles', 'austin', 'phoenix'];
    return [...cities].sort((a, b) => {
      const aFeatured = featured.indexOf(a.city_slug);
      const bFeatured = featured.indexOf(b.city_slug);
      
      if (aFeatured !== -1 && bFeatured !== -1) return aFeatured - bFeatured;
      if (aFeatured !== -1) return -1;
      if (bFeatured !== -1) return 1;
      return b.count - a.count;
    });
  }, [cities]);

  const featuredCities = sortedCities.slice(0, 3);
  const otherCities = sortedCities.slice(3);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!cities.length) {
    return (
      <section className="py-16 md:py-24 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center py-16 glass-luxury rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">{content.noGuides}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{content.noGuidesSubtitle}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-secondary/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {content.sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.sectionSubtitle}
          </p>
        </div>

        {/* Featured Cities - Equal Large Cards with Metadata */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {featuredCities.map((city, index) => {
            const imageUrl = city.image || CITY_FALLBACK_IMAGES[city.city_slug] || CITY_FALLBACK_IMAGES.marbella;
            const imageAlt = city.imageAlt || `Aerial view of ${city.city_name}`;
            const metadata = CITY_METADATA[city.city_slug] || { avgPrice: 'From $300K', bestFor: 'Lifestyle', vibe: 'Modern' };

            return (
              <Link
                key={city.city_slug}
                to={`/${language}/locations/${city.city_slug}`}
                className="group relative rounded-2xl overflow-hidden card-immersive aspect-[3/4] min-h-[350px] md:min-h-[420px]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <OptimizedImage
                    src={imageUrl}
                    alt={imageAlt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  {/* Top: Metadata Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/90 text-primary-foreground text-xs font-semibold shadow-lg">
                      {metadata.avgPrice}
                    </Badge>
                    <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white text-xs">
                      {metadata.bestFor}
                    </Badge>
                    <Badge className="bg-black/40 backdrop-blur-md border-white/10 text-white/90 text-xs">
                      {metadata.vibe}
                    </Badge>
                  </div>

                  {/* Bottom: City Info */}
                  <div>
                    {/* Guide Count Badge */}
                    <Badge className="mb-3 bg-white/10 backdrop-blur-md border-white/20 text-white">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {city.count} {city.count === 1 ? content.guideLabel : content.guidesLabel}
                    </Badge>

                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1 group-hover:text-primary transition-colors">
                      {city.city_name}
                    </h3>
                    <p className="text-white/70 text-sm mb-3">{city.region}</p>
                    
                    {/* CTA */}
                    <div className="flex items-center gap-2 text-primary font-medium text-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <MapPin className="w-4 h-4" />
                      <span>{content.exploreLabel}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Other Cities - Smaller Grid */}
        {otherCities.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {otherCities.map((city, index) => {
              const imageUrl = city.image || CITY_FALLBACK_IMAGES[city.city_slug] || CITY_FALLBACK_IMAGES.marbella;
              const metadata = CITY_METADATA[city.city_slug] || { avgPrice: 'From $300K', bestFor: 'Lifestyle', vibe: 'Modern' };

              return (
                <Link
                  key={city.city_slug}
                  to={`/${language}/locations/${city.city_slug}`}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden"
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                >
                  {/* Background */}
                  <div className="absolute inset-0">
                    <OptimizedImage
                      src={imageUrl}
                      alt={city.city_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between">
                    {/* Top: Price badge */}
                    <Badge className="self-start bg-primary/80 text-primary-foreground text-[10px] px-2 py-0.5">
                      {metadata.avgPrice}
                    </Badge>

                    {/* Bottom */}
                    <div>
                      <Badge className="mb-1 bg-white/10 backdrop-blur-sm border-white/20 text-white text-xs px-1.5 py-0.5">
                        {city.count} {city.count === 1 ? content.guideLabel : content.guidesLabel}
                      </Badge>
                      <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors">
                        {city.city_name}
                      </h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
