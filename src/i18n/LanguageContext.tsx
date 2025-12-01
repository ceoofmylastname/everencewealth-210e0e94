import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types/home';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Load from localStorage if available
    const stored = localStorage.getItem('preferredLanguage');
    return (stored as Language) || Language.EN;
  });

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem('preferredLanguage', currentLanguage);
    // Update HTML lang attribute for accessibility and SEO
    document.documentElement.lang = currentLanguage.toLowerCase();
  }, [currentLanguage]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
