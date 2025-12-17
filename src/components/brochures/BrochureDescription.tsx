import React from 'react';
import { Quote, MapPin } from 'lucide-react';

interface BrochureDescriptionProps {
  description: string;
  cityName?: string;
}

export const BrochureDescription: React.FC<BrochureDescriptionProps> = ({ description, cityName }) => {
  // Split description into paragraphs for editorial layout
  const paragraphs = description.split('\n\n').filter(p => p.trim());
  const firstParagraph = paragraphs[0] || description;
  const remainingParagraphs = paragraphs.slice(1);

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-prime-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-prime-gold/3 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Editorial Header */}
          <div className="text-center mb-12 reveal-on-scroll">
            {cityName && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-prime-gold/10 rounded-full text-prime-gold font-nav text-sm tracking-wider uppercase mb-6">
                <MapPin size={14} />
                <span>{cityName}, Costa del Sol</span>
              </div>
            )}
          </div>

          {/* Magazine-Style Quote Layout */}
          <div className="relative reveal-on-scroll">
            {/* Large Decorative Quote Mark */}
            <div className="absolute -top-8 -left-4 md:-left-12 text-prime-gold/20">
              <Quote className="w-16 h-16 md:w-24 md:h-24 rotate-180" />
            </div>
            
            {/* Gold Accent Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-prime-gold via-prime-gold/50 to-transparent rounded-full hidden md:block" />
            
            {/* Main Content */}
            <div className="md:pl-12">
              {/* First Paragraph - Drop Cap Style */}
              <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-relaxed mb-8 first-letter:text-6xl first-letter:md:text-7xl first-letter:font-bold first-letter:text-prime-gold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif">
                {firstParagraph}
              </p>
              
              {/* Remaining Paragraphs - Two Column on Desktop */}
              {remainingParagraphs.length > 0 && (
                <div className="grid md:grid-cols-2 gap-8 mt-12">
                  {remainingParagraphs.map((paragraph, index) => (
                    <p 
                      key={index} 
                      className="font-body text-lg text-muted-foreground leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-4 mt-16 reveal-on-scroll">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-prime-gold/30" />
            <div className="w-3 h-3 rotate-45 border-2 border-prime-gold/30" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-prime-gold/30" />
          </div>
        </div>
      </div>
    </section>
  );
};