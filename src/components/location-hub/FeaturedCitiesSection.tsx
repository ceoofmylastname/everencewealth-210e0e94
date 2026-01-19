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
    sectionSubtitle: "Select a city to discover comprehensive guides about property, lifestyle, and investment opportunities.",
    guidesLabel: "guides",
    guideLabel: "guide",
    exploreLabel: "Explore Guides",
    noGuides: "No Location Guides Yet",
    noGuidesSubtitle: "Location intelligence pages are coming soon. Check back later for comprehensive guides to Costa del Sol cities."
  },
  nl: {
    sectionTitle: "Verken per Stad",
    sectionSubtitle: "Selecteer een stad om uitgebreide gidsen te ontdekken over vastgoed, levensstijl en investeringsmogelijkheden.",
    guidesLabel: "gidsen",
    guideLabel: "gids",
    exploreLabel: "Gidsen Verkennen",
    noGuides: "Nog Geen Locatiegidsen",
    noGuidesSubtitle: "Locatie-intelligentiepagina's komen binnenkort. Kom later terug voor uitgebreide gidsen."
  },
  de: {
    sectionTitle: "Nach Stadt Erkunden",
    sectionSubtitle: "Wählen Sie eine Stadt, um umfassende Führer über Immobilien, Lebensstil und Investitionsmöglichkeiten zu entdecken.",
    guidesLabel: "Führer",
    guideLabel: "Führer",
    exploreLabel: "Führer Erkunden",
    noGuides: "Noch Keine Standortführer",
    noGuidesSubtitle: "Standort-Intelligenzseiten kommen bald. Schauen Sie später für umfassende Führer vorbei."
  },
  fr: {
    sectionTitle: "Explorer par Ville",
    sectionSubtitle: "Sélectionnez une ville pour découvrir des guides complets sur l'immobilier, le style de vie et les opportunités d'investissement.",
    guidesLabel: "guides",
    guideLabel: "guide",
    exploreLabel: "Explorer les Guides",
    noGuides: "Pas Encore de Guides",
    noGuidesSubtitle: "Les pages d'intelligence de localisation arrivent bientôt. Revenez plus tard."
  }
};

// Fallback images for cities without custom images
const CITY_FALLBACK_IMAGES: Record<string, string> = {
  marbella: 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&q=80',
  estepona: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=800&q=80',
  fuengirola: 'https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=800&q=80',
  benalmadena: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800&q=80',
  malaga: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80',
  torremolinos: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  casares: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80',
  mijas: 'https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=800&q=80'
};

export const FeaturedCitiesSection: React.FC<FeaturedCitiesSectionProps> = ({ 
  language, 
  cities, 
  isLoading 
}) => {
  const content = LOCALIZED_CONTENT[language] || LOCALIZED_CONTENT.en;

  // Sort cities: featured first (Marbella, Estepona, Fuengirola), then by guide count
  const sortedCities = React.useMemo(() => {
    const featured = ['marbella', 'estepona', 'fuengirola'];
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

        {/* Featured Cities - Large Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {featuredCities.map((city, index) => {
            const imageUrl = city.image || CITY_FALLBACK_IMAGES[city.city_slug] || CITY_FALLBACK_IMAGES.marbella;
            const imageAlt = city.imageAlt || `Aerial view of ${city.city_name}, Costa del Sol`;

            return (
              <Link
                key={city.city_slug}
                to={`/${language}/locations/${city.city_slug}`}
                className={`group relative rounded-2xl overflow-hidden card-immersive ${index === 0 ? 'md:row-span-2 md:aspect-auto' : 'aspect-[4/3]'}`}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  {/* Badge */}
                  <Badge className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border-white/20 text-white">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {city.count} {city.count === 1 ? content.guideLabel : content.guidesLabel}
                  </Badge>

                  {/* City Info */}
                  <div>
                    <h3 className={`font-serif font-bold text-white mb-1 group-hover:text-primary transition-colors ${index === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                      {city.city_name}
                    </h3>
                    <p className="text-white/70 text-sm mb-3">{city.region}, Spain</p>
                    
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
                      alt={`${city.city_name}, Costa del Sol`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <Badge className="absolute top-2 right-2 bg-white/10 backdrop-blur-sm border-white/20 text-white text-xs">
                      {city.count}
                    </Badge>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                      {city.city_name}
                    </h3>
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
