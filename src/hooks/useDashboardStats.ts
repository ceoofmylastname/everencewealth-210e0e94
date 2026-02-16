import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ArticleStats {
  draft: number;
  published: number;
  archived: number;
  tofu: number;
  mofu: number;
  bofu: number;
  total: number;
}

interface LanguageStats {
  [key: string]: number;
}

export const useDashboardStats = () => {
  // Accurate COUNT queries for article stats
  const { data: articleStats, isLoading: isLoadingArticles, error: articlesError } = useQuery({
    queryKey: ["dashboard-article-counts"],
    queryFn: async (): Promise<ArticleStats> => {
      const [draftCount, publishedCount, archivedCount, tofuCount, mofuCount, bofuCount] = await Promise.all([
        supabase.from("blog_articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("blog_articles").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("blog_articles").select("id", { count: "exact", head: true }).eq("status", "archived"),
        supabase.from("blog_articles").select("id", { count: "exact", head: true }).eq("funnel_stage", "TOFU"),
        supabase.from("blog_articles").select("id", { count: "exact", head: true }).eq("funnel_stage", "MOFU"),
        supabase.from("blog_articles").select("id", { count: "exact", head: true }).eq("funnel_stage", "BOFU"),
      ]);

      return {
        draft: draftCount.count || 0,
        published: publishedCount.count || 0,
        archived: archivedCount.count || 0,
        tofu: tofuCount.count || 0,
        mofu: mofuCount.count || 0,
        bofu: bofuCount.count || 0,
        total: (draftCount.count || 0) + (publishedCount.count || 0) + (archivedCount.count || 0),
      };
    },
  });

  // Accurate COUNT queries for language distribution
  const { data: languageStats, isLoading: isLoadingLanguages } = useQuery({
    queryKey: ["dashboard-language-counts"],
    queryFn: async (): Promise<LanguageStats> => {
      const languages = ['en', 'es'];
      const counts = await Promise.all(
        languages.map(async (lang) => {
          const { count } = await supabase
            .from("blog_articles")
            .select("id", { count: "exact", head: true })
            .eq("language", lang);
          return { lang, count: count || 0 };
        })
      );
      return counts.reduce((acc, { lang, count }) => {
        acc[lang] = count;
        return acc;
      }, {} as LanguageStats);
    },
  });

  // Internal linking stats (already uses efficient queries)
  const { data: linkingStats } = useQuery({
    queryKey: ["linking-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_articles")
        .select("id, language, internal_links, status")
        .eq("status", "published");
      
      const needsLinks = data?.filter((a: any) => 
        !a.internal_links || 
        (Array.isArray(a.internal_links) && a.internal_links.length < 5)
      ) || [];
      
      return {
        total: needsLinks.length,
        byLanguage: needsLinks.reduce((acc: Record<string, number>, a: any) => {
          acc[a.language] = (acc[a.language] || 0) + 1;
          return acc;
        }, {})
      };
    }
  });

  // Image health stats
  const { data: imageHealthStats } = useQuery({
    queryKey: ["image-health-stats"],
    queryFn: async () => {
      const { count: issuesCount } = await supabase
        .from("article_image_issues")
        .select("*", { count: "exact", head: true })
        .is("resolved_at", null);
      
      const { count: fixedCount } = await supabase
        .from("article_image_issues")
        .select("*", { count: "exact", head: true })
        .not("resolved_at", "is", null);
      
      return { issues: issuesCount || 0, fixed: fixedCount || 0 };
    }
  });

  // Schema health - sample first 1000 articles (reasonable for dashboard overview)
  const { data: schemaHealthStats } = useQuery({
    queryKey: ["schema-health-sample"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_articles")
        .select("meta_title, meta_description, featured_image_url, featured_image_alt, author_id")
        .eq("status", "published")
        .limit(1000);
      
      if (!data) return { valid: 0, needsAttention: 0, sampleSize: 0 };
      
      // Simple schema validation: check for required fields
      let valid = 0;
      let needsAttention = 0;
      
      data.forEach(article => {
        const hasRequiredFields = 
          article.meta_title && 
          article.meta_description && 
          article.featured_image_url && 
          article.featured_image_alt;
        
        if (hasRequiredFields) {
          valid++;
        } else {
          needsAttention++;
        }
      });
      
      return { valid, needsAttention, sampleSize: data.length };
    }
  });

  return {
    articleStats,
    languageStats,
    linkingStats,
    imageHealthStats,
    schemaHealthStats,
    isLoading: isLoadingArticles || isLoadingLanguages,
    error: articlesError,
  };
};
