import React from 'react';

interface BrochureGalleryProps {
  images: string[];
  cityName: string;
}

export const BrochureGallery: React.FC<BrochureGalleryProps> = ({ images, cityName }) => {
  if (!images || images.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-12">
          Discover {cityName}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {images.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl shadow-lg group ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <div className={`${index === 0 ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
                <img
                  src={image}
                  alt={`${cityName} - Image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
