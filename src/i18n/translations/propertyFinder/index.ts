import { Language } from '@/types/home';
import { propertyFinderEn } from './en';

export type PropertyFinderTranslations = typeof propertyFinderEn;

const translations: Record<Language, PropertyFinderTranslations> = {
  [Language.EN]: propertyFinderEn,
  [Language.ES]: propertyFinderEn, // Fallback to EN until ES translation is created
};

export const getPropertyFinderTranslation = (lang: Language): PropertyFinderTranslations => {
  return translations[lang] || translations[Language.EN];
};

export {
  propertyFinderEn,
};
