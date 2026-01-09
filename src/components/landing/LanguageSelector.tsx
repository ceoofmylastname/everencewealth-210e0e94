import React from 'react';
import { LanguageCode, SUPPORTED_LANGUAGES } from '@/utils/landing/languageDetection';
import { trackEvent } from '@/utils/landing/analytics';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
    currentLang: LanguageCode;
}

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
    en: 'English',
    nl: 'Nederlands',
    fr: 'Français',
    de: 'Deutsch',
    fi: 'Suomi',
    pl: 'Polski',
    da: 'Dansk',
    hu: 'Magyar',
    sv: 'Svenska',
    no: 'Norsk'
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLang }) => {
    const handleLanguageChange = (newLang: LanguageCode) => {
        trackEvent('language_switch', {
            category: 'Engagement',
            from_language: currentLang,
            to_language: newLang
        });

        const currentUrl = new URL(window.location.href);
        const newPath = currentUrl.pathname.replace(`/${currentLang}/`, `/${newLang}/`);
        currentUrl.pathname = newPath;
        window.location.href = currentUrl.toString();
    };

    return (
        <div className="relative group z-50">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-landing-navy opacity-70 hover:opacity-100 transition-opacity">
                <Globe size={18} />
                <span className="uppercase">{currentLang}</span>
            </button>

            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                <div className="py-2">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => handleLanguageChange(lang)}
                            className={`block w-full text-left px-5 py-2.5 text-sm hover:bg-gray-50 transition-colors ${currentLang === lang ? 'font-bold text-landing-gold' : 'text-landing-navy'
                                }`}
                        >
                            {LANGUAGE_NAMES[lang]}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguageSelector;
