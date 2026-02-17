import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { Header } from '../components/home/Header';
import { Footer } from '../components/home/Footer';
import { PhilosophyHero } from '../components/philosophy/PhilosophyHero';
import { PhilosophySpeakable } from '../components/philosophy/PhilosophySpeakable';
import { PhilosophyKillers } from '../components/philosophy/PhilosophyKillers';
import { PhilosophyBuckets } from '../components/philosophy/PhilosophyBuckets';
import { PhilosophyCashFlow } from '../components/philosophy/PhilosophyCashFlow';
import { PhilosophyCTA } from '../components/philosophy/PhilosophyCTA';
import { useTranslation } from '@/i18n/useTranslation';

const Philosophy: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'en';
  const { t } = useTranslation();
  const p = t.philosophy;
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseUrl = 'https://everencewealth.com';
  const canonicalUrl = `${baseUrl}/${currentLang === 'es' ? 'es/filosofia' : 'philosophy'}`;

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": p.seo.title,
    "description": p.seo.description,
    "url": canonicalUrl,
    "inLanguage": currentLang,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Everence Wealth",
      "url": baseUrl,
    },
    "about": {
      "@type": "FinancialService",
      "name": "Everence Wealth",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Everence Wealth",
    "description": "Independent fiduciary wealth management specializing in tax-efficient indexed retirement strategies.",
    "url": baseUrl,
    "logo": `${baseUrl}/logo-icon.png`,
    "foundingDate": "1998",
    "founder": {
      "@type": "Person",
      "name": "Steven Rosenberg",
      "jobTitle": "Founder & Chief Wealth Strategist",
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "455 Market St Ste 1940 PMB 350011",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94105",
      "addressCountry": "US",
    },
    "slogan": "Bridge the Retirement Gap",
    "knowsAbout": [
      "Tax-Free Retirement Planning",
      "Indexed Universal Life Insurance",
      "Three Tax Buckets Strategy",
      "Asset Protection",
      "Fiduciary Financial Planning",
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": p.seo.breadcrumb, "item": canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Helmet>
        <title>{p.seo.title}</title>
        <meta name="description" content={p.seo.description} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/philosophy`} />
        <link rel="alternate" hrefLang="es" href={`${baseUrl}/es/filosofia`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/philosophy`} />
        <meta property="og:title" content={p.seo.title} />
        <meta property="og:description" content={p.seo.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${baseUrl}/images/philosophy-og.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={p.seo.title} />
        <meta name="twitter:description" content={p.seo.description} />
        <meta name="twitter:image" content={`${baseUrl}/images/philosophy-og.jpg`} />
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,74%,60%)] shadow-[0_0_8px_hsla(43,74%,49%,0.5)]"
          style={{ width: `${scrollProgress}%`, transition: 'width 0.1s linear' }}
        />
      </div>

      <Header />
      <main className="flex-grow">
        <PhilosophyHero />
        <PhilosophySpeakable />
        <PhilosophyKillers />
        <PhilosophyBuckets />
        <PhilosophyCashFlow />
        <PhilosophyCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Philosophy;
