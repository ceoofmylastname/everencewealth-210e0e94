// Index file that exports all buyers guide translations
export { buyersGuideEn } from './en';

import { buyersGuideEn } from './en';
import { Language } from '@/types/home';

export type BuyersGuideTranslations = typeof buyersGuideEn;

export const buyersGuideTranslations: Record<Language, BuyersGuideTranslations> = {
  [Language.EN]: buyersGuideEn,
  [Language.ES]: buyersGuideEn, // Fallback to EN until ES translation is created
};

export const getBuyersGuideTranslation = (language: Language): BuyersGuideTranslations => {
  return buyersGuideTranslations[language] || buyersGuideEn;
};
