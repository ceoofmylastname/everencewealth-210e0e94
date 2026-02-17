import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { TFRHero } from '@/components/strategies/taxfree/TFRHero';
import { TFRSpeakable } from '@/components/strategies/taxfree/TFRSpeakable';
import { TFRTaxTimeBomb } from '@/components/strategies/taxfree/TFRTaxTimeBomb';
import { TFRIncomeStacking } from '@/components/strategies/taxfree/TFRIncomeStacking';
import { TFRComparison } from '@/components/strategies/taxfree/TFRComparison';
import { TFRIdealClient } from '@/components/strategies/taxfree/TFRIdealClient';
import { TFRCTA } from '@/components/strategies/taxfree/TFRCTA';
import { useTranslation } from '@/i18n/useTranslation';

const TaxFreeRetirement: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'en';
  const { t } = useTranslation();
  const s = (t as any).strategies?.taxFreeRetirement;
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
  const canonicalUrl = `${baseUrl}/${currentLang === 'es' ? 'es/estrategias/retiro-libre-impuestos' : 'en/strategies/tax-free-retirement'}`;

  const seoTitle = s?.seo?.title || 'Tax-Free Retirement: $0 Income Taxes with Roth, IUL, Munis & HSA | Everence Wealth';
  const seoDesc = s?.seo?.description || 'Learn how to combine Roth IRAs, Indexed Universal Life, municipal bonds, and HSAs to create a retirement income stream with $0 in federal or state income taxes.';

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
      { "@type": "ListItem", "position": 3, "name": currentLang === 'es' ? 'Jubilación Libre de Impuestos' : 'Tax-Free Retirement', "item": canonicalUrl },
    ],
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Everence Wealth",
    "url": baseUrl,
    "logo": `${baseUrl}/logo-icon.png`,
    "foundingDate": "1998",
    "slogan": "Bridge the Retirement Gap",
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/strategies/tax-free-retirement`} />
        <link rel="alternate" hrefLang="es" href={`${baseUrl}/es/estrategias/retiro-libre-impuestos`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en/strategies/tax-free-retirement`} />
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
      <main className="flex-grow">
        <TFRHero />
        <TFRSpeakable />
        <TFRTaxTimeBomb />
        <TFRIncomeStacking />
        <TFRComparison />
        <TFRIdealClient />
        <TFRCTA />
      </main>
      <Footer />
    </div>
  );
};

export default TaxFreeRetirement;
