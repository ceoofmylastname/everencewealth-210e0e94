import React from 'react';
import { Button } from '@/components/ui/button';

interface PropertyTypeSelectorProps {
    labels: {
        apartments: string;
        villas: string;
    };
    activeType: 'apartment' | 'villa';
    onSelect: (type: 'apartment' | 'villa') => void;
}

const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({ labels, activeType, onSelect }) => {
    return (
        <div className="flex justify-center gap-4 mb-12">
            <Button
                onClick={() => onSelect('apartment')}
                variant={activeType === 'apartment' ? 'default' : 'outline'}
                className={`h-12 px-8 text-lg font-serif transition-all duration-300 ${activeType === 'apartment'
                        ? 'bg-[#1A2332] text-white shadow-lg hover:bg-[#2C3E50]'
                        : 'bg-white text-[#1A2332]  border-gray-200 hover:border-[#1A2332]'
                    }`}
            >
                {labels.apartments}
            </Button>

            <Button
                onClick={() => onSelect('villa')}
                variant={activeType === 'villa' ? 'default' : 'outline'}
                className={`h-12 px-8 text-lg font-serif transition-all duration-300 ${activeType === 'villa'
                        ? 'bg-[#1A2332] text-white shadow-lg hover:bg-[#2C3E50]'
                        : 'bg-white text-[#1A2332] border-gray-200 hover:border-[#1A2332]'
                    }`}
            >
                {labels.villas}
            </Button>
        </div>
    );
};

export default PropertyTypeSelector;
