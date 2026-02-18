import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Language, AVAILABLE_LANGUAGES, LanguageInfo } from '../types/home';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: LanguageInfo[];
  switchLanguage: (newLang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Valid language codes
const VALID_LANGUAGES = Object.values(Language);

// Extract language from URL path
function getLanguageFromPath(pathname: string): Language | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const potentialLang = segments[0].toLowerCase() as Language;
    if (VALID_LANGUAGES.includes(potentialLang)) {
      return potentialLang;
    }
  }
  return null;
}



export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine initial language from URL, localStorage, or browser
  const getInitialLanguage = (): Language => {
    // First check URL
    const urlLang = getLanguageFromPath(location.pathname);
    if (urlLang) return urlLang;
    
    // Root path (/) always defaults to English, regardless of localStorage
    if (location.pathname === '/' || location.pathname === '') {
      return Language.EN;
    }
    
    // Then check localStorage
    const stored = localStorage.getItem('preferredLanguage');
    if (stored && VALID_LANGUAGES.includes(stored as Language)) {
      return stored as Language;
    }
    
    // Default to English
    return Language.EN;
  };

  const [currentLanguage, setCurrentLanguage] = useState<Language>(getInitialLanguage);

  // Sync language with URL changes
  useEffect(() => {
    const urlLang = getLanguageFromPath(location.pathname);
    if (urlLang && urlLang !== currentLanguage) {
      setCurrentLanguage(urlLang);
      localStorage.setItem('preferredLanguage', urlLang);
    } else if (!urlLang && (location.pathname === '/' || location.pathname === '')) {
      // Root path always resets to English
      if (currentLanguage !== Language.EN) {
        setCurrentLanguage(Language.EN);
      }
    }
  }, [location.pathname]);

  // Update HTML lang attribute
  useEffect(() => {
    localStorage.setItem('preferredLanguage', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  // Switch language and update URL
  const switchLanguage = (newLang: Language) => {
    const currentPath = location.pathname;
    const urlLang = getLanguageFromPath(currentPath);
    
    let newPath: string;
    if (urlLang) {
      // Replace existing language prefix
      const pathWithoutLang = currentPath.replace(`/${urlLang}`, '');
      newPath = `/${newLang}${pathWithoutLang || ''}`;
    } else {
      // Add language prefix to current path
      newPath = `/${newLang}${currentPath}`;
    }
    
    // Navigate to new language URL
    navigate(newPath + location.search);
    setCurrentLanguage(newLang);
  };

  const value = useMemo(() => ({
    currentLanguage,
    setLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
    switchLanguage,
  }), [currentLanguage, navigate, location]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
