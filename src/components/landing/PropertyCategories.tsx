import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Building2, Home } from 'lucide-react';

const PropertyCategories: React.FC = () => {
    const { t } = useTranslation('landing');

    const handleCategoryClick = (category: 'apartments' | 'villas') => {
        const section = document.getElementById(`${category}-section`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Fallback for when we might navigate to a filtered properties page in future
            console.warn('Section not found:', category);
        }
    };

    return (
        <section className="hidden md:block py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                {/* Section Heading */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 mb-4">
                        {t('properties.heading')}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        {t('properties.subheading')}
                    </p>
                </div>

                {/* Category Blocks */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Apartments Block */}
                    <div className="group relative bg-gradient-to-br from-primary/5 to-blue-50 rounded-3xl p-8 md:p-12 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                        onClick={() => handleCategoryClick('apartments')}>
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Building2 className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-serif text-gray-900">
                                {t('properties.types.apartments.title')}
                            </h3>
                            <p className="text-gray-700">
                                {t('properties.types.apartments.description')}
                            </p>
                            <Button
                                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg"
                            >
                                {t('properties.types.apartments.cta')}
                            </Button>
                        </div>
                    </div>

                    {/* Villas Block */}
                    <div className="group relative bg-gradient-to-br from-primary/5 to-blue-50 rounded-3xl p-8 md:p-12 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                        onClick={() => handleCategoryClick('villas')}>
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Home className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-serif text-gray-900">
                                {t('properties.types.villas.title')}
                            </h3>
                            <p className="text-gray-700">
                                {t('properties.types.villas.description')}
                            </p>
                            <Button
                                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg"
                            >
                                {t('properties.types.villas.cta')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PropertyCategories;
