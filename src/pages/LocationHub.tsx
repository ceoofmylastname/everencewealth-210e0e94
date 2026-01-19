import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Compass, ChevronDown, TrendingUp, Users, Home, MapPin, Globe, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

// New components
import { SpeakableHubIntro } from "@/components/location-hub/SpeakableHubIntro";
import { WhatToExpectSection } from "@/components/location-hub/WhatToExpectSection";
import { FeaturedCitiesSection } from "@/components/location-hub/FeaturedCitiesSection";
import { HubFAQSection } from "@/components/location-hub/HubFAQSection";
import { 
  getLocalizedHubContent, 
  generateHubSchemaGraph, 
  generateHubHreflangTags,
  getHubCanonicalUrl,
  getHubLocale 
} from "@/lib/locationHubSchemaGenerator";

const STATS = [
  { icon: MapPin, label: "Cities", value: "8", suffix: "" },
  { icon: BookOpen, label: "Guides", value: "19+", suffix: "" },
  { icon: Globe, label: "Languages", value: "10", suffix: "" },
  { icon: TrendingUp, label: "Intent Types", value: "8", suffix: "" },
];

interface CityData {
  city_slug: string;
  city_name: string;
  region: string;
  count: number;
  image?: string;
  imageAlt?: string;
}

const LocationHub = () => {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['location-cities', lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('location_pages')
        .select('id, city_slug, city_name, region, topic_slug, featured_image_url, featured_image_alt')
        .eq('status', 'published')
        .eq('language', lang);

      if (error) throw error;

      const cityMap = new Map<string, CityData>();
      data?.forEach(page => {
        const existing = cityMap.get(page.city_slug);
        if (existing) {
          existing.count++;
          if (!existing.image && page.featured_image_url) {
            existing.image = page.featured_image_url;
            existing.imageAlt = page.featured_image_alt || undefined;
          }
        } else {
          cityMap.set(page.city_slug, {
            city_slug: page.city_slug,
            city_name: page.city_name,
            region: page.region,
            count: 1,
            image: page.featured_image_url || undefined,
            imageAlt: page.featured_image_alt || undefined,
          });
        }
      });

      return Array.from(cityMap.values()).sort((a, b) => b.count - a.count);
    },
  });

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' });
  };

  // Get localized content and generate schema
  const hubContent = getLocalizedHubContent(lang);
  const canonicalUrl = getHubCanonicalUrl(lang);
  const locale = getHubLocale(lang);
  const totalGuides = cities.reduce((sum, city) => sum + city.count, 0);
  
  const schemaGraph = generateHubSchemaGraph(lang, {
    language: lang,
    title: hubContent.title,
    description: hubContent.description,
    speakableSummary: hubContent.speakableSummary,
    cities: cities.map(c => ({ name: c.city_name, slug: c.city_slug, guideCount: c.count })),
    totalGuides,
    intentTypes: 8
  });

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{hubContent.title}</title>
        <meta name="description" content={hubContent.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={hubContent.title} />
        <meta property="og:description" content={hubContent.description} />
        <meta property="og:locale" content={locale} />
        <meta property="og:site_name" content="Del Sol Prime Homes" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={hubContent.title} />
        <meta name="twitter:description" content={hubContent.description} />
        <script type="application/ld+json">{JSON.stringify(schemaGraph)}</script>
      </Helmet>

      <Header variant="solid" />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
            <div className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full bg-secondary/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center pt-24">
            {/* Breadcrumbs */}
            <nav 
              aria-label="Breadcrumb" 
              className={`mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <ol className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <li>
                  <Link to={`/${lang}`} className="hover:text-primary transition-colors">Home</Link>
                </li>
                <ChevronRight className="w-4 h-4" />
                <li className="text-foreground font-medium">Locations</li>
              </ol>
            </nav>

            {/* Badge */}
            <div className={`mb-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Badge className="badge-luxury px-5 py-2.5 text-sm font-medium">
                <Compass className="w-4 h-4 mr-2" />
                {cities.length} Cities • {totalGuides || '19+'}  Guides • 10 Languages
              </Badge>
            </div>

            {/* Main H1 - Speakable */}
            <h1 
              className={`speakable-answer text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-[1.1] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              Costa del Sol
              <span className="block text-gradient-gold">Location Guides</span>
            </h1>

            {/* Subtitle */}
            <p 
              className={`text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {hubContent.description}
            </p>

            {/* Stats Bar */}
            <div 
              className={`flex flex-wrap justify-center gap-8 md:gap-12 mb-8 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {STATS.map((stat, index) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}{stat.suffix}
                  </span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={scrollToContent}
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-all cursor-pointer group ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            aria-label="Scroll to content"
          >
            <span className="text-xs uppercase tracking-widest font-medium">Explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-2 group-hover:border-primary transition-colors">
              <ChevronDown className="w-4 h-4 animate-scroll-indicator" />
            </div>
          </button>
        </section>

        {/* AI-Ready Speakable Section */}
        <SpeakableHubIntro language={lang} cityCount={cities.length} guideCount={totalGuides} />

        {/* What to Expect Section */}
        <WhatToExpectSection language={lang} />

        {/* Featured Cities Grid */}
        <FeaturedCitiesSection language={lang} cities={cities} isLoading={isLoading} />

        {/* FAQ Section */}
        <HubFAQSection language={lang} />

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Ready to Find Your Perfect Location?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Our expert team is ready to help you navigate the Costa del Sol property market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-luxury">
                <Link to={`/${lang}/#contact`}>Book a Consultation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={`/${lang}/properties`}>Browse Properties</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default LocationHub;
