import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { AboutHero } from "@/components/about/AboutHero";
import { MissionStatement } from "@/components/about/MissionStatement";
import { OurStory } from "@/components/about/OurStory";
import { FounderProfiles } from "@/components/about/FounderProfiles";
import { WhyChooseUs } from "@/components/about/WhyChooseUs";
import { Credentials } from "@/components/about/Credentials";
import { AboutFAQ } from "@/components/about/AboutFAQ";
import { AboutCTA } from "@/components/about/AboutCTA";
import { type AboutPageContent } from "@/lib/aboutSchemaGenerator";
import { COMPANY_FACTS } from "@/constants/company";
import BlogEmmaChat from '@/components/blog-article/BlogEmmaChat';
import { useTranslation } from "@/i18n";

const BASE_URL = "https://www.everencewealth.com";

const defaultContent: AboutPageContent = {
  meta_title: "About Everence Wealth | Independent Fiduciary Wealth Architects",
  meta_description: `Meet the founders of Everence Wealth. ${COMPANY_FACTS.yearsExperience}+ years experience helping families build tax-efficient retirement strategies and asset protection plans.`,
  canonical_url: `${BASE_URL}/about`,
  speakable_summary: `Everence Wealth is an independent fiduciary wealth management firm, founded by experienced professionals with over ${COMPANY_FACTS.yearsExperience} years of combined experience helping families secure their financial future.`,
  hero_headline: "Your Trusted Fiduciary Wealth Architects",
  hero_subheadline: `Three founders, ${COMPANY_FACTS.yearsExperience}+ years of expertise, and one mission: building tax-efficient wealth strategies that protect what matters most.`,
  mission_statement: "We believe everyone deserves fiduciary guidance when making critical financial decisions. Our mission is to provide transparent, personalized wealth strategies that put your interests first.",
  years_in_business: COMPANY_FACTS.yearsExperience,
  properties_sold: COMPANY_FACTS.propertiesSold,
  client_satisfaction_percent: COMPANY_FACTS.clientSatisfaction,
  faq_entities: [],
  citations: [],
  founders: [],
  language: "en"
};

const About = () => {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const aboutUs = t.aboutUs as Record<string, unknown> | undefined;
  const credentialsFromI18n = (aboutUs?.credentials as { items?: Array<{ name: string; description: string }> })?.items || [];

  const { data: content, isLoading } = useQuery({
    queryKey: ["about-page-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_page_content")
        .select("*")
        .eq("slug", "main")
        .maybeSingle();

      if (error) {
        console.error("Error fetching about content:", error);
        return null;
      }
      return data;
    }
  });

  const pageContent: AboutPageContent = content
    ? {
        meta_title: content.meta_title,
        meta_description: content.meta_description,
        canonical_url: content.canonical_url || `${BASE_URL}/about`,
        speakable_summary: content.speakable_summary,
        hero_headline: content.hero_headline,
        hero_subheadline: content.hero_subheadline,
        mission_statement: content.mission_statement,
        years_in_business: content.years_in_business || COMPANY_FACTS.yearsExperience,
        properties_sold: content.properties_sold || COMPANY_FACTS.propertiesSold,
        client_satisfaction_percent: content.client_satisfaction_percent || COMPANY_FACTS.clientSatisfaction,
        faq_entities: (content.faq_entities as unknown as AboutPageContent["faq_entities"]) || [],
        citations: (content.citations as unknown as AboutPageContent["citations"]) || [],
        founders: ((content.founders as unknown as Array<{ linkedin?: string; linkedin_url?: string; [key: string]: unknown }>) || []).map(f => ({
          ...f,
          linkedin_url: f.linkedin_url || f.linkedin || ""
        })) as AboutPageContent["founders"],
        language: content.language || "en"
      }
    : defaultContent;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-2 md:mx-4 lg:mx-6 space-y-4 md:space-y-6 py-4 md:py-6">
          <div className="rounded-3xl overflow-hidden">
            <AboutHero
              headline={pageContent.hero_headline}
              subheadline={pageContent.hero_subheadline}
              yearsInBusiness={pageContent.years_in_business}
              propertiesSold={pageContent.properties_sold}
              clientSatisfaction={pageContent.client_satisfaction_percent}
            />
          </div>

          <div className="rounded-3xl overflow-hidden">
            <MissionStatement
              mission={pageContent.mission_statement}
              speakableSummary={pageContent.speakable_summary}
            />
          </div>

          {content?.our_story_content && (
            <div className="rounded-3xl overflow-hidden">
              <OurStory content={content.our_story_content} />
            </div>
          )}

          <div className="rounded-3xl overflow-hidden">
            <FounderProfiles founders={pageContent.founders} />
          </div>

          {content?.why_choose_us_content && (
            <div className="rounded-3xl overflow-hidden">
              <WhyChooseUs content={content.why_choose_us_content} />
            </div>
          )}

          <div className="rounded-3xl overflow-hidden">
            <Credentials
              credentials={credentialsFromI18n.length > 0 ? credentialsFromI18n.map((item, index) => ({
                name: item.name,
                description: item.description,
                icon: ["shield-check", "award", "file-check", "lock"][index] || "shield-check"
              })) : []}
              citations={pageContent.citations}
            />
          </div>

          <div className="rounded-3xl overflow-hidden">
            <AboutFAQ faqs={pageContent.faq_entities} />
          </div>

          <div className="rounded-3xl overflow-hidden">
            <AboutCTA />
          </div>
        </main>

        <Footer />
        <BlogEmmaChat language={lang} />
      </div>
    </>
  );
};

export default About;
