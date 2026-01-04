import React from 'react';
import { Button } from '@/components/ui/button';
import { LanguageCode } from '@/utils/landing/languageDetection';

export interface Property {
    id: string;
    images: [string, string, string];
    price: number;
    type: 'apartment' | 'villa';
    titleKey: string; // Key for translation map
}

interface PropertyCardProps {
    property: Property;
    translations: {
        title: string;
        description: string;
    };
    moreInfoText: string;
    language: LanguageCode;
    onSelect: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    translations,
    moreInfoText,
    onSelect
}) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        // Immediate transition to image 2 (index 1)
        setCurrentImageIndex(1);

        // Delayed transition to image 3 (index 2)
        hoverTimeoutRef.current = setTimeout(() => {
            setCurrentImageIndex(2);
        }, 1200);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setCurrentImageIndex(0);
    };

    return (
        <div
            className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 property-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/2] overflow-hidden bg-gray-200">
                {property.images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={translations.title}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        loading="lazy"
                    />
                ))}

                {/* Price Tag */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-sm font-semibold text-[#1A2332] rounded-sm">
                    From €{property.price.toLocaleString()}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 text-center space-y-4">
                <h3 className="text-xl font-serif text-[#1A2332]">
                    {translations.title}
                </h3>
                <p className="text-sm text-gray-500 font-light min-h-[40px]">
                    {translations.description}
                </p>

                <Button
                    onClick={() => onSelect(property.id)}
                    variant="outline"
                    className="w-full border-[#C4A053] text-[#C4A053] hover:bg-[#C4A053] hover:text-white transition-colors"
                >
                    {moreInfoText}
                </Button>
            </div>
        </div>
    );
};

export default PropertyCard;
