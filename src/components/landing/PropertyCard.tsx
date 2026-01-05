import React from 'react';
import { Button } from '@/components/ui/button';
import { LanguageCode } from '@/utils/landing/languageDetection';



interface PropertyCardProps {
    id: string;
    image: string;
    title: string;
    price: string;
    description: string;
    moreInfoText: string;
    onSelect: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
    id,
    image,
    title,
    price,
    description,
    moreInfoText,
    onSelect
}) => {
    return (
        <div className="group flex flex-col items-center text-center space-y-4">
            {/* Image */}
            <div className="w-full aspect-[4/3] overflow-hidden rounded-sm shadow-md mb-2">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />
            </div>

            {/* Content */}
            <div className="space-y-3 px-2">
                <h3 className="text-2xl font-serif text-[#1A2332]">
                    {title}
                </h3>

                <p className="text-[#1A2332] font-medium tracking-wide">
                    {price}
                </p>

                <p className="text-sm text-gray-500 font-light max-w-xs mx-auto">
                    {description}
                </p>

                <div className="pt-2">
                    <Button
                        onClick={() => onSelect(id)}
                        className="bg-[#C4A053] hover:bg-[#B39043] text-white rounded-none px-6 py-2 text-sm font-medium tracking-wide shadow-sm hover:shadow-md transition-all"
                    >
                        {moreInfoText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
