import { truncateForAEO } from "./aeoUtils";

const BASE_URL = 'https://www.everencewealth.com';
const LOGO_URL = `${BASE_URL}/assets/logo-new.png`;

export interface BuyingStep {
  title: string;
  description: string;
  duration?: string;
  documents?: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CostItem {
  name: string;
  percentage?: string;
  amount?: string;
  description: string;
}

export const generateBuyersGuideSchema = (
  steps: BuyingStep[],
  faqs: FAQItem[],
  costs: CostItem[],
  language: string = 'en'
) => {
  const pageUrl = `${BASE_URL}/buyers-guide`;
  
  // WebPage Schema with Speakable
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    "url": pageUrl,
    "name": "Complete Financial Planning Guide | Everence Wealth",
    "description": "Your comprehensive guide to wealth management and financial planning. Step-by-step process, strategies, and expert advice.",
    "inLanguage": language,
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${BASE_URL}#website`,
      "url": BASE_URL,
      "name": "Everence Wealth",
      "publisher": {
        "@type": "FinancialService",
        "name": "Everence Wealth",
        "logo": {
          "@type": "ImageObject",
          "url": LOGO_URL
        }
      }
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".speakable-intro", ".speakable-summary", ".quick-answer"]
    },
    "mainEntity": {
      "@type": "Article",
      "@id": `${pageUrl}#article`
    }
  };

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    "headline": "The Complete Guide to Financial Planning and Wealth Management",
    "description": "Everything you need to know about building and protecting your wealth. From retirement planning to estate strategies.",
    "image": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/assets/costa-del-sol-bg.jpg`,
      "width": 1920,
      "height": 1080
    },
    "author": {
      "@type": "Organization",
      "name": "Everence Wealth",
      "url": BASE_URL,
      "logo": LOGO_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "Everence Wealth",
      "logo": {
        "@type": "ImageObject",
        "url": LOGO_URL
      }
    },
    "datePublished": "2024-01-15",
    "dateModified": new Date().toISOString().split('T')[0],
    "mainEntityOfPage": pageUrl,
    "inLanguage": language,
    "about": [
      { "@type": "Thing", "name": "Wealth Management" },
      { "@type": "Thing", "name": "Financial Planning" },
      { "@type": "Thing", "name": "Retirement Planning" },
      { "@type": "Place", "name": "United States" }
    ]
  };

  // HowTo Schema for buying process
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${pageUrl}#howto`,
    "name": "How to Build a Comprehensive Wealth Management Plan",
    "description": "A step-by-step guide to financial planning, from initial assessment to ongoing portfolio management.",
    "image": `${BASE_URL}/assets/wealth-planning-bg.jpg`,
    "totalTime": "P3M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "minValue": "1000",
      "maxValue": "10000"
    },
    "tool": [
      { "@type": "HowToTool", "name": "Financial Goals Statement" },
      { "@type": "HowToTool", "name": "Current Financial Statements" },
      { "@type": "HowToTool", "name": "Tax Returns" },
      { "@type": "HowToTool", "name": "Insurance Policies" }
    ],
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description,
      "url": `${pageUrl}#step-${index + 1}`,
      ...(step.duration && { "estimatedCost": { "@type": "Duration", "duration": step.duration } })
    }))
  };

  // FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": truncateForAEO(faq.answer)
      }
    }))
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Buyers Guide",
        "item": pageUrl
      }
    ]
  };

  // ItemList Schema for costs
  const costsListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#costs`,
    "name": "Financial Planning Costs and Fees",
    "description": "Complete breakdown of costs for professional wealth management services",
    "numberOfItems": costs.length,
    "itemListElement": costs.map((cost, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": cost.name,
      "description": cost.description
    }))
  };

  const agentSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${BASE_URL}#agent`,
    "name": "Everence Wealth",
    "url": BASE_URL,
    "logo": LOGO_URL,
    "image": LOGO_URL,
    "telephone": "+1 (555) 123-4567",
    "email": "info@everencewealth.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "San Diego",
      "addressRegion": "California",
      "addressCountry": "US"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ]
  };

  return [
    webPageSchema,
    articleSchema,
    howToSchema,
    faqSchema,
    breadcrumbSchema,
    costsListSchema,
    agentSchema
  ];
};

// Default content for the buyers guide
export const defaultBuyingSteps: BuyingStep[] = [
  {
    title: "Define Your Requirements",
    description: "Determine your budget, preferred location, property type, and must-have features. Consider proximity to beaches, golf courses, international schools, and airports.",
    duration: "P1W"
  },
  {
    title: "Get Your NIE Number",
    description: "Apply for your Número de Identificación de Extranjero (NIE) - the Spanish tax identification number required for all property transactions. This can be done at a Spanish consulate or in Spain.",
    duration: "P2W"
  },
  {
    title: "Open a Spanish Bank Account",
    description: "Set up a Spanish bank account to handle the property purchase payments, taxes, and ongoing utility bills. Most banks offer accounts for non-residents.",
    duration: "P1W"
  },
  {
    title: "Property Search & Viewings",
    description: "Work with a trusted real estate agent to identify suitable properties. Schedule viewings and explore different areas of the Costa del Sol.",
    duration: "P4W"
  },
  {
    title: "Make an Offer & Reservation",
    description: "Once you've found your ideal property, make an offer. Upon acceptance, pay a reservation deposit (typically €6,000-€10,000) to take the property off the market.",
    duration: "P1W"
  },
  {
    title: "Legal Due Diligence",
    description: "Hire an independent Spanish lawyer to verify property ownership, check for debts or charges, review building licenses, and ensure everything is legally compliant.",
    duration: "P3W"
  },
  {
    title: "Sign Private Purchase Contract",
    description: "Sign the contrato de arras (private purchase contract) and pay 10% of the purchase price as a deposit. This legally binds both parties to complete the sale.",
    duration: "P1D"
  },
  {
    title: "Complete at the Notary",
    description: "Sign the escritura (title deed) at the notary's office, pay the remaining balance, and receive your keys. The notary will register the property in your name.",
    duration: "P1D"
  }
];

export const defaultFAQs: FAQItem[] = [
  {
    question: "Can foreigners buy property in Spain?",
    answer: "Yes, there are no restrictions on foreigners purchasing property in Spain. Both EU and non-EU citizens can buy property with full ownership rights. You will need a NIE (tax identification number) to complete the purchase."
  },
  {
    question: "What is a NIE and how do I get one?",
    answer: "A NIE (Número de Identificación de Extranjero) is a tax identification number required for all financial transactions in Spain. You can apply at a Spanish consulate in your home country or at a National Police station in Spain. The process typically takes 1-2 weeks."
  },
  {
    question: "What are the total costs of buying property in Spain?",
    answer: "Total buying costs typically range from 10-13% of the purchase price. This includes Transfer Tax (ITP) of 7% for resale properties or 10% VAT for new builds, plus notary fees (0.5-1%), registry fees (0.5-1%), and legal fees (1-1.5%)."
  },
  {
    question: "What is the Spanish Digital Nomad Visa?",
    answer: "The Spanish Digital Nomad Visa grants residency to remote workers who earn at least €2,520/month from non-Spanish companies or clients. Benefits include visa-free travel throughout the Schengen zone, the right to live in Spain while working remotely, and a path to permanent residency after 5 years. Initial validity is 3 years, renewable for 2 more."
  },
  {
    question: "Do I need to be in Spain to buy property?",
    answer: "No, you can grant Power of Attorney (Poder Notarial) to a trusted representative who can complete the purchase on your behalf. This is common for international buyers and your lawyer can guide you through the process."
  },
  {
    question: "How long does the buying process take?",
    answer: "The typical property purchase in Spain takes 2-3 months from accepted offer to completion. However, this can vary depending on factors such as mortgage approval, legal checks, and the complexity of the transaction."
  },
  {
    question: "Can I get a mortgage in Spain as a foreigner?",
    answer: "Yes, Spanish banks offer mortgages to non-residents, typically up to 60-70% of the property value. You'll need to provide proof of income, tax returns, and bank statements. Interest rates and terms vary by bank."
  },
  {
    question: "What ongoing costs should I expect?",
    answer: "Annual costs include IBI property tax (0.4-1.1% of cadastral value), community fees for apartments/urbanizations (€100-500/month), home insurance, and utility bills. Non-residents also pay annual income tax on a deemed rental value."
  }
];

export const defaultCosts: CostItem[] = [
  {
    name: "Transfer Tax (ITP) - Resale Properties",
    percentage: "7%",
    description: "Impuesto de Transmisiones Patrimoniales - paid on resale properties in Andalucía"
  },
  {
    name: "VAT (IVA) - New Build Properties",
    percentage: "10%",
    description: "Value Added Tax paid on new-build properties directly from developers"
  },
  {
    name: "Stamp Duty (AJD) - New Builds",
    percentage: "1.2%",
    description: "Actos Jurídicos Documentados - additional tax on new-build purchases"
  },
  {
    name: "Notary Fees",
    percentage: "0.5-1%",
    description: "Fees for the notary to witness and authenticate the sale deed"
  },
  {
    name: "Land Registry Fees",
    percentage: "0.5-1%",
    description: "Fees to register the property in your name at the Land Registry"
  },
  {
    name: "Legal Fees",
    percentage: "1-1.5%",
    description: "Independent lawyer fees for due diligence and contract review"
  },
  {
    name: "Bank Charges",
    amount: "€200-500",
    description: "Bank transfer fees and account setup costs"
  },
  {
    name: "Mortgage Costs (if applicable)",
    percentage: "1-2%",
    description: "Arrangement fees, valuation, and mortgage stamp duty"
  }
];
