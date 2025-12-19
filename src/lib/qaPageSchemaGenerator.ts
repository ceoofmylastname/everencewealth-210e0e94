import { QAPage, Author } from '@/types/blog';

const BASE_URL = 'https://www.delsolprimehomes.com';

const LANGUAGE_CODE_MAP: Record<string, string> = {
  en: 'en-GB',
  de: 'de-DE',
  nl: 'nl-NL',
  fr: 'fr-FR',
  pl: 'pl-PL',
  sv: 'sv-SE',
  da: 'da-DK',
  hu: 'hu-HU',
  fi: 'fi-FI',
  no: 'nb-NO',
};

// Note: We still use FAQPage schema type for SEO purposes as it's a recognized schema.org type
export function generateFAQPageSchema(qaPage: QAPage) {
  const mainEntity = [
    {
      '@type': 'Question',
      name: qaPage.question_main,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qaPage.answer_main.replace(/<[^>]*>/g, ''),
      },
    },
    ...(qaPage.related_qas || []).map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
      },
    })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage', // Keep FAQPage for SEO - it's a recognized schema.org type
    mainEntity,
    inLanguage: LANGUAGE_CODE_MAP[qaPage.language] || qaPage.language,
  };
}

export function generateWebPageSchema(qaPage: QAPage, author: Author | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}/qa/${qaPage.slug}#webpage`,
    url: `${BASE_URL}/qa/${qaPage.slug}`,
    name: qaPage.meta_title,
    description: qaPage.meta_description,
    inLanguage: LANGUAGE_CODE_MAP[qaPage.language] || qaPage.language,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Del Sol Prime Homes',
      publisher: {
        '@type': 'Organization',
        name: 'Del Sol Prime Homes',
        url: BASE_URL,
      },
    },
    primaryImageOfPage: qaPage.featured_image_url
      ? {
          '@type': 'ImageObject',
          url: qaPage.featured_image_url,
        }
      : undefined,
    datePublished: qaPage.created_at,
    dateModified: qaPage.updated_at,
    author: author
      ? {
          '@type': 'Person',
          name: author.name,
          jobTitle: author.job_title,
          url: author.linkedin_url,
        }
      : undefined,
  };
}

export function generateQABreadcrumbSchema(qaPage: QAPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Q&A',
        item: `${BASE_URL}/qa`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: qaPage.title,
        item: `${BASE_URL}/qa/${qaPage.slug}`,
      },
    ],
  };
}

export function generateQASpeakableSchema(qaPage: QAPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.speakable-answer', '.qa-question-main'],
    },
    inLanguage: LANGUAGE_CODE_MAP[qaPage.language] || qaPage.language,
  };
}

export function generateAllQASchemas(qaPage: QAPage, author: Author | null) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      generateFAQPageSchema(qaPage),
      generateWebPageSchema(qaPage, author),
      generateQABreadcrumbSchema(qaPage),
      generateQASpeakableSchema(qaPage),
    ],
  };
}

// Backwards compatibility aliases
export const generateFAQBreadcrumbSchema = generateQABreadcrumbSchema;
export const generateFAQSpeakableSchema = generateQASpeakableSchema;
export const generateAllFAQSchemas = generateAllQASchemas;
