export enum Language {
  EN = 'en',
  ES = 'es',
}

export interface LanguageInfo {
  code: Language;
  name: string;
  flag: string;
  nativeName: string;
}

export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  { code: Language.EN, name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: Language.ES, name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
];

export interface NavLink {
  label: string;
  href: string;
}

export interface Area {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

export interface SearchParams {
  budget: string;
  location: string;
  purpose: string;
}
