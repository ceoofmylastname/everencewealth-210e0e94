import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import { translations } from './translations';

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }

  const { currentLanguage, setLanguage } = context;
  const t = translations[currentLanguage];

  return { t, currentLanguage, setLanguage };
};
