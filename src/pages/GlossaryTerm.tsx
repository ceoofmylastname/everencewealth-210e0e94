import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Book, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { SUPPORTED_LANGUAGES } from "@/types/hreflang";

interface GlossaryTerm {
  term: string;
  full_name: string;
  definition: string;
  related_terms: string[];
  see_also: string[];
}

interface GlossaryCategory {
  title: string;
  description: string;
  terms: GlossaryTerm[];
}

interface GlossaryData {
  version: string;
  last_updated: string;
  total_terms: number;
  categories: Record<string, GlossaryCategory>;
}

const BASE_URL = "https://www.everencewealth.com";

export const toTermSlug = (term: string) =>
  term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const GlossaryTermPage: React.FC = () => {
  const { lang, termSlug } = useParams<{ lang: string; termSlug: string }>();
  const currentLang = lang || "en";

  const [glossaryData, setGlossaryData] = useState<GlossaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGlossary = async () => {
      setLoading(true);
      const storageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/glossary-translations/${currentLang}.json`;
      try {
        const res = await fetch(storageUrl);
        if (res.ok) { setGlossaryData(await res.json()); setLoading(false); return; }
      } catch { /* fallback */ }
      try {
        const res = await fetch(`/glossary/${currentLang}.json`);
        if (res.ok) { setGlossaryData(await res.json()); setLoading(false); return; }
      } catch { /* fallback */ }
      try {
        const res = await fetch("/glossary/en.json");
        if (res.ok) setGlossaryData(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    };
    loadGlossary();
  }, [currentLang]);

  const matchedTerm = React.useMemo(() => {
    if (!glossaryData || !termSlug) return null;
    for (const [catKey, cat] of Object.entries(glossaryData.categories)) {
      for (const t of cat.terms) {
        if (toTermSlug(t.term) === termSlug) {
          return { ...t, categoryKey: catKey, categoryTitle: cat.title };
        }
      }
    }
    return null;
  }, [glossaryData, termSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!matchedTerm) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
          <h1 className="text-2xl font-bold">Term Not Found</h1>
          <Button asChild variant="outline">
            <Link to={`/${currentLang}/glossary`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Glossary
            </Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const canonicalUrl = `${BASE_URL}/${currentLang}/glossary/${termSlug}`;
  const pageTitle = `${matchedTerm.full_name} — Definition | Everence Wealth Glossary`;
  const pageDescription = matchedTerm.definition.slice(0, 155);

  const definedTermSchema = [
    {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: matchedTerm.full_name,
      description: matchedTerm.definition,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: "Everence Wealth Management Glossary",
        url: `${BASE_URL}/${currentLang}/glossary`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/${currentLang}/` },
        { "@type": "ListItem", position: 2, name: "Glossary", item: `${BASE_URL}/${currentLang}/glossary` },
        { "@type": "ListItem", position: 3, name: matchedTerm.full_name, item: canonicalUrl },
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {SUPPORTED_LANGUAGES.map((lc) => (
          <link key={lc} rel="alternate" hrefLang={lc} href={`${BASE_URL}/${lc}/glossary/${termSlug}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/en/glossary/${termSlug}`} />
        <script type="application/ld+json">{JSON.stringify(definedTermSchema)}</script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A4D3E] via-[#15402F] to-[#0D2E20]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-prime-gold/15 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <Link
              to={`/${currentLang}/glossary`}
              className="inline-flex items-center gap-2 text-white/70 hover:text-prime-gold transition-colors mb-8 text-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Glossary
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-prime-gold/20 flex items-center justify-center">
                <Book className="h-5 w-5 text-prime-gold" />
              </div>
              <Badge className="bg-prime-gold/20 text-prime-gold border-prime-gold/30">
                {matchedTerm.categoryTitle}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
              {matchedTerm.term}
            </h1>
            {matchedTerm.full_name !== matchedTerm.term && (
              <p className="text-lg text-white/60 italic">{matchedTerm.full_name}</p>
            )}
          </div>
        </section>

        {/* Definition */}
        <section className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 md:p-12">
            <h2 className="text-xl font-bold text-prime-900 mb-4">Definition</h2>
            <p className="text-lg text-slate-700 leading-relaxed">{matchedTerm.definition}</p>

            {matchedTerm.related_terms.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Related Terms</h3>
                <div className="flex flex-wrap gap-2">
                  {matchedTerm.related_terms.map((rt) => (
                    <Link
                      key={rt}
                      to={`/${currentLang}/glossary/${toTermSlug(rt)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-prime-50 text-prime-700 text-sm font-medium hover:bg-prime-gold hover:text-white transition-colors"
                    >
                      {rt}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {matchedTerm.see_also.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Learn More</h3>
                <div className="flex flex-wrap gap-3">
                  {matchedTerm.see_also.map((link) => (
                    <Link
                      key={link}
                      to={`/${currentLang}${link}`}
                      className="inline-flex items-center gap-1.5 text-prime-gold hover:text-prime-600 font-medium text-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Explore
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 mb-4">Want expert guidance on this topic?</p>
            <Button asChild className="bg-prime-gold text-prime-900 hover:bg-prime-gold/90">
              <Link to={`/${currentLang}/contact`}>
                Schedule a Free Consultation <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default GlossaryTermPage;
