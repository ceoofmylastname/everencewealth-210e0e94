import { FAQPage, Author } from '@/types/blog';

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

export function generateFAQPageSchema(faqPage: FAQPage) {
  const mainEntity = [
    {
      '@type': 'Question',
      name: faqPage.question_main,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faqPage.answer_main.replace(/<[^>]*>/g, ''),
      },
    },
    ...(faqPage.related_faqs || []).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
    inLanguage: LANGUAGE_CODE_MAP[faqPage.language] || faqPage.language,
  };
}

export function generateWebPageSchema(faqPage: FAQPage, author: Author | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}/faq/${faqPage.slug}#webpage`,
    url: `${BASE_URL}/faq/${faqPage.slug}`,
    name: faqPage.meta_title,
    description: faqPage.meta_description,
    inLanguage: LANGUAGE_CODE_MAP[faqPage.language] || faqPage.language,
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
    primaryImageOfPage: faqPage.featured_image_url
      ? {
          '@type': 'ImageObject',
          url: faqPage.featured_image_url,
        }
      : undefined,
    datePublished: faqPage.created_at,
    dateModified: faqPage.updated_at,
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

export function generateFAQBreadcrumbSchema(faqPage: FAQPage) {
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
        name: 'FAQ',
        item: `${BASE_URL}/faq`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: faqPage.title,
        item: `${BASE_URL}/faq/${faqPage.slug}`,
      },
    ],
  };
}

export function generateFAQSpeakableSchema(faqPage: FAQPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.speakable-answer', '.faq-question-main'],
    },
    inLanguage: LANGUAGE_CODE_MAP[faqPage.language] || faqPage.language,
  };
}

export function generateAllFAQSchemas(faqPage: FAQPage, author: Author | null) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      generateFAQPageSchema(faqPage),
      generateWebPageSchema(faqPage, author),
      generateFAQBreadcrumbSchema(faqPage),
      generateFAQSpeakableSchema(faqPage),
    ],
  };
}
