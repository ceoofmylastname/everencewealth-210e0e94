import { useContext } from 'react';
import { LanguageContext } from '@/i18n/LanguageContext';
import { getBuyersGuideTranslation, BuyersGuideTranslations } from '@/i18n/translations/buyersGuide';
import { Language } from '@/types/home';

export const useBuyersGuideTranslation = (): { t: BuyersGuideTranslations; currentLanguage: Language } => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    // Fallback to English if no context
    return { t: getBuyersGuideTranslation(Language.EN), currentLanguage: Language.EN };
  }
  
  const { currentLanguage } = context;
  const t = getBuyersGuideTranslation(currentLanguage);
  
  return { t, currentLanguage };
};
