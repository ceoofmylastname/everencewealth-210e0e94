import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Users, ChevronDown, MessageCircle } from 'lucide-react';
import EmmaChat from './EmmaChat';

interface HeroProps {
    onStartChat: () => void;
    onOpenVideo: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartChat, onOpenVideo }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const params = useParams();
    const lang = params.lang || window.location.pathname.split('/')[1] || 'en';

    // Simple translation map for key elements to ensure basic localization
    const translations = {
        en: {
            eyebrow: "Costa del Sol's Premier Real Estate",
            headline: ["Your Dream Home", "Awaits in Paradise"],
            subheadline: "Discover exclusive properties in Marbella, Estepona, and beyond. From €350k to €5M+. Your luxury lifestyle starts here.",
            ctaPrimary: "Browse Properties",
            ctaSecondary: "Chat with Emma AI",
            stats: { price: "€750k", priceLabel: "Avg Price", count: "250+", countLabel: "Villas", sat: "98%", satLabel: "Satisfied" },
            trust: { props: "500+ Properties", reviews: "4.9/5 Reviews", clients: "1000+ Happy Clients" }
        },
        nl: {
            eyebrow: "Costa del Sol's Premier Vastgoed",
            headline: ["Uw Droomhuis", "Wacht in het Paradijs"],
            subheadline: "Ontdek exclusieve woningen in Marbella, Estepona en daarbuiten. Van €350k tot €5M+. Uw luxe levensstijl begint hier.",
            ctaPrimary: "Bekijk Woningen",
            ctaSecondary: "Chat met Emma AI",
            stats: { price: "€750k", priceLabel: "Gem. Prijs", count: "250+", countLabel: "Villa's", sat: "98%", satLabel: "Tevreden" },
            trust: { props: "500+ Woningen", reviews: "4.9/5 Beoordelingen", clients: "1000+ Blije Klanten" }
        },
        de: {
            eyebrow: "Costa del Sol's Premium Immobilien",
            headline: ["Ihr Traumhaus", "Erwartet Sie im Paradies"],
            subheadline: "Entdecken Sie exklusive Immobilien in Marbella, Estepona und Umgebung. Ab 350.000 € bis 5 Mio. €+. Ihr Luxus-Lifestyle beginnt hier.",
            ctaPrimary: "Immobilien Ansehen",
            ctaSecondary: "Chatten mit Emma AI",
            stats: { price: "€750k", priceLabel: "Durschn. Preis", count: "250+", countLabel: "Villen", sat: "98%", satLabel: "Zufrieden" },
            trust: { props: "500+ Immobilien", reviews: "4.9/5 Bewertungen", clients: "1000+ Glückliche Kunden" }
        },
        fr: {
            eyebrow: "Immobilier de Premier Ordre",
            headline: ["Votre Maison de Rêve", "Vous Attend au Paradis"],
            subheadline: "Découvrez des propriétés exclusives à Marbella, Estepona et au-delà. De 350k € à 5M €+. Votre style de vie de luxe commence ici.",
            ctaPrimary: "Voir les Propriétés",
            ctaSecondary: "Discuter avec Emma AI",
            stats: { price: "€750k", priceLabel: "Prix Moyen", count: "250+", countLabel: "Villas", sat: "98%", satLabel: "Satisfait" },
            trust: { props: "500+ Propriétés", reviews: "4.9/5 Avis", clients: "1000+ Clients Heureux" }
        },
        // Fallbacks for others (using English for brevity in this refactor, but structure allows expansion)
        es: {
            eyebrow: "Costa del Sol's Premier Real Estate",
            headline: ["Your Dream Home", "Awaits in Paradise"],
            subheadline: "Discover exclusive properties in Marbella, Estepona, and beyond. From €350k to €5M+. Your luxury lifestyle starts here.",
            ctaPrimary: "Browse Properties",
            ctaSecondary: "Chat with Emma AI",
            stats: { price: "€750k", priceLabel: "Avg Price", count: "250+", countLabel: "Villas", sat: "98%", satLabel: "Satisfied" },
            trust: { props: "500+ Properties", reviews: "4.9/5 Reviews", clients: "1000+ Happy Clients" }
        }
    };

    const t = (translations as any)[lang] || translations.en;

    const scrollToProperties = () => {
        const element = document.getElementById('properties-section');
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative min-h-screen overflow-hidden flex items-center">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white to-secondary/5 z-0">
                {/* Animated particles/orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float-delayed" />
            </div>

            <div className="relative container mx-auto px-4 pt-32 pb-20 z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Text Content */}
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Eyebrow text */}
                        <div className="inline-block px-6 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
                            <p className="text-sm font-medium text-primary animate-shimmer flex items-center gap-2">
                                🏆 {t.eyebrow}
                            </p>
                        </div>

                        {/* Main Heading - Animated Gradient Text */}
                        <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-tight">
                            <span className="block text-gradient animate-gradient-x">
                                {t.headline[0]}
                            </span>
                            <span className="block text-[#1E3A5F]">
                                {t.headline[1]}
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl text-gray-600 leading-relaxed animate-fade-in-up animation-delay-200 max-w-lg">
                            {t.subheadline}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
                            <button
                                onClick={scrollToProperties}
                                className="group relative px-8 py-4 bg-gradient-to-r from-primary to-[#997B3D] text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center">
                                    {t.ctaPrimary}
                                    <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#997B3D] to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>

                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="px-8 py-4 bg-white border-2 border-primary text-primary rounded-2xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={20} />
                                {t.ctaSecondary}
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-gray-200/60 animate-fade-in-up animation-delay-600">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="text-green-500 w-5 h-5" />
                                <span className="text-sm font-medium text-gray-600">{t.trust.props}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="text-yellow-500 w-5 h-5 fill-current" />
                                <span className="text-sm font-medium text-gray-600">{t.trust.reviews}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="text-blue-500 w-5 h-5" />
                                <span className="text-sm font-medium text-gray-600">{t.trust.clients}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Hero Image with 3D Effect */}
                    <div className="relative animate-fade-in-left animation-delay-300 hidden lg:block">
                        {/* 3D Card Effect */}
                        <div className="relative group perspective-1000">
                            <div className="relative transform-gpu group-hover:rotate-y-6 transition-transform duration-700 preserve-3d">
                                {/* Main Image */}
                                <img
                                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"
                                    alt="Luxury Costa del Sol Villa"
                                    className="rounded-3xl shadow-2xl w-full h-[600px] object-cover"
                                />

                                {/* Glass Morphism Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl" />

                                {/* Floating Stats Cards */}
                                <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-4 translate-z-10">
                                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl transform transition-transform hover:-translate-y-2 duration-300">
                                        <p className="text-2xl font-bold text-primary">{t.stats.price}</p>
                                        <p className="text-xs text-gray-600 font-medium">{t.stats.priceLabel}</p>
                                    </div>
                                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl transform transition-transform hover:-translate-y-2 duration-300 delay-100">
                                        <p className="text-2xl font-bold text-[#1E3A5F]">{t.stats.count}</p>
                                        <p className="text-xs text-gray-600 font-medium">{t.stats.countLabel}</p>
                                    </div>
                                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl transform transition-transform hover:-translate-y-2 duration-300 delay-200">
                                        <p className="text-2xl font-bold text-orange-500">{t.stats.sat}</p>
                                        <p className="text-xs text-gray-600 font-medium">{t.stats.satLabel}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-500" />
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToProperties}>
                <ChevronDown className="text-primary opacity-80" size={32} />
            </div>

            {/* EMMA CHAT COMPONENT */}
            <EmmaChat
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                language={lang}
            />
        </section>
    );
};

export default Hero;
