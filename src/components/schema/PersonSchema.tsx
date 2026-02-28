import React from 'react';

interface PersonSchemaProps {
    context: 'blog' | 'qa';
}

const PersonSchema: React.FC<PersonSchemaProps> = ({ context }) => {
    const photoUrl = context === 'blog'
        ? 'https://everencewealth.com/images/steven-blog.jpg'
        : 'https://everencewealth.com/images/steven-qa.jpg';

    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": "https://everencewealth.com/#steven-rosenberg",
        "name": "Steven Rosenberg",
        "jobTitle": "Founder & Chief Wealth Strategist",
        "description": "Founder & Chief Wealth Strategist at Everence Wealth. Independent fiduciary advisor and licensed insurance professional serving families across all 50 states.",
        "image": photoUrl,
        "sameAs": [
            "https://www.linkedin.com/in/stevenrosenberg/"
        ],
        "worksFor": {
            "@type": "Organization",
            "@id": "https://everencewealth.com/#organization",
            "name": "Everence Wealth",
            "url": "https://everencewealth.com"
        },
        "knowsAbout": [
            "Indexed Universal Life Insurance",
            "Tax-Free Retirement Strategies",
            "Three Tax Buckets Framework",
            "Fiduciary Financial Planning",
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
