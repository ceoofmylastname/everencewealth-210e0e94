import React from 'react';

interface BrochureDescriptionProps {
  description: string;
}

export const BrochureDescription: React.FC<BrochureDescriptionProps> = ({ description }) => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center">
          <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};
