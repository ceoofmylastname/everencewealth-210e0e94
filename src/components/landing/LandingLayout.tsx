import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Hero from './Hero';
import AutoplayVideo from './AutoplayVideo';
import EmmaSection from './EmmaSection';
import PropertiesShowcase from './PropertiesShowcase';
import ClassicOptin from './ClassicOptin';
import EmmaChat from './EmmaChat';
import Footer from './Footer';
import LanguageSelector from './LanguageSelector';
// import LeadCaptureForm from './LeadCaptureForm'; // We might still need this for property clicks
import { LanguageCode } from '@/utils/landing/languageDetection';
import { trackPageView } from '@/utils/landing/analytics';
import LeadCaptureForm from './LeadCaptureForm';
import TestimonialsSection from './TestimonialsSection';

interface LandingLayoutProps {
    language: LanguageCode;
    translations: any;
}

interface PropertyInterest {
    id?: string;
    name?: string;
    category?: string;
    location?: string;
    price?: number;
    ref?: string;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ language, translations }) => {
    const [isEmmaOpen, setIsEmmaOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(undefined);
    const [propertyInterest, setPropertyInterest] = useState<PropertyInterest | null>(null);

    useEffect(() => {
        trackPageView(language);

        const handleOpenForm = (e: CustomEvent) => {
            setSelectedPropertyId(e.detail?.interest);
            setPropertyInterest({
                id: e.detail?.interest,
                name: e.detail?.propertyName,
                category: e.detail?.propertyCategory,
                location: e.detail?.propertyLocation,
                price: e.detail?.propertyPrice,
                ref: e.detail?.propertyRef
            });
            setIsFormOpen(true);
        };

        const handleOpenChat = () => {
            setIsEmmaOpen(true);
        };

        window.addEventListener('openLeadForm' as any, handleOpenForm);
        window.addEventListener('openEmmaChat' as any, handleOpenChat);

        return () => {
            window.removeEventListener('openLeadForm' as any, handleOpenForm);
            window.removeEventListener('openEmmaChat' as any, handleOpenChat);
        };
    }, [language]);

    // Fallback for missing translations to prevent crash
    const t = translations || {};
    const heroT = t.hero || {};

    return (
        <div className="min-h-screen bg-white font-sans text-landing-navy selection:bg-landing-gold selection:text-white">
            {/* SEO & Infrastructure */}
            <Helmet>
                {/* CRITICAL: Dynamic HTML lang attribute */}
                <html lang={language} />

                {/* Dynamic Title (Native Language) */}
                <title>{heroT.headline ? `${heroT.headline} | Everence Wealth` : 'Everence Wealth'}</title>

                {/* Dynamic Description (Native Language) */}
                <meta name="description" content={heroT.subheadline || "Independent guidance for insurance and wealth management"} />

                {/* SEO: Robots & Discovery */}
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
                <meta http-equiv="content-language" content={language} />

                {/* HREFLANG TAGS - Perfect Implementation (10 Languages + x-default) */}
                <link rel="alternate" hrefLang="en" href="https://www.everencewealth.com/en/landing" />
                <link rel="alternate" hrefLang="es" href="https://www.everencewealth.com/es/landing" />
                <link rel="alternate" hrefLang="x-default" href="https://www.everencewealth.com/en/landing" />

                {/* CANONICAL URL - Language-Specific */}
                <link rel="canonical" href={`https://www.everencewealth.com/${language}/landing`} />

                {/* Geographic Targeting (GEO) */}
                <meta name="geo.region" content="US" />
                <meta name="geo.placename" content="United States" />

                {/* Open Graph (Social Sharing) */}
                <meta property="og:title" content={heroT.headline ? `${heroT.headline} | Everence Wealth` : 'Everence Wealth'} />
                <meta property="og:description" content={heroT.subheadline || "Independent guidance for insurance and wealth management"} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://www.everencewealth.com/${language}/landing`} />
                <meta property="og:image" content="https://www.everencewealth.com/og-image.jpg" />
                <meta property="og:locale" content={getLocaleCode(language)} />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={heroT.headline ? `${heroT.headline} | Everence Wealth` : 'Everence Wealth'} />
                <meta name="twitter:description" content={heroT.subheadline || "Independent guidance for insurance and wealth management"} />
                <meta name="twitter:image" content="https://www.everencewealth.com/og-image.jpg" />

                {/* AEO: Schema.org JSON-LD (Critical for AI Engines) */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FinancialService",
                        "name": "Everence Wealth",
                        "url": `https://www.everencewealth.com/${language}/landing`,
                        "logo": "https://www.everencewealth.com/logo.png",
                        "description": heroT.subheadline || "Independent fiduciary guidance for insurance and wealth management",
                        "inLanguage": language,
                        "areaServed": {
                            "@type": "Country",
                            "name": "United States"
                        },
                        "address": {
                            "@type": "PostalAddress",
                            "addressCountry": "US",
                            "addressRegion": "California"
                        },
                        "sameAs": [
                            "https://www.linkedin.com/company/everencewealth"
                        ]
                    })}
                </script>

                {/* FAQ Schema for SERP Real Estate (if available) */}
                {t.faq && (
                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": t.faq.questions.map((q: any) => ({
                                "@type": "Question",
                                "name": q.question,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": q.answer
                                }
                            }))
                        })}
                    </script>
                )}
            </Helmet>

            {/* Fixed Minimal Header - Mobile Optimized */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300 border-b border-gray-100">
                <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 lg:h-20 flex justify-between items-center">
                    
                    {/* Left: Apartments & Penthouses (Desktop Only) */}
                    <nav className="hidden lg:flex items-center gap-4 text-landing-navy text-sm font-medium tracking-wide">
                        <button 
                            onClick={() => document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' })} 
                            className="hover:text-landing-gold transition-colors"
                        >
                            {t.header?.apartments || "Apartments"}
                        </button>
                        <span className="text-landing-gold/30">|</span>
                        <button 
                            onClick={() => document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' })} 
                            className="hover:text-landing-gold transition-colors"
                        >
                            {t.header?.penthouses || "Penthouses"}
                        </button>
                    </nav>

                    {/* Left: Logo on Mobile */}
                    <div className="lg:hidden cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img 
                            src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png"
                            alt="Everence Wealth"
                            className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                    </div>

                    {/* Center: Logo (Desktop Only - Absolute Centered) */}
                    <div 
                        className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <img 
                            src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png"
                            alt="Everence Wealth"
                            className="h-14 md:h-16 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                        {/* Property Links (Desktop Only) */}
                        <nav className="hidden lg:flex items-center gap-4 text-landing-navy text-sm font-medium tracking-wide">
                            <button 
                                onClick={() => document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' })} 
                                className="hover:text-landing-gold transition-colors"
                            >
                                {t.header?.townhouses || "Townhouses"}
                            </button>
                            <span className="text-landing-gold/30">|</span>
                            <button 
                                onClick={() => document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' })} 
                                className="hover:text-landing-gold transition-colors"
                            >
                                {t.header?.villas || "Villas"}
                            </button>
                        </nav>
                        
                        {/* Language Selector - Visible on all sizes */}
                        <div className="scale-90 sm:scale-100">
                            <LanguageSelector currentLang={language} />
                        </div>
                        
                        {/* CTA Button - Responsive sizing */}
                        <button
                            onClick={() => setIsEmmaOpen(true)}
                            className="bg-landing-gold hover:bg-landing-goldDark text-white px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-2.5 rounded-sm text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all hover:-translate-y-0.5"
                        >
                            <span className="hidden sm:inline">{t.header?.cta || "Get Started"}</span>
                            <span className="sm:hidden">Chat</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Sections - NEW ORDER */}
            <main>
                {/* 1. HERO - Clarity First */}
                <Hero
                    onStartChat={() => setIsEmmaOpen(true)}
                    translations={translations}
                />

                {/* 2. VIDEO - Guidance Explanation */}
                <AutoplayVideo
                    language={language}
                    translations={translations}
                    onOpenEmmaChat={() => setIsEmmaOpen(true)}
                />

                {/* 3. TESTIMONIALS - Social Proof */}
                <TestimonialsSection language={language} />

                {/* 4. EMMA SECTION - Primary Conversion */}
                <EmmaSection
                    onStartChat={() => setIsEmmaOpen(true)}
                    translations={translations?.emma}
                />

                {/* 4. FALLBACK PROPERTIES - De-emphasized */}
                <PropertiesShowcase
                    translations={translations}
                    language={language}
                />

                {/* 5. CLASSIC OPT-IN - Last Resort */}
                <ClassicOptin
                    language={language}
                    translations={translations?.classicOptin}
                />
            </main>

            <Footer content={t.footer} />

            {/* Interactive Elements */}
            <EmmaChat
                language={language}
                isOpen={isEmmaOpen}
                onClose={() => setIsEmmaOpen(false)}
            />

            <LeadCaptureForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                language={language}
                translations={t.form || {}}
                propertyId={selectedPropertyId}
                propertyName={propertyInterest?.name}
                propertyCategory={propertyInterest?.category}
                propertyLocation={propertyInterest?.location}
                propertyPrice={propertyInterest?.price}
                propertyRef={propertyInterest?.ref}
            />
        </div>
    );
};


// Helper function for locale codes to support OG tags
function getLocaleCode(language: string): string {
    const localeMap: Record<string, string> = {
        en: 'en_US',
        es: 'es_ES',
    };
    return localeMap[language] || 'en_US';
}

export default LandingLayout;
