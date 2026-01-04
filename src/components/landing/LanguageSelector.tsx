import React from 'react';
import { LanguageCode, SUPPORTED_LANGUAGES } from '@/utils/landing/languageDetection';
import { trackEvent } from '@/utils/landing/analytics';

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

        // Redirect to the new language page
        // Preserving query parameters (like UTM tags)
        const currentUrl = new URL(window.location.href);
        const newPath = currentUrl.pathname.replace(`/${currentLang}/`, `/${newLang}/`);
        currentUrl.pathname = newPath;
        window.location.href = currentUrl.toString();
    };

    return (
        <div className="relative group z-50">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors">
                <span className="uppercase">{currentLang}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                <div className="py-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => handleLanguageChange(lang)}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${currentLang === lang ? 'font-bold text-[#C4A053]' : 'text-gray-700'
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
