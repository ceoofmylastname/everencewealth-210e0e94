import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { WLHero } from '@/components/strategies/wholelife/WLHero';
import { WLSpeakable } from '@/components/strategies/wholelife/WLSpeakable';
import { WLHowItWorks } from '@/components/strategies/wholelife/WLHowItWorks';
import { WLComparison } from '@/components/strategies/wholelife/WLComparison';
import { WLInfiniteBanking } from '@/components/strategies/wholelife/WLInfiniteBanking';
import { WLIdealClient } from '@/components/strategies/wholelife/WLIdealClient';
import { WLCTA } from '@/components/strategies/wholelife/WLCTA';
import { useTranslation } from '@/i18n/useTranslation';

const WholeLife: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'en';
  const { t } = useTranslation();
  const s = (t as any).strategies?.wholeLife;
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
  const canonicalUrl = `${baseUrl}/${currentLang === 'es' ? 'es/estrategias/seguro-vida-entera' : 'en/strategies/whole-life'}`;

  const seoTitle = s?.seo?.title || 'Whole Life Insurance: Guaranteed Growth & Infinite Banking | Everence Wealth';
  const seoDesc = s?.seo?.description || 'Discover how Whole Life Insurance provides guaranteed cash value growth, tax-free dividends, infinite banking, and a permanent death benefit for generational wealth.';

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": seoTitle,
    "description": seoDesc,
    "url": canonicalUrl,
    "inLanguage": currentLang,
    "isPartOf": { "@type": "WebSite", "name": "Everence Wealth", "url": baseUrl },
    "about": { "@type": "FinancialService", "name": "Everence Wealth" },
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": seoTitle,
    "description": seoDesc,
    "url": canonicalUrl,
    "inLanguage": currentLang,
    "author": { "@type": "Organization", "name": "Everence Wealth" },
    "publisher": { "@type": "Organization", "name": "Everence Wealth", "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo-icon.png` } },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": currentLang === 'es' ? 'Estrategias' : 'Strategies', "item": `${baseUrl}/${currentLang}/strategies` },
      { "@type": "ListItem", "position": 3, "name": currentLang === 'es' ? 'Seguro de Vida Entera' : 'Whole Life Insurance', "item": canonicalUrl },
    ],
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Everence Wealth",
    "url": baseUrl,
    "logo": `${baseUrl}/logo-icon.png`,
    "description": "Independent wealth advisory firm specializing in tax-efficient retirement strategies with access to 75+ carrier partnerships.",
    "slogan": "Bridge the Retirement Gap",
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/strategies/whole-life`} />
        <link rel="alternate" hrefLang="es" href={`${baseUrl}/es/estrategias/seguro-vida-entera`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en/strategies/whole-life`} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      </Helmet>

      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,74%,60%)] shadow-[0_0_8px_hsla(43,74%,49%,0.5)]"
          style={{ width: `${scrollProgress}%`, transition: 'width 0.1s linear' }}
        />
      </div>

      <Header />
      <main className="flex-grow mx-2 md:mx-4 lg:mx-6 space-y-4 md:space-y-6 py-4 md:py-6">
        <div className="rounded-3xl overflow-hidden"><WLHero /></div>
        <div className="rounded-3xl overflow-hidden"><WLSpeakable /></div>
        <div className="rounded-3xl overflow-hidden"><WLHowItWorks /></div>
        <div className="rounded-3xl overflow-hidden"><WLComparison /></div>
        <div className="rounded-3xl overflow-hidden"><WLInfiniteBanking /></div>
        <div className="rounded-3xl overflow-hidden"><WLIdealClient /></div>
        <div className="rounded-3xl overflow-hidden"><WLCTA /></div>
      </main>
      <Footer />
    </div>
  );
};

export default WholeLife;
