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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {items.map((property) => (
                    <div
                        key={property.id}
                        className="group cursor-pointer bg-white"
                        onClick={() => {
                            const event = new CustomEvent('openLeadForm', { detail: { interest: property.id } });
                            window.dispatchEvent(event);
                        }}
                    >
                        <div className="relative aspect-[16/10] overflow-hidden rounded-sm mb-6 bg-gray-100">
                            <img
                                src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-2495db9dc2c3?w=800'}
                                alt={property.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 right-4 bg-white px-3 py-1.5 text-sm font-bold text-landing-navy shadow-sm">
                                {formatPrice(property.price_eur)}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-landing-text-secondary text-xs uppercase tracking-wider mb-2">
                                <MapPin size={14} className="text-landing-gold" />
                                <span>{property.location}</span>
                            </div>

                            <h4 className="text-xl font-bold text-landing-navy mb-4 group-hover:text-landing-gold transition-colors line-clamp-1">
                                {property.title || `${property.category === 'apartment' ? 'Luxury Apartment' : 'Exclusive Villa'}`}
                            </h4>

                            <div className="flex items-center gap-6 text-sm text-landing-text-secondary mb-6 border-t border-dashed border-gray-200 pt-4">
                                <div className="flex items-center gap-1.5">
                                    <Bed size={16} /> <span>{property.beds_min}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Bath size={16} /> <span>{property.baths}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Square size={16} /> <span>{property.size_sqm} m²</span>
                                </div>
                            </div>

                            <button className="text-landing-navy font-bold text-sm tracking-wide border-b-2 border-landing-gold/30 pb-0.5 hover:border-landing-gold transition-colors flex items-center gap-2">
                                VIEW DETAILS <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
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
