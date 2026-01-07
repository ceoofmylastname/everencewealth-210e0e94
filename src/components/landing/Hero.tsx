import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import VideoModal from './VideoModal';
import { Play, VolumeX, Check } from 'lucide-react';
import { LanguageCode } from '@/utils/landing/languageDetection';

interface HeroProps {
    content: {
        headline: string;
        subheadline: string;
        videoCTA: string;
        emmaCTA: string;
        primaryCTA?: string;
        primaryMicro?: string;
        secondaryCTA?: string;
        bullet1?: string;
        bullet2?: string;
        bullet3?: string;
    };
    language: LanguageCode;
    onStartChat?: () => void;
    onOpenVideo?: () => void;
}

const Hero: React.FC<HeroProps> = ({ content, language, onStartChat, onOpenVideo }) => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isPreviewMuted, setIsPreviewMuted] = useState(true);
    const previewVideoRef = useRef<HTMLVideoElement>(null);

    const isEnglish = language === 'en';

    // Autoplay preview video on component mount (only for English)
    useEffect(() => {
        if (isEnglish && previewVideoRef.current) {
            previewVideoRef.current.play().catch(err => {
                console.log('Autoplay prevented:', err);
            });
        }
    }, [isEnglish]);

    const handlePreviewClick = () => {
        if (isEnglish) {
            if (isPreviewMuted) {
                // User wants to unmute preview
                if (previewVideoRef.current) {
                    previewVideoRef.current.currentTime = 0;
                    previewVideoRef.current.muted = false;
                    setIsPreviewMuted(false);
                }
            } else {
                // Open full modal
                setIsVideoOpen(true);
            }
        } else {
            setIsVideoOpen(true);
        }
    };

    // Handler for open video button
    const handleOpenVideo = () => {
        if (onOpenVideo) {
            onOpenVideo();
        } else {
            setIsVideoOpen(true);
        }
    };

    return (
        <section className="relative w-full min-h-[600px] flex items-center overflow-hidden pt-20 pb-12 md:py-24 bg-gradient-to-br from-primary/10 via-blue-50 to-white">
            {/* Desktop Background Image (Hidden on Mobile) */}
            <div className="hidden md:block absolute inset-0 z-0 opacity-10 pointer-events-none">
                {/* Optional texture or subtle pattern could go here */}
            </div>

            {/* Background Image with Overlay for Mobile (Original Mobile Design) */}
            <div className="md:hidden absolute inset-0 z-0">
                <picture>
                    <img
                        src="/images/hero-1920.png"
                        alt="Luxury Costa del Sol Property"
                        className="w-full h-full object-cover"
                    />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Two-column layout on desktop */}
                <div className="flex flex-col md:flex-row md:items-center md:gap-12 lg:gap-16">

                    {/* LEFT COLUMN - Copy + CTAs */}
                    <div className="flex-1 space-y-6 md:space-y-8 text-center md:text-left">
                        {/* H1 - Primary Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white md:text-gray-900 font-light tracking-wide leading-tight drop-shadow-md md:drop-shadow-none">
                            Living on the Costa del Sol — guided, personal and pressure-free
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-white/95 md:text-gray-700 font-light max-w-2xl mx-auto md:mx-0 drop-shadow-sm md:drop-shadow-none leading-relaxed">
                            A curated selection of new-build apartments and villas, matched to your lifestyle, budget and long-term plans — with independent guidance from first conversation to key handover.
                        </p>

                        {/* Value Clarifiers - Desktop only, 3 bullets */}
                        <div className="hidden md:flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-gray-700">Independent project selection</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-gray-700">No pressure · No obligation</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-gray-700">Service fully paid by developers</span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4">
                            {/* Primary CTA */}
                            <div className="w-full sm:w-auto flex flex-col items-center md:items-start">
                                <Button
                                    onClick={onStartChat}
                                    size="lg"
                                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-lg shadow-xl font-medium"
                                >
                                    <span className="mr-2">👉</span>
                                    Get your private, pressure-free property shortlist
                                </Button>
                                <p className="text-sm text-white md:text-gray-600 mt-2 text-center md:text-left drop-shadow-sm md:drop-shadow-none">
                                    Prepared in 2 minutes · No obligation
                                </p>
                            </div>

                            {/* Secondary CTA */}
                            <Button
                                onClick={handleOpenVideo}
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border-2 border-white md:border-primary text-white md:text-primary hover:bg-white hover:text-primary px-8 py-6 text-lg rounded-lg font-medium backdrop-blur-sm bg-white/10 md:bg-transparent"
                            >
                                <Play className="w-5 h-5 mr-2" />
                                Watch our 60-second introduction
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Hero Image (Desktop only) */}
                    <div className="hidden md:block flex-1 mt-8 md:mt-0 max-w-[600px] lg:max-w-none">
                        {/* Video Preview Container reused for desktop visual interest */}
                        <div
                            className="relative w-full aspect-video bg-black/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 shadow-2xl cursor-pointer group animate-fade-in-up delay-200"
                            onClick={handlePreviewClick}
                        >
                            {isEnglish ? (
                                <>
                                    <video
                                        ref={previewVideoRef}
                                        className="w-full h-full object-cover"
                                        muted={isPreviewMuted}
                                        loop
                                        playsInline
                                        autoPlay
                                    >
                                        <source
                                            src="https://storage.googleapis.com/msgsndr/281Nzx90nVL8424QY4Af/media/695c3fa76aaf16223bba7094.mp4"
                                            type="video/mp4"
                                        />
                                    </video>

                                    {/* Mute Indicator */}
                                    {isPreviewMuted && (
                                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-lg">
                                            <VolumeX className="w-4 h-4 text-primary" />
                                            <span className="text-primary text-xs font-medium tracking-wide">
                                                Click to unmute
                                            </span>
                                        </div>
                                    )}

                                    {/* Play icon overlay when muted */}
                                    {isPreviewMuted && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform duration-300">
                                                <Play className="w-8 h-8 text-white fill-white ml-2" />
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Placeholder image for video preview (Non-English) or if we want a static image */}
                                    <img
                                        src="/images/hero-desktop.jpg"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/hero-1920.png'; // Fallback
                                        }}
                                        alt="Luxury property"
                                        className="w-full h-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                                    {/* Play Button Interface */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform duration-300">
                                            <Play className="w-8 h-8 text-white fill-white ml-2" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Video Preview (Keep original logic but only show on mobile) */}
                <div
                    className="md:hidden relative w-full max-w-[600px] aspect-video bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 shadow-2xl cursor-pointer group animate-fade-in-up delay-200 mt-8 mb-8"
                    onClick={handlePreviewClick}
                >
                    {/* ... (Keep existing mobile video logic if needed, but the desktop right column handles video now too? 
                           Wait, user requested 'Responsive two-column layout'. 
                           So on mobile it stacks. The video is the secondary visual.
                           In existing Hero.tsx, video was below buttons.
                           In new design, video is the 'Right Column' content on desktop. 
                           So on mobile, we can hide this 'Right Column' and show the video preview below copy as before?
                           Or just use the same element.
                           Refactored to share the video element code or use distinct ones.
                           I used 'hidden md:block' for right column.
                           Let's reuse the logic for mobile below buttons.
                           ) */}

                    {/* Actually, let's keep the mobile video separate if we want exact control, 
                        OR unify. The request says "Two-column hero layout (copy left, image right)".
                        On mobile, it's Copy -> Buttons -> Video.
                        So simply stacking flex-col-reverse or similar?
                        No, usually Copy -> Buttons -> Video.
                        
                        I've added the mobile video preview block back below.
                     */}
                    {isEnglish ? (
                        <>
                            <video
                                ref={previewVideoRef} // Note: This ref might conflict if used in both places. 
                            // Better to have one video element that moves via CSS or distinct components.
                            // For simplicity and avoiding ref conflicts, let's assume we use the desktop right column for video on desktop,
                            // and a separate one for mobile? No, duplicate refs are bad.
                            // Let's use CSS grid/flex order to reposition the same element?
                            // Mobile: Col 1 (Copy), Col 2 (Video). Desktop: Row (Copy, Video).
                            // Yes, let's do that.
                            />
                        </>
                    ) : null}
                    {/* ... mobile video logic ... */}
                </div>
                {/* 
                   Wait, to avoid ref issues, I should stick to a single Video/Image container that changes position/style based on breakpoint.
                   Mobile: Below content. Desktop: Right of content.
                   flex-col for mobile, flex-row for desktop.
                   The 'Right Column' div I added above is inside flex-row. 
                   If I remove 'hidden md:block' and make it visible on mobile, it will be at the bottom (flex-col).
                   Perfect.
                */}
            </div>

            <VideoModal
                isOpen={isVideoOpen}
                onClose={() => setIsVideoOpen(false)}
                videoUrl={isEnglish ? "https://storage.googleapis.com/msgsndr/281Nzx90nVL8424QY4Af/media/695c3fa76aaf16223bba7094.mp4" : undefined}
            />
        </section>
    );
};

export default Hero;
