export type LanguageCode = 'en' | 'nl' | 'fr' | 'de' | 'fi' | 'pl' | 'da' | 'hu' | 'sv' | 'no';

export const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'nl', 'fr', 'de', 'fi', 'pl', 'da', 'hu', 'sv', 'no'];

export const detectUserLanguage = (): LanguageCode => {
  // Priority order:
  // 1. URL parameter (?lang=nl) - although we use route params mainly
  // 2. Browser language (navigator.language)
  // 3. Fallback to English
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  
  if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang as LanguageCode)) {
    return urlLang as LanguageCode;
  }
  
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(browserLang as LanguageCode)) {
    return browserLang as LanguageCode;
  }
  
  return 'en'; // Default fallback
};

export const getLanguageFromPath = (path: string): LanguageCode => {
  const match = path.match(/^\/([a-z]{2})\/landing/);
  if (match && SUPPORTED_LANGUAGES.includes(match[1] as LanguageCode)) {
    return match[1] as LanguageCode;
  }
  return 'en';
};
