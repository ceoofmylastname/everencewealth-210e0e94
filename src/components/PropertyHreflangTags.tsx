import { Helmet } from 'react-helmet';
import { Language, AVAILABLE_LANGUAGES } from '@/types/home';

interface PropertyHreflangTagsProps {
  reference: string;
  currentLanguage: Language;
  baseUrl?: string;
}

const BASE_URL = 'https://www.everencewealth.com';

export const PropertyHreflangTags = ({ 
  reference, 
  currentLanguage,
  baseUrl = BASE_URL 
}: PropertyHreflangTagsProps) => {
  return (
    <Helmet>
      {/* Canonical URL for current language */}
      <link rel="canonical" href={`${baseUrl}/${currentLanguage}/property/${reference}`} />
      
      {/* Hreflang tags for all languages */}
      {AVAILABLE_LANGUAGES.map((lang) => (
        <link
          key={lang.code}
          rel="alternate"
          hrefLang={lang.code}
          href={`${baseUrl}/${lang.code}/property/${reference}`}
        />
      ))}
      
      {/* x-default points to English version */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/en/property/${reference}`}
      />
    </Helmet>
  );
};

interface PropertyFinderHreflangTagsProps {
  currentLanguage: Language;
  searchParams?: string;
  baseUrl?: string;
}

export const PropertyFinderHreflangTags = ({ 
  currentLanguage,
  searchParams = '',
  baseUrl = BASE_URL 
}: PropertyFinderHreflangTagsProps) => {
  // Note: searchParams kept for hreflang but canonical always clean (no query params)
  const queryString = searchParams ? `?${searchParams}` : '';
  
  return (
    <Helmet>
      {/* Canonical URL for current language - FIXED: Strip query parameters */}
      <link rel="canonical" href={`${baseUrl}/${currentLanguage}/properties`} />
      
      {/* Hreflang tags for all languages */}
      {AVAILABLE_LANGUAGES.map((lang) => (
        <link
          key={lang.code}
          rel="alternate"
          hrefLang={lang.code}
          href={`${baseUrl}/${lang.code}/properties${queryString}`}
        />
      ))}
      
      {/* x-default points to English version */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/en/properties${queryString}`}
      />
    </Helmet>
  );
};
