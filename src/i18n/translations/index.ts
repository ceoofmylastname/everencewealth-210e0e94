import { Language } from '../../types/home';
import { en } from './en';
import { es } from './es';

// Use a flexible type that allows for optional properties across languages
type TranslationBase = Omit<typeof en, 'brochures' | 'whyChooseUs' | 'team' | 'aboutUs' | 'homepage'> & { 
  brochures: Record<string, unknown>;
  whyChooseUs?: typeof en.whyChooseUs;
  team?: typeof en.team;
  aboutUs?: Record<string, unknown>;
  homepage: typeof en.homepage;
};

export const translations: Record<Language, TranslationBase> = {
  [Language.EN]: en as TranslationBase,
  [Language.ES]: es as unknown as TranslationBase,
};
