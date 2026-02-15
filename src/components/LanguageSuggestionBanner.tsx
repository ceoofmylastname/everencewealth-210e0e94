import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Language, AVAILABLE_LANGUAGES } from '@/types/home';
import { Button } from '@/components/ui/button';

const BANNER_DISMISSED_KEY = 'language_banner_dismissed';
const LANGUAGE_PREFERENCE_KEY = 'preferredLanguage';

// Map browser language codes to our supported languages
const BROWSER_LANG_MAP: Record<string, Language> = {
  'en': Language.EN,
  'es': Language.ES,
};

function getLanguageFromPath(pathname: string): Language | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const potentialLang = segments[0].toLowerCase() as Language;
    if (Object.values(Language).includes(potentialLang)) {
      return potentialLang;
    }
  }
  return null;
}

function detectBrowserLanguage(): Language | null {
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  return BROWSER_LANG_MAP[browserLang] || null;
}

export const LanguageSuggestionBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [suggestedLanguage, setSuggestedLanguage] = useState<Language | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem(BANNER_DISMISSED_KEY)) {
      return;
    }

    if (localStorage.getItem(LANGUAGE_PREFERENCE_KEY)) {
      return;
    }

    const currentLang = getLanguageFromPath(location.pathname) || Language.EN;
    const detectedLang = detectBrowserLanguage();

    if (detectedLang && detectedLang !== currentLang && detectedLang !== Language.EN) {
      setSuggestedLanguage(detectedLang);
      setShowBanner(true);
    }
  }, [location.pathname]);

  const handleSwitchLanguage = () => {
    if (!suggestedLanguage) return;

    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, suggestedLanguage);
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    
    const currentPath = location.pathname;
    const urlLang = getLanguageFromPath(currentPath);
    
    let newPath: string;
    if (urlLang) {
      const pathWithoutLang = currentPath.replace(`/${urlLang}`, '');
      newPath = `/${suggestedLanguage}${pathWithoutLang || ''}`;
    } else {
      newPath = `/${suggestedLanguage}${currentPath}`;
    }
    
    navigate(newPath + location.search);
    setShowBanner(false);
  };

  const handleStayInCurrent = () => {
    const currentLang = getLanguageFromPath(location.pathname) || Language.EN;
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, currentLang);
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setShowBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setShowBanner(false);
  };

  if (!showBanner || !suggestedLanguage) {
    return null;
  }

  const languageInfo = AVAILABLE_LANGUAGES.find(l => l.code === suggestedLanguage);
  const currentLang = getLanguageFromPath(location.pathname) || Language.EN;
  const currentLangInfo = AVAILABLE_LANGUAGES.find(l => l.code === currentLang);

  if (!languageInfo) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm text-foreground mb-3">
              <span className="text-lg mr-2">{languageInfo.flag}</span>
              Would you like to view this site in {languageInfo.nativeName}?
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={handleSwitchLanguage}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Switch to {languageInfo.nativeName}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleStayInCurrent}
              >
                Stay in {currentLangInfo?.nativeName || 'English'}
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
