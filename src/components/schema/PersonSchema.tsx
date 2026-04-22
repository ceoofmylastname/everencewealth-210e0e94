import React from 'react';

// TODO: Person.image pending verified headshots of Steven Rosenberg.
// Do NOT substitute placeholder photos — schema.org E-E-A-T integrity rule:
// the image MUST be a verified photo of the named person.
// Required assets: /public/images/steven-blog.jpg and /public/images/steven-qa.jpg
const PersonSchema: React.FC = () => {
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": "https://www.everencewealth.com/#steven-rosenberg",
        "name": "Steven Rosenberg",
        "jobTitle": "Founder & Chief Wealth Strategist",
        "description": "Founder & Chief Wealth Strategist at Everence Wealth. Independent insurance broker and licensed professional serving families across all 50 states.",
        // sameAs intentionally omitted — pending verified personal profile URL.
        // Per schema.org, Person.sameAs must point to pages ABOUT THAT PERSON;
        // a company LinkedIn page is NOT valid here.
        "worksFor": {
            "@type": "Organization",
            "@id": "https://www.everencewealth.com/#organization",
            "name": "Everence Wealth",
            "url": "https://www.everencewealth.com"
        },
        "knowsAbout": [
            "Indexed Universal Life Insurance",
            "Tax-Free Retirement Strategies",
            "Three Tax Buckets Framework",
            "Independent Financial Planning",
            "Retirement Gap Analysis"
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
    );
};

export default PersonSchema;
