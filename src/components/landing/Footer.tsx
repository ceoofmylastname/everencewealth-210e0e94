import React from 'react';
import LanguageSelector from './LanguageSelector';

interface FooterProps {
    content?: any;
}

const Footer: React.FC<FooterProps> = ({ content }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-50 border-t border-gray-100 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-serif font-bold text-landing-gold tracking-widest">
                            DELSOLPRIMEHOMES
                        </span>
                    </div>

                    {/* Copyright & Links */}
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-landing-text-secondary">
                        <span>© {currentYear} DelSolPrimeHomes</span>
                        <a href="/privacy" className="hover:text-landing-navy transition-colors">{content?.privacy || "Privacy Policy"}</a>
                        <a href="/terms" className="hover:text-landing-navy transition-colors">{content?.terms || "Terms of Service"}</a>
                    </div>

                    {/* Language Selector */}
                    <div className="flex items-center">
                        {/* Assuming LanguageSelector handles its own minimal state now or we pass currentLang from context if needed */}
                        {/* For now we just place it here. Using a simplified version ideally. */}
                        <div className="scale-90 origin-right">
                            <LanguageSelector currentLang={window.location.pathname.split('/')[1] as any || 'en'} />
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
