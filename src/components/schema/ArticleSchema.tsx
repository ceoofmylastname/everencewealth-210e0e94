import React from 'react';

interface FAQ {
  question: string;
  answer: string;
}

interface ArticleSchemaProps {
    headline: string;
    description: string;
    datePublished: string;
    dateModified: string;
    articleUrl: string;
    imageUrl?: string;
    imageCaption?: string;
    imageAlt?: string;
    context: 'blog' | 'qa';
    faqs?: FAQ[];
    authorName?: string;
    authorUrl?: string;
    language?: string;
    slug?: string;
}

const ArticleSchema: React.FC<ArticleSchemaProps> = ({
    headline,
    description,
    datePublished,
    dateModified,
    articleUrl,
    imageUrl,
    imageCaption,
    imageAlt,
    context,
    faqs,
    authorName,
    authorUrl,
    language = 'en',
    slug,
}) => {
    const baseUrl = 'https://www.everencewealth.com';

    const articleSchema: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": context === 'qa' ? 'QAPage' : 'Article',
        "headline": headline,
        "description": description,
        "datePublished": datePublished,
        "dateModified": dateModified,
        "author": {
            "@type": "Person",
            "name": authorName || "Steven Rosenberg",
            "url": authorUrl || `${baseUrl}/en/team`
        },
        "publisher": {
            "@type": "Organization",
            "name": "Everence Wealth",
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/favicon.png`
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": articleUrl
        },
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", ".speakable-answer"]
        },
        ...(imageUrl && {
            "image": {
                "@type": "ImageObject",
                "url": imageUrl,
                "caption": imageCaption || imageAlt || "",
                "description": imageAlt || imageCaption || ""
            }
        })
    };

    const schemas: any[] = [articleSchema];

    // FAQPage schema from qa_entities
    if (faqs && faqs.length > 0) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        });
    }

    // BreadcrumbList
    if (context === 'blog') {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/${language}/` },
                { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${baseUrl}/${language}/blog/` },
                { "@type": "ListItem", "position": 3, "name": headline, "item": articleUrl }
            ]
        });
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
    );
};

export default ArticleSchema;
