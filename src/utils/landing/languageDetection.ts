export type LanguageCode = 'en' | 'es';

export const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'es'];

export const detectUserLanguage = (): LanguageCode => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  
  if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang as LanguageCode)) {
    return urlLang as LanguageCode;
  }
  
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(browserLang as LanguageCode)) {
    return browserLang as LanguageCode;
  }
  
  return 'en';
};

export const getLanguageFromPath = (path: string): LanguageCode => {
  const match = path.match(/^\/([a-z]{2})\/landing/);
  if (match && SUPPORTED_LANGUAGES.includes(match[1] as LanguageCode)) {
    return match[1] as LanguageCode;
  }
  return 'en';
};
