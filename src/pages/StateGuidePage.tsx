import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import NotFound from "@/pages/NotFound";
import { LocationHero } from "@/components/location/LocationHero";
import { SpeakableBox } from "@/components/location/SpeakableBox";
import { BestAreasSection } from "@/components/location/BestAreasSection";
import { CostBreakdownSection } from "@/components/location/CostBreakdownSection";
import { LocationFAQSection } from "@/components/location/LocationFAQSection";
import { UseCaseSection } from "@/components/location/UseCaseSection";
import { LocationCTASection } from "@/components/location/LocationCTASection";
import { StickyMobileCTA } from "@/components/blog-article/StickyMobileCTA";
import BlogEmmaChat from "@/components/blog-article/BlogEmmaChat";
import { TrendingUp, Building, Info } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import {
  type LocationPage as LocationPageType,
  type BestArea,
  type CostItem,
  type QAEntity,
} from "@/lib/locationSchemaGenerator";

const StateGuidePage = () => {
  const { topicSlug, lang = "en" } = useParams<{ topicSlug: string; lang: string }>();
  const { t } = useTranslation();

  const replaceCity = (template: string, city: string) =>
    template.replace("{city}", city);

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["state-guide-page", topicSlug, lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("location_pages")
        .select(`
          *,
          author:authors!location_pages_author_id_fkey(*),
          reviewer:authors!location_pages_reviewer_id_fkey(*)
        `)
        .eq("topic_slug", topicSlug)
        .eq("language", lang)
        .eq("status", "published")
        .not("state_code", "is", null)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!page) return <NotFound />;

  const bestAreas = (page.best_areas as unknown as BestArea[]) || [];
  const costBreakdown = (page.cost_breakdown as unknown as CostItem[]) || [];
  const qaEntities = (page.qa_entities as unknown as QAEntity[]) || [];

  return (
    <>
      <Header
        variant="solid"
        contentContext={{
          type: "location",
          hreflangGroupId: page.hreflang_group_id,
          currentSlug: page.topic_slug,
          currentLanguage: page.language || "en",
        }}
      />

      <main className="min-h-screen">
        <LocationHero
          headline={page.headline}
          cityName={page.city_name}
          citySlug={page.city_slug}
          topicSlug={page.topic_slug}
          featuredImageUrl={page.featured_image_url}
          featuredImageAlt={page.featured_image_alt}
          featuredImageCaption={(page as any).featured_image_caption}
          currentLanguage={page.language || "en"}
        />

        <div className="container mx-auto px-4 py-12 md:py-16 space-y-12 md:space-y-16">
          <SpeakableBox content={page.speakable_answer} />

          {page.location_overview && (
            <section className="relative animate-fade-in">
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10">
                  <Info className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {replaceCity(t.locationGuides?.aboutCity || "About {city}", page.city_name)}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {t.locationGuides?.localInsights || "Local insights and overview"}
                  </p>
                </div>
              </div>
              <div
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-muted-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: page.location_overview }}
              />
            </section>
          )}

          {page.market_breakdown && (
            <section className="relative animate-fade-in">
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {t.locationGuides?.marketOverview || "Market Overview"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {t.locationGuides?.marketTrends || "Current trends and pricing data"}
                  </p>
                </div>
              </div>
              <div
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-muted-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: page.market_breakdown }}
              />
            </section>
          )}

          <BestAreasSection areas={bestAreas} cityName={page.city_name} />
          <CostBreakdownSection costs={costBreakdown} cityName={page.city_name} />
          <UseCaseSection content={page.use_cases || ""} cityName={page.city_name} />

          {page.final_summary && (
            <section className="relative py-12 md:py-16 animate-fade-in">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {t.locationGuides?.summaryRecommendations || "Summary & Recommendations"}
                  </h2>
                </div>
              </div>
              <div
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-muted-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: page.final_summary }}
              />
            </section>
          )}

          <LocationFAQSection faqs={qaEntities} cityName={page.city_name} />
        </div>

        <LocationCTASection
          cityName={page.city_name}
          topicName={page.headline}
          language={page.language || "en"}
        />
      </main>

      <Footer />
      <StickyMobileCTA />
      <BlogEmmaChat language={page.language || "en"} />
    </>
  );
};

export default StateGuidePage;
