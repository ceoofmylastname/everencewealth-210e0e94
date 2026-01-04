import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Hero from './Hero';
import EmmaChat from './EmmaChat';
import TestimonialSection from './TestimonialSection';
import PropertyCarousel from './PropertyCarousel';
import Footer from './Footer';
import LanguageSelector from './LanguageSelector';
import LeadCaptureForm from './LeadCaptureForm';
import { LanguageCode } from '@/utils/landing/languageDetection';
import { trackPageView } from '@/utils/landing/analytics';

interface LandingLayoutProps {
    language: LanguageCode;
    translations: any; // Using any for flexibility with JSON import structures
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ language, translations }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(undefined);

    useEffect(() => {
        trackPageView(language);

        // Listen for custom events from EmmaChat or other components
        const handleOpenForm = (e: CustomEvent) => {
            setSelectedPropertyId(e.detail?.interest);
            setIsFormOpen(true);
        };

        window.addEventListener('openLeadForm' as any, handleOpenForm);
        return () => window.removeEventListener('openLeadForm' as any, handleOpenForm);
    }, [language]);

    const handlePropertySelect = (id: string) => {
        setSelectedPropertyId(id);
        setIsFormOpen(true);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-[#2C3E50]">
            {/* Dynamic Head Tags */}
            <Helmet>
                <html lang={language} />
                <title>{translations.hero.headline} | DelSolPrimeHomes</title>
                <meta name="description" content={translations.hero.subheadline} />

                {/* Hreflang Tags */}
                <link rel="alternate" hrefLang="en" href="https://www.delsolprimehomes.com/en/landing" />
                <link rel="alternate" hrefLang="nl" href="https://www.delsolprimehomes.com/nl/landing" />
                <link rel="alternate" hrefLang="fr" href="https://www.delsolprimehomes.com/fr/landing" />
                <link rel="alternate" hrefLang="de" href="https://www.delsolprimehomes.com/de/landing" />
                <link rel="alternate" hrefLang="fi" href="https://www.delsolprimehomes.com/fi/landing" />
                <link rel="alternate" hrefLang="pl" href="https://www.delsolprimehomes.com/pl/landing" />
                <link rel="alternate" hrefLang="da" href="https://www.delsolprimehomes.com/da/landing" />
                <link rel="alternate" hrefLang="hu" href="https://www.delsolprimehomes.com/hu/landing" />
                <link rel="alternate" hrefLang="sv" href="https://www.delsolprimehomes.com/sv/landing" />
                <link rel="alternate" hrefLang="no" href="https://www.delsolprimehomes.com/no/landing" />
                <link rel="alternate" hrefLang="x-default" href="https://www.delsolprimehomes.com/en/landing" />

                <link rel="canonical" href={`https://www.delsolprimehomes.com/${language}/landing`} />
            </Helmet>

            {/* Navigation Overlay */}
            <div className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                <div className="w-48">
                    {/* Logo placeholder - replace with actual logo path */}
                    <img src="/logo.png" alt="DelSolPrimeHomes" className="h-12 w-auto object-contain brightness-0 invert" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <span className="text-white font-serif text-xl font-bold tracking-widest hidden md:inline ml-2">DELSOLPRIMEHOMES</span>
                </div>
                <div className="flex items-center gap-4">
                    <a href="tel:+34951123456" className="text-white hidden md:block hover:text-[#C4A053] transition-colors font-medium">
                        +34 951 123 456
                    </a>
                    <LanguageSelector currentLang={language} />
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-[#C4A053] text-white px-5 py-2 rounded shadow hover:bg-[#D4B063] transition-colors text-sm font-semibold"
                    >
                        Contact
                    </button>
                </div>
            </div>

            <Hero content={translations.hero} language={language} />

            <EmmaChat content={translations.emma} language={language} />

            <TestimonialSection testimonials={translations.testimonials} />

            <PropertyCarousel
                language={language}
                translations={translations.properties}
                onPropertySelect={handlePropertySelect}
            />

            <Footer content={translations.footer} />

            <LeadCaptureForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                language={language}
                translations={translations.form}
                propertyId={selectedPropertyId}
            />
        </div>
    );
};

export default LandingLayout;
