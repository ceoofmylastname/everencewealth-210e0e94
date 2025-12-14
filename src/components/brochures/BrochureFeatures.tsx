import React from 'react';
import { Check } from 'lucide-react';

interface BrochureFeaturesProps {
  features: string[];
  cityName: string;
}

export const BrochureFeatures: React.FC<BrochureFeaturesProps> = ({ features, cityName }) => {
  if (!features || features.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
          Why Choose {cityName}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-prime-gold/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-prime-gold" />
              </div>
              <span className="font-body text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
