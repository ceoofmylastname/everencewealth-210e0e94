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
                    <img
                        src="/images/hero-1920.png"
                        alt="Luxury Costa del Sol Property"
                        className="w-full h-full object-cover"
                    />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-4 pt-32 pb-12 flex flex-col items-center justify-center min-h-screen text-center space-y-8">

                {/* Text Content */}
                <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white font-light tracking-wide leading-tight drop-shadow-md">
                        {content.headline}
                    </h1>
                    <p className="text-lg md:text-xl text-white/95 font-light max-w-2xl mx-auto drop-shadow-sm">
                        {content.subheadline}
                    </p>
                </div>

                {/* Watch Intro Button */}
                <div className="animate-fade-in-up delay-100">
                    <Button
                        onClick={() => setIsVideoOpen(true)}
                        className="bg-[#C4A053] hover:bg-[#B39043] text-white px-8 py-6 text-lg rounded-sm uppercase tracking-wider font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        {content.videoCTA}
                    </Button>
                </div>

                {/* Video Preview Container (Visual Mockup based on user image) */}
                <div
                    className="relative w-full max-w-3xl aspect-video bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 shadow-2xl cursor-pointer group animate-fade-in-up delay-200 mt-8"
                    onClick={() => setIsVideoOpen(true)}
                >
                    {/* Placeholder image for video preview - using a generic office/agent shot or the hero image darkened */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

                    {/* Play Button Interface */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                    </div>

                    {/* Video UI Chrome elements */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white text-xs font-medium tracking-wider">
                        <div className="flex items-center gap-2">
                            <Play className="w-3 h-3 fill-white" />
                            <span>0:00 / 2:15</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-4 h-4 rounded-full border border-white/50" />
                            <div className="w-4 h-4 border border-white/50" />
                        </div>
                    </div>
                </div>

                {/* Start with Emma Button */}
                <div className="space-y-4 animate-fade-in-up delay-300 pt-4">
                    <Button
                        onClick={scrollToEmma}
                        className="bg-[#1A2332] hover:bg-[#2C3E50] text-white px-10 py-7 text-xl rounded-sm shadow-xl font-medium tracking-wide hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 min-w-[280px]"
                    >
                        {content.emmaCTA}
                    </Button>

                    <p className="text-white/80 text-sm font-light tracking-wide max-w-md mx-auto">
                        Simply share your wishes, and our agent Emma will instantly start finding options tailored to you.
                    </p>
                </div>
            </div>

            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
        </div>
    );
};

export default Hero;
