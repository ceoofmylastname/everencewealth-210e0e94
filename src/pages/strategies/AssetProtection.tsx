import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { APHero } from '@/components/strategies/assetprotection/APHero';
import { APSpeakable } from '@/components/strategies/assetprotection/APSpeakable';
import { APThreatLandscape } from '@/components/strategies/assetprotection/APThreatLandscape';
import { APProtectionVehicles } from '@/components/strategies/assetprotection/APProtectionVehicles';
import { APComparison } from '@/components/strategies/assetprotection/APComparison';
import { APIdealClient } from '@/components/strategies/assetprotection/APIdealClient';
import { APCTA } from '@/components/strategies/assetprotection/APCTA';
import { useTranslation } from '@/i18n/useTranslation';

const AssetProtection: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'en';
  const { t } = useTranslation();
  const s = (t as any).strategies?.assetProtection;
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
  const canonicalUrl = `${baseUrl}/${currentLang === 'es' ? 'es/estrategias/proteccion-de-activos' : 'en/strategies/asset-protection'}`;

  const seoTitle = s?.seo?.title || 'Asset Protection: Shield Wealth from Lawsuits, Creditors & Estate Taxes | Everence Wealth';
  const seoDesc = s?.seo?.description || 'Learn how to protect your wealth from lawsuits, creditors, divorce, and estate taxes using ILITs, FLPs, IUL cash value, and annuities.';

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
      { "@type": "ListItem", "position": 3, "name": currentLang === 'es' ? 'Protección de Activos' : 'Asset Protection', "item": canonicalUrl },
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
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/strategies/asset-protection`} />
        <link rel="alternate" hrefLang="es" href={`${baseUrl}/es/estrategias/proteccion-de-activos`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en/strategies/asset-protection`} />
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
        <div className="rounded-3xl overflow-hidden"><APHero /></div>
        <div className="rounded-3xl overflow-hidden"><APSpeakable /></div>
        <div className="rounded-3xl overflow-hidden"><APThreatLandscape /></div>
        <div className="rounded-3xl overflow-hidden"><APProtectionVehicles /></div>
        <div className="rounded-3xl overflow-hidden"><APComparison /></div>
        <div className="rounded-3xl overflow-hidden"><APIdealClient /></div>
        <div className="rounded-3xl overflow-hidden"><APCTA /></div>
      </main>
      <Footer />
    </div>
  );
};

export default AssetProtection;
