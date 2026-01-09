import React from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
    onStartChat: () => void;
    onOpenVideo?: () => void;
    translations?: any;
}

const Hero: React.FC<HeroProps> = ({ onStartChat, translations }) => {
    return (
        <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Parallax Effect */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop"
                    alt="Costa del Sol Luxury Real Estate"
                    className="w-full h-full object-cover animate-ken-burns"
                />
                {/* Muted Overlay */}
                <div className="absolute inset-0 bg-landing-navy/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center text-white">
                <div className="max-w-4xl mx-auto opacity-0 animate-hero-title-reveal" style={{ animationDelay: '0.2s' }}>
                    <h1 className="text-4xl md:text-6xl lg:text-[64px] font-serif font-bold leading-tight mb-6 drop-shadow-lg">
                        {translations?.hero?.headline || "Discover Your Costa del Sol Investment"}
                    </h1>
                </div>

                <div className="max-w-2xl mx-auto opacity-0 animate-hero-title-reveal" style={{ animationDelay: '0.4s' }}>
                    <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-12 leading-relaxed">
                        {translations?.hero?.subheadline || "Curated luxury properties for discerning international investors"}
                    </p>

                    <button
                        onClick={onStartChat}
                        className="group relative inline-flex items-center justify-center px-10 py-5 bg-white text-landing-navy text-lg font-bold tracking-wide rounded-sm hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)]"
                    >
                        <span>{translations?.hero?.cta || "Begin Your Private Property Search"}</span>
                        <div className="absolute inset-0 border border-white/50 scale-105 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 rounded-sm" />
                    </button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 animate-bounce-subtle">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] font-light">Scroll</span>
                    <ArrowDown size={20} className="opacity-70" />
                </div>
            </div>
        </section>
    );
};

export default Hero;
