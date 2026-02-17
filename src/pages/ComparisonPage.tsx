import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { ComparisonHero } from "@/components/comparison/ComparisonHero";
import { SpeakableBox } from "@/components/comparison/SpeakableBox";
import { ComparisonTable } from "@/components/comparison/ComparisonTable";
import { OptionCard } from "@/components/comparison/OptionCard";
import { VerdictSection } from "@/components/comparison/VerdictSection";
import { ComparisonFAQ } from "@/components/comparison/ComparisonFAQ";
import { CTASection } from "@/components/comparison/CTASection";
import { TLDRSummary } from "@/components/comparison/TLDRSummary";
import { ComparisonLanguageSwitcher } from "@/components/comparison/ComparisonLanguageSwitcher";
import BlogEmmaChat from "@/components/blog-article/BlogEmmaChat";
import { ComparisonPage as ComparisonPageType, generateAllComparisonSchemas } from "@/lib/comparisonSchemaGenerator";
import { markdownToHtml } from "@/lib/markdownToHtml";
import { ArrowRight, ArrowLeft, BookOpen, Layers, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageMismatchNotFound } from "@/components/LanguageMismatchNotFound";

const BASE_URL = "https://www.everencewealth.com";

export default function ComparisonPage() {
  const { slug, lang = 'en' } = useParams<{ slug: string; lang: string }>();
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const [showUseCases, setShowUseCases] = useState(false);

  const { data: comparison, isLoading, error } = useQuery({
    queryKey: ['comparison', lang, slug],
    queryFn: async () => {
      // First try: exact match (slug + language)
      const { data: exactMatch } = await supabase
        .from('comparison_pages')
        .select('*')
        .eq('slug', slug)
        .eq('language', lang)
        .eq('status', 'published')
        .single();
      
      if (exactMatch) {
        return exactMatch as unknown as ComparisonPageType;
      }
      
      // Second try: find by slug only (language mismatch case)
      const { data: anyMatch } = await supabase
        .from('comparison_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      
      if (anyMatch) {
        return { ...anyMatch, _needsRedirect: true } as unknown as ComparisonPageType & { _needsRedirect?: boolean };
      }
      
      return null;
    },
    enabled: !!slug,
  });

  // Fetch author for schema
  const { data: author } = useQuery({
    queryKey: ['comparison-author', comparison?.author_id],
    queryFn: async () => {
      if (!comparison?.author_id) return null;
      const { data } = await supabase
        .from('authors')
        .select('name, job_title, linkedin_url')
        .eq('id', comparison.author_id)
        .single();
      return data;
    },
    enabled: !!comparison?.author_id,
  });

  const handleChatClick = () => {
    window.dispatchEvent(new CustomEvent('openChatbot'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Comparison Not Found</h1>
            <p className="text-muted-foreground">The comparison you're looking for doesn't exist.</p>
            <Link to={`/${lang}/compare`} className="inline-flex items-center gap-2 text-primary hover:underline">
              View all comparisons
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Smart language mismatch handling
  if (comparison && (comparison as any)._needsRedirect && comparison.language !== lang) {
    const compTranslations = (comparison as any).translations as Record<string, string> | null;
    const correctSlug = compTranslations?.[lang];
    
    if (correctSlug) {
      return <Navigate to={`/${lang}/compare/${correctSlug}`} replace />;
    }
    
    return (
      <>
        <Header />
        <LanguageMismatchNotFound
          requestedLang={lang}
          actualLang={comparison.language || 'en'}
          slug={slug || ''}
          translations={compTranslations}
          contentType="compare"
        />
        <Footer />
      </>
    );
  }

  const quickComparisonTable = Array.isArray(comparison.quick_comparison_table) 
    ? comparison.quick_comparison_table 
    : [];
  const qaEntities = Array.isArray(comparison.qa_entities) 
    ? comparison.qa_entities 
    : [];

  const canonicalUrl = (comparison as any).canonical_url || 
    `${BASE_URL}/${comparison.language}/compare/${comparison.slug}`;

  // Build hreflang tags from translations
  const translations = (comparison as any).translations as Record<string, string> | null;
  const hreflangTags: { lang: string; href: string }[] = [];
  
  hreflangTags.push({
    lang: comparison.language || 'en',
    href: `${BASE_URL}/${comparison.language}/compare/${comparison.slug}`,
  });
  
  if (translations) {
    Object.entries(translations).forEach(([lang, slug]) => {
      if (lang !== comparison.language) {
        hreflangTags.push({
          lang,
          href: `${BASE_URL}/${lang}/compare/${slug}`,
        });
      }
    });
  }

  const xDefaultSlug = translations?.en || comparison.slug;
  const xDefaultLang = translations?.en ? 'en' : comparison.language;

  // Generate full JSON-LD structured data
  const schemas = generateAllComparisonSchemas(comparison, author);

  return (
    <>
      <Helmet>
        <title>{comparison.meta_title}</title>
        <meta name="description" content={comparison.meta_description} />
        <link rel="canonical" href={canonicalUrl} />
        
        {hreflangTags.map(({ lang, href }) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={href} />
        ))}
        
        <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/${xDefaultLang}/compare/${xDefaultSlug}`} />
        
        {/* Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify(schemas.article)}
        </script>
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify(schemas.organization)}
        </script>
        
        {/* Speakable Schema */}
        <script type="application/ld+json">
          {JSON.stringify(schemas.speakable)}
        </script>
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify(schemas.breadcrumb)}
        </script>
        
        {/* FAQ Schema */}
        {schemas.faq && (
          <script type="application/ld+json">
            {JSON.stringify(schemas.faq)}
          </script>
        )}
        
        {/* Table Schema */}
        {schemas.table && (
          <script type="application/ld+json">
            {JSON.stringify(schemas.table)}
          </script>
        )}
        
        {/* Image Schema */}
        {schemas.image && (
          <script type="application/ld+json">
            {JSON.stringify(schemas.image)}
          </script>
        )}
      </Helmet>
      <Header />
      
      <main className="min-h-screen bg-background">
        <ComparisonHero
          headline={comparison.headline}
          topic={comparison.comparison_topic}
          optionA={comparison.option_a}
          optionB={comparison.option_b}
          featuredImageUrl={comparison.featured_image_url}
          featuredImageAlt={comparison.featured_image_alt}
          featuredImageCaption={comparison.featured_image_caption}
        />
        
        <div className="container mx-auto px-4 -mt-4">
          <ComparisonLanguageSwitcher
            currentLanguage={comparison.language || 'en'}
            translations={translations}
            currentSlug={comparison.slug}
            comparisonTopic={comparison.comparison_topic}
          />
        </div>

        <article className="container mx-auto px-4 py-12 max-w-5xl">
          <SpeakableBox 
            answer={comparison.speakable_answer}
            optionA={comparison.option_a}
            optionB={comparison.option_b}
          />

          <TLDRSummary
            optionA={comparison.option_a}
            optionB={comparison.option_b}
            quickComparisonTable={quickComparisonTable}
          />

          <ComparisonFAQ faqs={qaEntities} />

          <ComparisonTable 
            data={quickComparisonTable}
            optionA={comparison.option_a}
            optionB={comparison.option_b}
          />

          <div className="grid lg:grid-cols-2 gap-6 mt-12">
            {comparison.option_a_overview && (
              <OptionCard 
                title={comparison.option_a}
                content={comparison.option_a_overview}
                variant="primary"
              />
            )}
            {comparison.option_b_overview && (
              <OptionCard 
                title={comparison.option_b}
                content={comparison.option_b_overview}
                variant="secondary"
              />
            )}
          </div>

          {comparison.side_by_side_breakdown && (
            <section className="mt-12">
              <button
                onClick={() => setShowFullBreakdown(!showFullBreakdown)}
                className="w-full flex items-center justify-between gap-3 p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Side-by-Side Breakdown</h2>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  showFullBreakdown && "rotate-180"
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                showFullBreakdown ? "max-h-[3000px] opacity-100 mt-4" : "max-h-0 opacity-0"
              )}>
                <div 
                  className="prose prose-lg max-w-none text-muted-foreground bg-muted/30 p-6 rounded-2xl border border-border/50
                    prose-headings:text-foreground prose-headings:font-semibold
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:my-4 prose-li:my-1
                    prose-p:my-3 prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(comparison.side_by_side_breakdown) }}
                />
              </div>
            </section>
          )}

          {comparison.use_case_scenarios && (
            <section className="mt-6">
              <button
                onClick={() => setShowUseCases(!showUseCases)}
                className="w-full flex items-center justify-between gap-3 p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">When to Choose Each Option</h2>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  showUseCases && "rotate-180"
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                showUseCases ? "max-h-[3000px] opacity-100 mt-4" : "max-h-0 opacity-0"
              )}>
                <div 
                  className="prose prose-lg max-w-none text-muted-foreground bg-muted/30 p-6 rounded-2xl border border-border/50
                    prose-headings:text-foreground prose-headings:font-semibold
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:my-4 prose-li:my-1
                    prose-p:my-3 prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(comparison.use_case_scenarios) }}
                />
              </div>
            </section>
          )}

          <CTASection 
            optionA={comparison.option_a}
            optionB={comparison.option_b}
            onChatClick={handleChatClick}
          />

          <VerdictSection verdict={comparison.final_verdict} />

          {comparison.internal_links && Array.isArray(comparison.internal_links) && comparison.internal_links.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Related Content
              </h3>
              <div className="flex flex-wrap gap-3">
                {(comparison.internal_links as Array<{ url: string; anchor: string }>).map((link, index) => (
                  <Link
                    key={index}
                    to={link.url}
                    className="px-4 py-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-full text-sm font-medium transition-colors"
                  >
                    {link.anchor}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
      
      <BlogEmmaChat language={comparison.language || 'en'} />
    </>
  );
}