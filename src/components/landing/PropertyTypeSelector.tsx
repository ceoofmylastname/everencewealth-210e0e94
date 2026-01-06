import React from 'react';
import { Button } from '@/components/ui/button';


interface PropertyTypeSelectorProps {
    translations: any;
    onSelect: (type: 'apartment' | 'villa') => void;
}

const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({ translations, onSelect }) => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Apartments Card */}
                    <div className="group relative h-[500px] overflow-hidden rounded-sm shadow-xl cursor-pointer" onClick={() => {
                        onSelect('apartment');
                        document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        <div className="absolute inset-0">
                            <img
                                src="/images/apartment-type.png"
                                alt="Apartments"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6">
                            <h3 className="text-4xl font-serif text-white tracking-wide">
                                {translations.apartments.title}
                            </h3>
                            <p className="text-white/90 text-lg max-w-sm font-light">
                                {translations.apartments.subtitle}
                            </p>
                            <Button
                                className="bg-[#C4A053] hover:bg-[#B39043] text-white px-8 py-6 text-lg rounded-none uppercase tracking-wider"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect('apartment');
                                    document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {translations.apartments.cta}
                            </Button>
                        </div>
                    </div>

                    {/* Villas Card */}
                    <div className="group relative h-[500px] overflow-hidden rounded-sm shadow-xl cursor-pointer" onClick={() => {
                        onSelect('villa');
                        document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        <div className="absolute inset-0">
                            <img
                                src="/images/villa-type.png"
                                alt="Villas"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6">
                            <h3 className="text-4xl font-serif text-white tracking-wide">
                                {translations.villas.title}
                            </h3>
                            <p className="text-white/90 text-lg max-w-sm font-light">
                                {translations.villas.subtitle}
                            </p>
                            <Button
                                className="bg-[#C4A053] hover:bg-[#B39043] text-white px-8 py-6 text-lg rounded-none uppercase tracking-wider"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect('villa');
                                    document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {translations.villas.cta}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PropertyTypeSelector;
