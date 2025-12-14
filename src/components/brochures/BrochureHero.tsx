import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BrochureHeroProps {
  city: {
    id?: string;
    slug: string;
    name: string;
    heroImage: string;
    hero_headline?: string | null;
    hero_subtitle?: string | null;
  };
  onViewBrochure?: () => void;
  onChat?: () => void;
}

export const BrochureHero: React.FC<BrochureHeroProps> = ({ 
  city, 
  onViewBrochure,
  onChat,
}) => {
  const headline = city.hero_headline || `Luxury Living in ${city.name}`;
  const subtitle = city.hero_subtitle || 'Where Luxury Meets the Mediterranean';

  return (
    <section className="brochure-hero relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={city.heroImage}
          alt={`${city.name} luxury real estate`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-prime-950/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-prime-950/95 via-prime-950/40 to-prime-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-prime-950/60 to-transparent" />
      </div>

      {/* Breadcrumb */}
      <div className="absolute top-24 left-0 right-0 z-20">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/brochure/marbella" className="hover:text-white transition-colors">Locations</Link>
            <ChevronRight size={14} />
            <span className="text-prime-gold font-medium">{city.name}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-32 pb-24">
        {/* Eyebrow */}
        <div className="mb-6 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-prime-gold/20 border border-prime-gold/30 rounded-full text-prime-goldLight text-sm font-nav tracking-wider uppercase">
            Costa del Sol
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight animate-zoom-in">
          {headline}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl lg:text-3xl font-light text-white/90 mb-10 animate-fade-in-up font-serif italic max-w-3xl mx-auto">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up">
          <Button
            onClick={onViewBrochure}
            size="lg"
            className="bg-prime-gold hover:bg-prime-goldDark text-prime-950 font-nav font-semibold px-8 py-6 text-base shadow-2xl shadow-prime-gold/30 hover:shadow-prime-gold/50 transition-all duration-300"
          >
            View Brochure
            <ChevronRight className="ml-2" size={18} />
          </Button>
          <Button
            onClick={onChat}
            variant="outline"
            size="lg"
            className="border-prime-gold/50 text-prime-gold hover:bg-prime-gold hover:text-prime-950 backdrop-blur-sm font-nav font-semibold px-8 py-6 text-base transition-all duration-300"
          >
            <MessageCircle className="mr-2" size={18} />
            Chat With Us
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-prime-gold rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};
