import React from 'react';
import { Helmet } from 'react-helmet';
import { Header } from '../components/home/Header';
import { Footer } from '../components/home/Footer';
import { Hero } from '../components/home/sections/Hero';
import { WakeUpCall } from '../components/homepage/WakeUpCall';
import { StackingCards } from '../components/homepage/StackingCards';
import { WealthPhilosophy } from '../components/homepage/WealthPhilosophy';
import { IndependentDifference } from '../components/homepage/IndependentDifference';
import { TheGap } from '../components/homepage/TheGap';
import { Services } from '../components/homepage/Services';
import { HomepageAbout } from '../components/homepage/HomepageAbout';
import { Stats } from '../components/homepage/Stats';
import { Assessment } from '../components/homepage/Assessment';
import { FAQ } from '../components/homepage/FAQ';
import { BlogPreview } from '../components/homepage/BlogPreview';
import { CTA } from '../components/homepage/CTA';
import { CursorGlow } from '../components/CursorGlow';
import { ScrollProgressBar } from '../components/homepage/ScrollProgressBar';
import { useTranslation } from '../i18n/useTranslation';
import { COMPANY_CONTACT, COMPANY_ADDRESS } from '../constants/company';

function Home() {
  const { t } = useTranslation();
  const faqItems = (t as any).homepage?.faq?.items || [];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Everence Wealth",
    "url": "https://www.everencewealth.com",
    "logo": "https://www.everencewealth.com/favicon.png",
    "description": "Independent wealth broker offering tax-free retirement strategies with access to 75+ carriers. Nationwide coverage.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": COMPANY_ADDRESS.city,
      "addressRegion": COMPANY_ADDRESS.province,
      "addressCountry": "US"
    },
    "telephone": COMPANY_CONTACT.phone,
    "email": COMPANY_CONTACT.email,
    "areaServed": "US",
    "serviceType": "Retirement Planning, Wealth Protection, Legacy Planning"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item: { q: string; a: string }) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  const sectionClass = "rounded-3xl overflow-hidden";
  return (
    <div className="min-h-screen flex flex-col font-sans text-white bg-white">
      <Helmet>
        <title>Everence Wealth - Bridge the Retirement Gap</title>
        <meta name="description" content="Tax-free retirement strategies with 0% floor protection. Independent broker guidance helping families eliminate fees, volatility, and taxes since 1990." />
        <link rel="canonical" href="https://www.everencewealth.com/" />
        <meta property="og:title" content="Everence Wealth - Bridge the Retirement Gap" />
        <meta property="og:description" content="Tax-free retirement strategies with 0% floor protection. Independent broker guidance helping families eliminate fees, volatility, and taxes since 1990." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.everencewealth.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify([organizationSchema, faqSchema])}</script>
      </Helmet>
      <ScrollProgressBar />
      <Header />
      <CursorGlow />
      <main className="flex-grow mx-2 md:mx-4 lg:mx-6 space-y-2 md:space-y-3 py-2 md:py-3">
        <div className={sectionClass}><Hero /></div>
        <div className={sectionClass}><WakeUpCall /></div>
        <div className={sectionClass}><StackingCards /></div>
        <div className={sectionClass}><WealthPhilosophy /></div>
        <div className={sectionClass}><IndependentDifference /></div>
        <div className={sectionClass}><TheGap /></div>
        <div className={sectionClass}><Services /></div>
        <div className={sectionClass}><HomepageAbout /></div>
        <div className={sectionClass}><Stats /></div>
        <div className={sectionClass}><Assessment /></div>
        <div className={sectionClass}><FAQ /></div>
        <div className={sectionClass}><BlogPreview /></div>
        <div className={sectionClass}><CTA /></div>
      </main>
      <div className="mx-2 md:mx-4 lg:mx-6 mb-2 md:mb-3 rounded-3xl overflow-hidden">
        <Footer />
      </div>
    </div>
  );
}

export default Home;
