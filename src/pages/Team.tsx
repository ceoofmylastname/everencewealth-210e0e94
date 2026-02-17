import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { TeamHero } from "@/components/team/TeamHero";
import { TeamGrid } from "@/components/team/TeamGrid";
import { useTranslation } from "@/i18n";
import BlogEmmaChat from '@/components/blog-article/BlogEmmaChat';
import { COMPANY_INFO } from "@/constants/company";

const BASE_URL = "https://www.everencewealth.com";

const Team = () => {
  const { lang } = useParams<{ lang: string }>();
  const { t, currentLanguage } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${BASE_URL}/#organization`,
    "name": COMPANY_INFO.name,
    "description": t.team?.meta?.description || "Meet the expert wealth advisors at Everence Wealth.",
    "url": BASE_URL,
    "logo": `${BASE_URL}/logo.png`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "455 Market St Ste 1940 PMB 350011",
      "addressLocality": "San Francisco",
      "postalCode": "94105",
      "addressRegion": "CA",
      "addressCountry": "US"
    },
    "telephone": "+1-415-555-0100",
    "email": "info@everencewealth.com",
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "knowsLanguage": ["en", "es"]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-2 md:mx-4 lg:mx-6 space-y-4 md:space-y-6 py-4 md:py-6">
          <div className="rounded-3xl overflow-hidden">
            <TeamHero />
          </div>
          <div className="rounded-3xl overflow-hidden">
            <TeamGrid />
          </div>
        </main>

        <Footer />
        <BlogEmmaChat language={lang || 'en'} />
      </div>
    </>
  );
};

export default Team;
