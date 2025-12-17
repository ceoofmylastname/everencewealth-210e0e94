import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronRight, Calendar, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { generateAllFAQSchemas } from '@/lib/faqPageSchemaGenerator';
import { Author, FAQEntity } from '@/types/blog';

const LANGUAGE_CODE_MAP: Record<string, string> = {
  en: 'en-GB',
  de: 'de-DE',
  nl: 'nl-NL',
  fr: 'fr-FR',
  pl: 'pl-PL',
  sv: 'sv-SE',
  da: 'da-DK',
  hu: 'hu-HU',
  fi: 'fi-FI',
  no: 'nb-NO',
};

const BASE_URL = 'https://www.delsolprimehomes.com';

export default function FAQPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: faqPage, isLoading, error } = useQuery({
    queryKey: ['faq-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq_pages')
        .select('*, authors!author_id(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch sibling translations
  const { data: siblings = [] } = useQuery({
    queryKey: ['faq-siblings', faqPage?.translations],
    queryFn: async () => {
      if (!faqPage?.translations || Object.keys(faqPage.translations).length === 0) {
        return [];
      }
      const slugs = Object.values(faqPage.translations) as string[];
      const { data } = await supabase
        .from('faq_pages')
        .select('slug, language, title')
        .in('slug', slugs)
        .eq('status', 'published');
      return data || [];
    },
    enabled: !!faqPage?.translations,
  });

  if (isLoading) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-64 w-full rounded-xl mb-8" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !faqPage) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">FAQ Not Found</h1>
            <p className="text-muted-foreground mb-8">The FAQ page you're looking for doesn't exist.</p>
            <Link to="/faq" className="text-primary hover:underline">
              Browse all FAQs
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const author: Author | null = faqPage.authors || null;
  const relatedFaqs: FAQEntity[] = (faqPage.related_faqs as unknown as FAQEntity[]) || [];
  const schemas = generateAllFAQSchemas(faqPage as any, author);
  const langCode = LANGUAGE_CODE_MAP[faqPage.language] || faqPage.language;

  return (
    <>
      <Helmet>
        <html lang={langCode} />
        <title>{faqPage.meta_title}</title>
        <meta name="description" content={faqPage.meta_description} />
        <link rel="canonical" href={`${BASE_URL}/faq/${faqPage.slug}`} />
        
        {/* Hreflang for translations */}
        <link rel="alternate" hrefLang={langCode} href={`${BASE_URL}/faq/${faqPage.slug}`} />
        {siblings.map((sibling: any) => (
          <link
            key={sibling.language}
            rel="alternate"
            hrefLang={LANGUAGE_CODE_MAP[sibling.language] || sibling.language}
            href={`${BASE_URL}/faq/${sibling.slug}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/faq/${faqPage.slug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={faqPage.meta_title} />
        <meta property="og:description" content={faqPage.meta_description} />
        <meta property="og:url" content={`${BASE_URL}/faq/${faqPage.slug}`} />
        <meta property="og:type" content="article" />
        {faqPage.featured_image_url && (
          <meta property="og:image" content={faqPage.featured_image_url} />
        )}

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(schemas)}</script>
      </Helmet>

      <Header variant="solid" />

      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Hero Image */}
        {faqPage.featured_image_url && (
          <div className="relative h-64 md:h-80 overflow-hidden mb-8">
            <img
              src={faqPage.featured_image_url}
              alt={faqPage.featured_image_alt || faqPage.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/faq" className="hover:text-primary">FAQ</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground truncate">{faqPage.title}</span>
          </nav>

          {/* Type and Language Badges */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={faqPage.faq_type === 'core' ? 'default' : 'secondary'}>
              {faqPage.faq_type === 'core' ? 'Guide' : 'Tips & Advice'}
            </Badge>
            <Badge variant="outline">{faqPage.language.toUpperCase()}</Badge>
          </div>

          {/* Main Question (H1) */}
          <h1 className="faq-question-main text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            {faqPage.question_main}
          </h1>

          {/* Speakable Answer Box */}
          <Card className="mb-8 border-l-4 border-l-primary bg-primary/5">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-primary mb-2">Quick Answer</p>
              <p className="speakable-answer text-foreground leading-relaxed">
                {faqPage.speakable_answer}
              </p>
            </CardContent>
          </Card>

          {/* Author Attribution */}
          {author && (
            <div className="flex items-center gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
              {author.photo_url && (
                <img
                  src={author.photo_url}
                  alt={author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium text-foreground">{author.name}</p>
                <p className="text-sm text-muted-foreground">{author.job_title}</p>
              </div>
              <div className="ml-auto flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(faqPage.updated_at), 'MMMM d, yyyy')}
              </div>
            </div>
          )}

          {/* Main Answer */}
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: faqPage.answer_main }}
          />

          {/* Related FAQs */}
          {relatedFaqs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-display font-semibold mb-4">Related Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {relatedFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Source Article Link */}
          {faqPage.source_article_slug && (
            <Card className="mb-12">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">This FAQ is based on:</p>
                <Link
                  to={`/blog/${faqPage.source_article_slug}`}
                  className="flex items-center text-primary hover:underline font-medium"
                >
                  Read the full article
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Language Switcher */}
          {siblings.length > 0 && (
            <div className="border-t pt-8">
              <p className="text-sm text-muted-foreground mb-3">This FAQ is also available in:</p>
              <div className="flex flex-wrap gap-2">
                {siblings
                  .filter((s: any) => s.slug !== faqPage.slug)
                  .map((sibling: any) => (
                    <Link
                      key={sibling.slug}
                      to={`/faq/${sibling.slug}`}
                      className="inline-flex items-center px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors"
                    >
                      {sibling.language.toUpperCase()}
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
