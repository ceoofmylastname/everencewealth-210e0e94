// Index file that exports all buyers guide translations
export { buyersGuideEn } from './en';
export { buyersGuideNl } from './nl';
export { buyersGuideDe } from './de';
export { buyersGuideFr } from './fr';
export { buyersGuideSv } from './sv';
export { buyersGuideNo } from './no';
export { buyersGuideDa } from './da';
export { buyersGuideFi } from './fi';
export { buyersGuidePl } from './pl';
export { buyersGuideHu } from './hu';

import { buyersGuideEn } from './en';
import { buyersGuideNl } from './nl';
import { buyersGuideDe } from './de';
import { buyersGuideFr } from './fr';
import { buyersGuideSv } from './sv';
import { buyersGuideNo } from './no';
import { buyersGuideDa } from './da';
import { buyersGuideFi } from './fi';
import { buyersGuidePl } from './pl';
import { buyersGuideHu } from './hu';
import { Language } from '@/types/home';

export type BuyersGuideTranslations = typeof buyersGuideEn;

export const buyersGuideTranslations: Record<Language, BuyersGuideTranslations> = {
  [Language.EN]: buyersGuideEn,
  [Language.NL]: buyersGuideNl,
  [Language.DE]: buyersGuideDe,
  [Language.FR]: buyersGuideFr,
  [Language.SV]: buyersGuideSv,
  [Language.NO]: buyersGuideNo,
  [Language.DA]: buyersGuideDa,
  [Language.FI]: buyersGuideFi,
  [Language.PL]: buyersGuidePl,
  [Language.HU]: buyersGuideHu,
};

export const getBuyersGuideTranslation = (language: Language): BuyersGuideTranslations => {
  return buyersGuideTranslations[language] || buyersGuideEn;
};
