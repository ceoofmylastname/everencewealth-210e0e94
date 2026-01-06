import React from 'react';
import PropertyCard from './PropertyCard';
import { LanguageCode } from '@/utils/landing/languageDetection';
import { trackEvent } from '@/utils/landing/analytics';

interface PropertyCarouselProps {
    language: LanguageCode;
    translations: any; // Using any to accommodate the new nested structure without strict typing for now
    onPropertySelect: (id: string, type: 'apartment' | 'villa') => void;
}

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

// Reusable Property Section Component
const PropertySection = ({ title, subtitle, properties, moreInfoText, onSelect, activeType, language }: any) => (
    <div className="mb-20">
        <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif text-[#1A2332]">
                {title}
            </h2>
            {subtitle && (
                <p className="text-gray-500 font-light max-w-2xl mx-auto">
                    {subtitle}
                </p>
            )}
            <div className="w-24 h-0.5 bg-[#C4A053] mx-auto opacity-30 mt-6"></div>
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden">
            <Carousel opts={{ loop: true }}>
                <CarouselContent>
                    {properties.map((property: any) => (
                        <CarouselItem key={property.id}>
                            <PropertyCard
                                id={property.id}
                                image={activeType === 'apartment' ? '/images/apartment-type.png' : '/images/villa-type.png'}
                                title={property.title}
                                price={property.price}
                                description={property.description}
                                moreInfoText={moreInfoText}
                                onSelect={(id) => onSelect(id, activeType)}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="flex justify-center gap-2 mt-6 relative">
                    <CarouselPrevious className="static translate-y-0" />
                    <CarouselNext className="static translate-y-0" />
                </div>
            </Carousel>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {properties.map((property: any) => (
                <PropertyCard
                    key={property.id}
                    id={property.id}
                    image={activeType === 'apartment' ? '/images/apartment-type.png' : '/images/villa-type.png'}
                    title={property.title}
                    price={property.price}
                    description={property.description}
                    moreInfoText={moreInfoText}
                    onSelect={(id) => onSelect(id, activeType)}
                />
            ))}
        </div>
    </div>
);

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ language, translations, onPropertySelect }) => {

    // In a real app we might map these ID's to images, for now using the generated generic ones
    return (
        <section id="properties-section" className="py-24 bg-[#FAFAFA]">
            <div className="container mx-auto px-4">

                {/* Header Copy */}
                <div className="text-center mb-16 space-y-2">
                    <h3 className="text-2xl font-serif text-[#1A2332]">{translations.header?.title}</h3>
                    <p className="text-gray-500 font-light italic">{translations.header?.subtitle}</p>
                </div>

                {/* Apartments Grid */}
                <PropertySection
                    title={translations.types.apartments.title}
                    // subtitle={translations.types.apartments.subtitle} // subtitle used in type selector, not here necessarily
                    properties={translations.apartments}
                    moreInfoText={translations.moreInfo}
                    onSelect={onPropertySelect}
                    activeType="apartment"
                    language={language}
                />

                {/* Villas Grid */}
                <PropertySection
                    title={translations.types.villas.title}
                    properties={translations.villas}
                    moreInfoText={translations.moreInfo}
                    onSelect={onPropertySelect}
                    activeType="villa"
                    language={language}
                />
            </div>
        </section>
    );
};




export default PropertyCarousel;
