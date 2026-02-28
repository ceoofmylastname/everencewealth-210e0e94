import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { IULHero } from '@/components/strategies/iul/IULHero';
import { IULSpeakable } from '@/components/strategies/iul/IULSpeakable';
import { IULHowItWorks } from '@/components/strategies/iul/IULHowItWorks';
import { IULComparison } from '@/components/strategies/iul/IULComparison';
import { IULLivingBenefits } from '@/components/strategies/iul/IULLivingBenefits';
import { IULIdealClient } from '@/components/strategies/iul/IULIdealClient';
import { IULCTA } from '@/components/strategies/iul/IULCTA';
import { useTranslation } from '@/i18n/useTranslation';

const IndexedUniversalLife: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'en';
  const { t } = useTranslation();
  const s = (t as any).strategies?.iul;
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
  const canonicalUrl = `${baseUrl}/${currentLang === 'es' ? 'es/estrategias/seguro-universal-indexado' : 'en/strategies/iul'}`;

  const seoTitle = s?.seo?.title || 'Indexed Universal Life Insurance: Tax-Free Growth with 0% Floor | Everence Wealth';
  const seoDesc = s?.seo?.description || 'Discover how Indexed Universal Life (IUL) combines market-linked growth, downside protection, tax-free income, and living benefits.';

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
      { "@type": "ListItem", "position": 3, "name": currentLang === 'es' ? 'Vida Universal Indexada' : 'Indexed Universal Life', "item": canonicalUrl },
    ],
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Everence Wealth",
    "url": baseUrl,
    "logo": `${baseUrl}/logo-icon.png`,
    "description": "Independent fiduciary wealth advisory firm specializing in tax-efficient retirement strategies with access to 75+ carrier partnerships.",
    "slogan": "Bridge the Retirement Gap",
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/strategies/iul`} />
        <link rel="alternate" hrefLang="es" href={`${baseUrl}/es/estrategias/seguro-universal-indexado`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en/strategies/iul`} />
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

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,74%,60%)] shadow-[0_0_8px_hsla(43,74%,49%,0.5)]"
          style={{ width: `${scrollProgress}%`, transition: 'width 0.1s linear' }}
        />
      </div>

      <Header />
      <main className="flex-grow mx-2 md:mx-4 lg:mx-6 space-y-4 md:space-y-6 py-4 md:py-6">
        <div className="rounded-3xl overflow-hidden"><IULHero /></div>
        <div className="rounded-3xl overflow-hidden"><IULSpeakable /></div>
        <div className="rounded-3xl overflow-hidden"><IULHowItWorks /></div>
        <div className="rounded-3xl overflow-hidden"><IULComparison /></div>
        <div className="rounded-3xl overflow-hidden"><IULLivingBenefits /></div>
        <div className="rounded-3xl overflow-hidden"><IULIdealClient /></div>
        <div className="rounded-3xl overflow-hidden"><IULCTA /></div>
      </main>
      <Footer />
    </div>
  );
};

export default IndexedUniversalLife;
