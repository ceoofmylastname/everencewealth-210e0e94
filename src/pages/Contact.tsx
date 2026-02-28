import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { ContactHero } from '@/components/contact/ContactHero';
import { ContactOptions } from '@/components/contact/ContactOptions';
import { ContactForm } from '@/components/contact/ContactForm';
import { OfficeInfo } from '@/components/contact/OfficeInfo';
import { ContactFAQ } from '@/components/contact/ContactFAQ';
import { EmmaCallout } from '@/components/contact/EmmaCallout';
import { MobileStickyContact } from '@/components/contact/MobileStickyContact';
import { useTranslation } from '@/i18n';
import BlogEmmaChat from '@/components/blog-article/BlogEmmaChat';
import { COMPANY_ADDRESS, COMPANY_CONTACT, COMPANY_FACTS } from '@/constants/company';

const Contact: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const language = lang || 'en';

  const contactT = (t as any).contact || getDefaultContactTranslations();

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Everence Wealth',
    description: contactT.meta?.description || 'Independent wealth management and retirement planning',
    url: `https://everencewealth.com/${language}/contact`,
    telephone: COMPANY_CONTACT.phone,
    email: COMPANY_CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_ADDRESS.street,
      addressLocality: COMPANY_ADDRESS.city,
      addressRegion: COMPANY_ADDRESS.province,
      postalCode: COMPANY_ADDRESS.postalCode,
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.7908,
      longitude: -122.3989
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '14:00'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: COMPANY_FACTS.happyClients
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    }
  };

  return (
    <>
      <Helmet>
        <title>{contactT.meta?.title || 'Contact Everence Wealth | Financial Planning & Wealth Management'}</title>
        <meta name="description" content={contactT.meta?.description || 'Get in touch with our independent wealth advisors.'} />
        <link rel="canonical" href={`https://everencewealth.com/${language}/contact`} />
        <meta property="og:title" content={contactT.meta?.title} />
        <meta property="og:description" content={contactT.meta?.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://everencewealth.com/${language}/contact`} />
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      <Header />
      
      <main className="min-h-screen">
        <ContactHero t={contactT} />
        <ContactOptions t={contactT} />
        <ContactForm t={contactT} language={language} />
        <OfficeInfo t={contactT} />
        <ContactFAQ t={contactT} />
        <EmmaCallout t={contactT} />
      </main>

      <Footer />

      <BlogEmmaChat language={language} />

      <MobileStickyContact 
        whatsappMessage={contactT.options?.whatsapp?.prefill || "Hi, I'm interested in learning about retirement strategies. Can you help me?"}
        whatsappLabel={contactT.options?.whatsapp?.cta || "Chat With Us"}
      />

      <div className="lg:hidden h-24" />
    </>
  );
};

function getDefaultContactTranslations() {
  return {
    meta: {
      title: "Contact Everence Wealth | Financial Planning & Wealth Management",
      description: "Get in touch with our independent wealth advisors. Phone, email, or schedule a consultation for personalized retirement and wealth planning guidance."
    },
    hero: {
      headline: "Get in Touch",
      subheadline: "We're here to help you build a tax-efficient retirement strategy"
    },
    options: {
      whatsapp: {
        title: "Chat With Us",
        description: "Get instant responses from our team",
        cta: "Start Chat",
        prefill: "Hi, I'm interested in learning about retirement strategies. Can you help me?"
      },
      email: {
        title: "Send Us an Email",
        description: "We'll respond within 24 hours",
        cta: "Send Email"
      },
      phone: {
        title: "Call Our Office",
        description: "Speak directly with an advisor",
        cta: "Call Now"
      }
    },
    form: {
      headline: "Send Us a Message",
      subheadline: "Fill out the form and we'll get back to you shortly",
      fields: {
        fullName: "Full Name",
        email: "Email Address",
        phone: "Phone Number (Optional)",
        language: "Preferred Language",
        subject: "Subject",
        message: "Your Message",
        referral: "How did you hear about us? (Optional)",
        privacy: "I agree to the Privacy Policy and consent to processing of my data."
      },
      subjects: {
        general: "General Inquiry",
        property: "Strategy Inquiry",
        selling: "Retirement Planning",
        viewing: "Schedule a Consultation",
        other: "Other"
      },
      referrals: {
        google: "Google Search",
        socialMedia: "Social Media",
        referral: "Friend/Family Referral",
        advertisement: "Online Advertisement",
        other: "Other"
      },
      submit: "Send Message",
      submitting: "Sending...",
      success: {
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll respond within 24 hours."
      }
    },
    office: {
      headline: "Visit Our Office",
      hours: {
        title: "Office Hours",
        weekdays: "Monday - Friday",
        saturday: "Saturday",
        sunday: "Sunday",
        closed: "Closed",
        timezone: "Pacific Time (PT)"
      },
      directions: "Get Directions"
    },
    faq: {
      headline: "Frequently Asked Questions",
      items: [
        {
          question: "How quickly will you respond?",
          answer: "We aim to respond to all inquiries within 24 hours during business days. Phone and chat messages typically receive faster responses."
        },
        {
          question: "What languages do you support?",
          answer: "Our team provides full service in English and Spanish."
        },
        {
          question: "Can I schedule a video call?",
          answer: "Absolutely! Contact us via phone or email to arrange a convenient time for a video consultation with one of our wealth advisors."
        },
        {
          question: "What areas do you serve?",
          answer: "We serve clients across all 50 US states, specializing in retirement planning, tax-efficient wealth strategies, and asset protection."
        }
      ]
    },
    emma: {
      callout: "Prefer instant answers?",
      cta: "Chat with our AI assistant"
    }
  };
}

export default Contact;
