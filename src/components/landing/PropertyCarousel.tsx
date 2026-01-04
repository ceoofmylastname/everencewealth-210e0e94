import React, { useState } from 'react';
import PropertyCard, { Property } from './PropertyCard';
import PropertyTypeSelector from './PropertyTypeSelector';
import { LanguageCode } from '@/utils/landing/languageDetection';
import { trackEvent } from '@/utils/landing/analytics';

interface PropertyCarouselProps {
    language: LanguageCode;
    translations: {
        types: { apartments: string; villas: string };
        moreInfo: string;
        list: Record<string, { title: string; description: string }>;
    };
    onPropertySelect: (id: string, type: 'apartment' | 'villa') => void;
}

// Mock Data (in a real app, this might come from props or API)
const apartments: Property[] = [
    { id: 'panorama-bay', type: 'apartment', price: 385000, titleKey: 'panorama-bay', images: ['/images/properties/panorama-bay-1.webp', '/images/properties/panorama-bay-2.webp', '/images/properties/panorama-bay-3.webp'] },
    { id: 'sunset-residences', type: 'apartment', price: 420000, titleKey: 'sunset-residences', images: ['/images/properties/sunset-1.webp', '/images/properties/sunset-2.webp', '/images/properties/sunset-3.webp'] },
    { id: 'green-valley-gardens', type: 'apartment', price: 450000, titleKey: 'green-valley-gardens', images: ['/images/properties/green-1.webp', '/images/properties/green-2.webp', '/images/properties/green-3.webp'] },
    { id: 'la-perla-marina', type: 'apartment', price: 510000, titleKey: 'la-perla-marina', images: ['/images/properties/perla-1.webp', '/images/properties/perla-2.webp', '/images/properties/perla-3.webp'] },
    { id: 'aqua-blu-oasis', type: 'apartment', price: 393000, titleKey: 'aqua-blu-oasis', images: ['/images/properties/aqua-1.webp', '/images/properties/aqua-2.webp', '/images/properties/aqua-3.webp'] },
    { id: 'elevate-suites', type: 'apartment', price: 440000, titleKey: 'elevate-suites', images: ['/images/properties/elevate-1.webp', '/images/properties/elevate-2.webp', '/images/properties/elevate-3.webp'] },
];

const villas: Property[] = [
    { id: 'villa-amalfi', type: 'villa', price: 790000, titleKey: 'villa-amalfi', images: ['/images/properties/amalfi-1.webp', '/images/properties/amalfi-2.webp', '/images/properties/amalfi-3.webp'] },
    // Duplicating for demo since I only have one villa translation in example but I should have 6
    // I'll reuse the IDs for now but in real scenario they'd be unique.
    // Actually, I'll allow duplicates for the grid visual if I lack data, but assume uniqueness.
    // Using placeholders for the rest of the villa data
    { id: 'villa-amalfi-2', type: 'villa', price: 850000, titleKey: 'villa-amalfi', images: ['/images/properties/amalfi-1.webp', '/images/properties/amalfi-2.webp', '/images/properties/amalfi-3.webp'] },
    { id: 'villa-amalfi-3', type: 'villa', price: 1250000, titleKey: 'villa-amalfi', images: ['/images/properties/amalfi-1.webp', '/images/properties/amalfi-2.webp', '/images/properties/amalfi-3.webp'] },
    { id: 'villa-amalfi-4', type: 'villa', price: 995000, titleKey: 'villa-amalfi', images: ['/images/properties/amalfi-1.webp', '/images/properties/amalfi-2.webp', '/images/properties/amalfi-3.webp'] },
    { id: 'villa-amalfi-5', type: 'villa', price: 2100000, titleKey: 'villa-amalfi', images: ['/images/properties/amalfi-1.webp', '/images/properties/amalfi-2.webp', '/images/properties/amalfi-3.webp'] },
    { id: 'villa-amalfi-6', type: 'villa', price: 1800000, titleKey: 'villa-amalfi', images: ['/images/properties/amalfi-1.webp', '/images/properties/amalfi-2.webp', '/images/properties/amalfi-3.webp'] },
];

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ language, translations, onPropertySelect }) => {
    const [activeType, setActiveType] = useState<'apartment' | 'villa'>('apartment');

    const properties = activeType === 'apartment' ? apartments : villas;

    const handleSelect = (id: string) => {
        trackEvent('property_view', {
            category: 'Property',
            property_id: id,
            property_type: activeType,
            language
        });
        onPropertySelect(id, activeType);
    };

    return (
        <section id="properties-section" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif text-[#1A2332] mb-4">
                        {activeType === 'apartment' ? translations.types.apartments : translations.types.villas}
                    </h2>
                    <div className="w-24 h-1 bg-[#C4A053] mx-auto opacity-50"></div>
                </div>

                <PropertyTypeSelector
                    labels={translations.types}
                    activeType={activeType}
                    onSelect={setActiveType}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            translations={translations.list[property.titleKey] || { title: property.titleKey, description: '' }}
                            moreInfoText={translations.moreInfo}
                            language={language}
                            onSelect={handleSelect}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PropertyCarousel;
