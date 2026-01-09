import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, ArrowRight, Bed, Bath, Square } from 'lucide-react';

interface Property {
    id: string;
    category: 'apartment' | 'villa';
    location: string;
    beds_min: number;
    baths: number;
    size_sqm: number;
    price_eur: number;
    images: string[];
    title?: string;
}

const PropertiesShowcase: React.FC = () => {
    const params = useParams();
    const lang = params.lang || 'en';
    const [apartments, setApartments] = useState<Property[]>([]);
    const [villas, setVillas] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (data) {
                    const typedData = data as Property[];
                    setApartments(typedData.filter(p => p.category === 'apartment').slice(0, 3));
                    setVillas(typedData.filter(p => p.category === 'villa').slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
    };

    const PropertyGrid = ({ items, title, subtitle }: { items: Property[], title: string, subtitle?: string }) => (
        <div className="mb-24 last:mb-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-landing-divider pb-6">
                <div>
                    <h3 className="text-3xl font-serif font-bold text-landing-navy mb-2">{title}</h3>
                    {subtitle && <p className="text-landing-text-secondary max-w-xl">{subtitle}</p>}
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((property) => {
                    const displayTitle = property.title || `${property.category === 'apartment' ? 'Luxury Apartment' : 'Exclusive Villa'}`;
                    return (
                        <div
                            key={property.id}
                            className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 bg-white"
                        >
                            {/* IMAGE CONTAINER - ENFORCED 16:9 ASPECT RATIO */}
                            <div className="relative w-full aspect-[16/9] overflow-hidden">
                                <img
                                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-2495db9dc2c3?w=800'}
                                    alt={displayTitle}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                {/* Price Badge */}
                                <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg">
                                    <p className="font-bold text-landing-navy">{formatPrice(property.price_eur)}</p>
                                </div>
                            </div>

                            {/* CONTENT SECTION */}
                            <div className="p-6">
                                {/* Location */}
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <MapPin size={16} className="text-landing-gold" />
                                    <span>{property.location}</span>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-landing-navy mb-4 group-hover:text-landing-gold transition-colors line-clamp-1">
                                    {displayTitle}
                                </h3>

                                {/* Features */}
                                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Bed size={18} className="text-gray-400" />
                                        <span>{property.beds_min} beds</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Bath size={18} className="text-gray-400" />
                                        <span>{property.baths} baths</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Square size={18} className="text-gray-400" />
                                        <span>{property.size_sqm}m²</span>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={() => {
                                        const event = new CustomEvent('openLeadForm', { detail: { interest: property.id } });
                                        window.dispatchEvent(event);
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-landing-navy to-landing-navy/90 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    View Details
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    if (loading) return null;

    return (
        <section id="properties-section" className="py-24 lg:py-32 bg-white">
            <div className="container mx-auto px-4">
                <PropertyGrid
                    items={apartments}
                    title="Apartments & Penthouses"
                    subtitle="Curated selection of premium developments with exceptional amenities"
                />
                <PropertyGrid
                    items={villas}
                    title="Townhouses & Villas"
                    subtitle="Private residences combining luxury, space, and architectural excellence"
                />
            </div>
        </section>
    );
};

export default PropertiesShowcase;
