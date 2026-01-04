import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import VideoModal from './VideoModal';
import { Play } from 'lucide-react';
import { LanguageCode } from '@/utils/landing/languageDetection';

interface HeroProps {
    content: {
        headline: string;
        subheadline: string;
        videoCTA: string;
        emmaCTA: string;
    };
    language: LanguageCode;
}

const Hero: React.FC<HeroProps> = ({ content }) => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const scrollToEmma = () => {
        const emmaSection = document.getElementById('emma-section');
        if (emmaSection) {
            emmaSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <picture>
                    <source srcSet="/images/hero-1920.webp" media="(min-width: 1280px)" type="image/webp" />
                    <source srcSet="/images/hero-1280.webp" media="(min-width: 768px)" type="image/webp" />
                    <img
                        src="/images/hero-1920.jpg"
                        alt="Luxury Costa del Sol Property"
                        className="w-full h-full object-cover"
                    />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center text-white space-y-8 animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light tracking-wide max-w-4xl mx-auto leading-tight">
                    {content.headline}
                </h1>

                <p className="text-lg md:text-xl font-light max-w-2xl mx-auto text-white/90">
                    {content.subheadline}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Button
                        onClick={() => setIsVideoOpen(true)}
                        variant="outline"
                        className="h-12 px-8 border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all duration-300 group"
                    >
                        <Play className="w-4 h-4 mr-2 fill-current group-hover:scale-110 transition-transform" />
                        {content.videoCTA}
                    </Button>

                    <Button
                        onClick={scrollToEmma}
                        className="h-12 px-8 bg-[#C4A053] hover:bg-[#D4B063] text-white border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        {content.emmaCTA}
                    </Button>
                </div>
            </div>

            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
        </div>
    );
};

export default Hero;
