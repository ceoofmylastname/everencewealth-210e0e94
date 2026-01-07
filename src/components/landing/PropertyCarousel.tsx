import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { supabase } from '@/integrations/supabase/client';

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
}

const PropertyCarousel: React.FC = () => {
    const params = useParams();
    const lang = params.lang || window.location.pathname.split('/')[1] || 'en';

    const [apartments, setApartments] = useState<Property[]>([]);
    const [villas, setVillas] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    // Page header translations
    const pageHeaders = {
        en: {
            mainTitle: "Find Your Perfect Home",
            subtitle: "Browse our hand-picked selection of premium properties on the Costa del Sol"
        },
        nl: {
            mainTitle: "Vind Uw Perfecte Huis",
            subtitle: "Bekijk onze zorgvuldig geselecteerde selectie van premium woningen aan de Costa del Sol"
        },
        fr: {
            mainTitle: "Trouvez Votre Maison Parfaite",
            subtitle: "Parcourez notre sélection soigneusement choisie de propriétés premium sur la Costa del Sol"
        },
        de: {
            mainTitle: "Finden Sie Ihr Perfektes Zuhause",
            subtitle: "Durchsuchen Sie unsere handverlesene Auswahl an Premium-Immobilien an der Costa del Sol"
        },
        pl: {
            mainTitle: "Znajdź Swój Idealny Dom",
            subtitle: "Przeglądaj naszą starannie dobraną selekcję luksusowych nieruchomości na Costa del Sol"
        },
        sv: {
            mainTitle: "Hitta Ditt Perfekta Hem",
            subtitle: "Bläddra igenom vårt handplockade urval av premiumfastigheter på Costa del Sol"
        },
        da: {
            mainTitle: "Find Dit Perfekte Hjem",
            subtitle: "Gennemse vores håndplukkede udvalg af premiumendomme på Costa del Sol"
        },
        fi: {
            mainTitle: "Löydä Täydellinen Kotisi",
            subtitle: "Selaa huolellisesti valittuja premium-kiinteistöjä Costa del Solilla"
        },
        hu: {
            mainTitle: "Találja Meg Tökéletes Otthonát",
            subtitle: "Böngésszen kézzel válogatott prémium ingatlanjaink között a Costa del Solon"
        },
        no: {
            mainTitle: "Finn Ditt Perfekte Hjem",
            subtitle: "Bla gjennom vårt håndplukkede utvalg av premiumeiendommer på Costa del Sol"
        }
    };

    const currentHeader = pageHeaders[lang as keyof typeof pageHeaders] || pageHeaders.en;

    // Section headings
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

    // Fetch properties from database
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
                    const apts = typedData.filter(p => p.category === 'apartment').slice(0, 6);
                    const vls = typedData.filter(p => p.category === 'villa').slice(0, 6);

                    setApartments(apts);
                    setVillas(vls);
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    if (loading) {
        return (
            <div className="py-16 text-center">
                <p className="text-gray-600">Loading properties...</p>
            </div>
        );
    }

    return (
        <div className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4">

                {/* PAGE HEADER - FULLY TRANSLATED */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 mb-4">
                        {currentHeader.mainTitle}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        {currentHeader.subtitle}
                    </p>
                </div>

                <div className="space-y-16 md:space-y-24">

                    {/* APARTMENTS SECTION */}
                    <section id="apartments-section" className="scroll-mt-20">
                        <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-8 md:mb-12">
                            {currentHeadings.apartments}
                        </h3>

                        {/* MOBILE: Vertical Stack (6 cards) */}
                        <div className="md:hidden space-y-6">
                            {apartments.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={{
                                        ...property,
                                        description: property.descriptions[lang] || property.descriptions.en || ''
                                    }}
                                    lang={lang}
                                />
                            ))}
                        </div>

                        {/* DESKTOP: 3-Column Grid */}
                        <div className="hidden md:grid md:grid-cols-3 gap-8">
                            {apartments.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={{
                                        ...property,
                                        description: property.descriptions[lang] || property.descriptions.en || ''
                                    }}
                                    lang={lang}
                                />
                            ))}
                        </div>
                    </section>

                    {/* VILLAS SECTION */}
                    <section id="villas-section" className="scroll-mt-20">
                        <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-8 md:mb-12">
                            {currentHeadings.villas}
                        </h3>

                        {/* MOBILE: Vertical Stack (6 cards) */}
                        <div className="md:hidden space-y-6">
                            {villas.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={{
                                        ...property,
                                        description: property.descriptions[lang] || property.descriptions.en || ''
                                    }}
                                    lang={lang}
                                />
                            ))}
                        </div>

                        {/* DESKTOP: 3-Column Grid */}
                        <div className="hidden md:grid md:grid-cols-3 gap-8">
                            {villas.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={{
                                        ...property,
                                        description: property.descriptions[lang] || property.descriptions.en || ''
                                    }}
                                    lang={lang}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PropertyCarousel;
