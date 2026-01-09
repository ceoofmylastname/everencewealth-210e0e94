import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Heart, Share2, Bed, Bath, Square, ArrowRight } from 'lucide-react';

interface Property {
    id: string;
    category: 'apartment' | 'villa';
    location: string;
    beds_min: number;
    beds_max?: number;
    baths: number;
    size_sqm: number;
    price_eur: number;
    images: string[];
    descriptions: Record<string, string>;
    title?: string; // Add optional title to interface as it might be missing in DB or constructed
}

const PropertiesShowcase: React.FC = () => {
    const params = useParams();
    const lang = params.lang || window.location.pathname.split('/')[1] || 'en';

    const [apartments, setApartments] = useState<Property[]>([]);
    const [villas, setVillas] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    // Translations
    const translations = {
        en: {
            featured: "Featured Properties",
            title: ["Exclusive", "Listings"],
            viewAll: "View All Properties",
            beds: "beds",
            baths: "baths",
            viewDetails: "View Details"
        },
        nl: {
            featured: "Uitgelichte Woningen",
            title: ["Exclusieve", "Aanbiedingen"],
            viewAll: "Bekijk Alle Woningen",
            beds: "bedden",
            baths: "baden",
            viewDetails: "Bekijk Details"
        },
        // ... (Simplified fallback for brevity, assuming similar pattern or EN default)
    };

    // Helper to get translation or fallback
    const t = (translations as any)[lang] || translations.en;

    const sectionHeadings = {
        en: { apartments: "Apartments & Penthouses", villas: "Townhouses & Villas" },
        nl: { apartments: "Appartementen & Penthouses", villas: "Townhouses & Villa's" },
        fr: { apartments: "Appartements & Penthouses", villas: "Maisons de ville & Villas" },
        de: { apartments: "Apartments & Penthäuser", villas: "Reihenhäuser & Villen" },
        pl: { apartments: "Apartamenty i Penthouse'y", villas: "Domy szeregowe i Wille" },
        sv: { apartments: "Lägenheter & Takvåningar", villas: "Radhus & Villor" },
        da: { apartments: "Lejligheder & Penthouselejligheder", villas: "Rækkehuse & Villaer" },
        fi: { apartments: "Huoneistot & Kattohuoneistot", villas: "Rivitalot & Huvilat" },
        hu: { apartments: "Apartmanok & Penthouse-ok", villas: "Sorházak & Villák" },
        no: { apartments: "Leiligheter & Penthouse", villas: "Rekkehus & Villaer" }
    };

    const currentHeadings = sectionHeadings[lang as keyof typeof sectionHeadings] || sectionHeadings.en;

    // Fetch properties
    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const { data, error } = await (supabase as any)
                    .from('properties')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (error) throw error;

                if (data) {
                    const typedData = data as Property[];
                    setApartments(typedData.filter(p => p.category === 'apartment').slice(0, 3)); // Top 3
                    setVillas(typedData.filter(p => p.category === 'villa').slice(0, 3)); // Top 3
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

    const PropertyGrid = ({ items, title }: { items: Property[], title: string }) => (
        <div className="mb-20 last:mb-0">
            <div className="flex justify-between items-end mb-12 animate-fade-in-up">
                <div>
                    <h3 className="text-3xl font-serif font-bold text-gray-800">{title}</h3>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((property, index) => {
                    // Construct title if missing (DB might not have 'title', usually description or location)
                    const displayTitle = property.title || `${property.category === 'apartment' ? 'Luxury Apartment' : 'Exclusive Villa'} in ${property.location}`;

                    return (
                        <div
                            key={property.id}
                            className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up bg-white"
                            style={{ animationDelay: `${index * 150}ms` }}
                            onClick={() => {
                                // Trigger openLeadForm event
                                const event = new CustomEvent('openLeadForm', { detail: { interest: property.id } });
                                window.dispatchEvent(event);
                            }}
                        >
                            {/* Image Container */}
                            <div className="relative h-80 overflow-hidden cursor-pointer">
                                <img
                                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-2495db9dc2c3?w=800'}
                                    alt={displayTitle}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                {/* Price Badge */}
                                <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg">
                                    <p className="font-bold text-primary">{formatPrice(property.price_eur)}</p>
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button className="p-3 bg-white/90 backdrop-blur-md rounded-full hover:bg-primary hover:text-white transition-colors">
                                        <Heart size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Location */}
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <MapPin size={16} className="text-primary" />
                                    <span>{property.location}</span>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-[#1E3A5F] mb-4 group-hover:text-primary transition-colors line-clamp-1">
                                    {displayTitle}
                                </h3>

                                {/* Features */}
                                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Bed size={18} className="text-gray-400" />
                                        <span>{property.beds_min} {t.beds}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Bath size={18} className="text-gray-400" />
                                        <span>{property.baths} {t.baths}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Square size={18} className="text-gray-400" />
                                        <span>{property.size_sqm}m²</span>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button className="w-full py-3 bg-gradient-to-r from-primary to-[#997B3D] text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                                    {t.viewDetails}
                                    <ArrowRight size={18} />
                                </button>
                            </div>

                            {/* Decorative Element */}
                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:opacity-100 opacity-0 transition-opacity duration-500 pointer-events-none" />
                        </div>
                    );
                })}
            </div>
        </div>
    );

    if (loading) return <div className="py-32 text-center"><p className="text-gray-500 animate-pulse">Loading properties...</p></div>;

    return (
        <section id="properties-section" className="py-32 bg-white overflow-hidden">
            <div className="container mx-auto px-4">

                {/* Section Header */}
                <div className="mb-16 animate-fade-in-up text-center">
                    <p className="text-primary font-semibold mb-4 tracking-wider uppercase">{t.featured}</p>
                    <h2 className="text-4xl lg:text-5xl font-serif font-bold">
                        <span className="text-gradient animate-gradient-x block sm:inline">
                            {t.title[0]}
                        </span>
                        <span className="text-[#1E3A5F] block sm:inline ml-0 sm:ml-3">
                            {t.title[1]}
                        </span>
                    </h2>
                </div>

                <PropertyGrid items={apartments} title={currentHeadings.apartments} />
                <PropertyGrid items={villas} title={currentHeadings.villas} />

                <div className="text-center mt-12">
                    <button className="px-8 py-4 border-2 border-primary text-primary rounded-2xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg inline-flex items-center gap-2">
                        {t.viewAll} <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default PropertiesShowcase;
