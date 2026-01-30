import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MalformedUrl {
  id: string;
  url_path: string;
  created_at: string;
}

export interface LanguageMismatch {
  id: string;
  url_path: string;
  url_lang: string;
  content_type: string;
  slug: string;
  actual_language: string;
  correct_url: string;
}

export interface ConfirmedGoneUrl {
  id: string;
  url_path: string;
  reason: string | null;
  created_at: string;
}

export interface AnalysisSummary {
  total: number;
  malformed: number;
  languageMismatch: number;
  trulyMissing: number;
}

// Fetch summary counts
export function useNotFoundSummary() {
  return useQuery({
    queryKey: ["not-found-summary"],
    queryFn: async (): Promise<AnalysisSummary> => {
      // Total count
      const { count: total } = await supabase
        .from("gone_urls")
        .select("*", { count: "exact", head: true });

      // Malformed (date-appended) count
      const { data: malformedData } = await supabase
        .from("gone_urls")
        .select("id")
        .filter("url_path", "like", "%[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]");

      // Since Supabase doesn't support regex in filters, we fetch and filter client-side for accurate count
      const { data: allUrls } = await supabase
        .from("gone_urls")
        .select("url_path");

      const datePattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
      const malformedCount = allUrls?.filter(u => datePattern.test(u.url_path)).length || 0;

      // Language mismatch count - need to check against content tables
      // This is an approximation - the full query is done in the tab
      const languageMismatchCount = await countLanguageMismatches();

      const trulyMissing = (total || 0) - malformedCount - languageMismatchCount;

      return {
        total: total || 0,
        malformed: malformedCount,
        languageMismatch: languageMismatchCount,
        trulyMissing: Math.max(0, trulyMissing),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Helper to count language mismatches
async function countLanguageMismatches(): Promise<number> {
  // Get all gone URLs that look like blog/qa paths
  const { data: goneUrls } = await supabase
    .from("gone_urls")
    .select("id, url_path");

  if (!goneUrls || goneUrls.length === 0) return 0;

  // Parse URLs to extract language and slug
  const parsed = goneUrls
    .map(u => {
      const match = u.url_path.match(/^\/([a-z]{2})\/(blog|qa)\/(.+)$/);
      if (!match) return null;
      return {
        id: u.id,
        url_path: u.url_path,
        url_lang: match[1],
        content_type: match[2],
        slug: match[3],
      };
    })
    .filter(Boolean) as Array<{
      id: string;
      url_path: string;
      url_lang: string;
      content_type: string;
      slug: string;
    }>;

  if (parsed.length === 0) return 0;

  // Get all slugs from blog and qa tables
  const blogSlugs = parsed.filter(p => p.content_type === "blog").map(p => p.slug);
  const qaSlugs = parsed.filter(p => p.content_type === "qa").map(p => p.slug);

  let mismatchCount = 0;

  // Check blog articles
  if (blogSlugs.length > 0) {
    const { data: blogArticles } = await supabase
      .from("blog_articles")
      .select("slug, language")
      .in("slug", blogSlugs)
      .eq("status", "published");

    const blogMap = new Map(blogArticles?.map(a => [a.slug, a.language]) || []);
    
    for (const p of parsed.filter(p => p.content_type === "blog")) {
      const actualLang = blogMap.get(p.slug);
      if (actualLang && actualLang !== p.url_lang) {
        mismatchCount++;
      }
    }
  }

  // Check Q&A pages
  if (qaSlugs.length > 0) {
    const { data: qaPages } = await supabase
      .from("qa_pages")
      .select("slug, language")
      .in("slug", qaSlugs)
      .eq("status", "published");

    const qaMap = new Map(qaPages?.map(a => [a.slug, a.language]) || []);
    
    for (const p of parsed.filter(p => p.content_type === "qa")) {
      const actualLang = qaMap.get(p.slug);
      if (actualLang && actualLang !== p.url_lang) {
        mismatchCount++;
      }
    }
  }

  return mismatchCount;
}

// Fetch malformed URLs (date pattern)
export function useMalformedUrls() {
  return useQuery({
    queryKey: ["malformed-urls"],
    queryFn: async (): Promise<MalformedUrl[]> => {
      const { data } = await supabase
        .from("gone_urls")
        .select("id, url_path, created_at")
        .order("created_at", { ascending: false });

      const datePattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
      return (data || []).filter(u => datePattern.test(u.url_path));
    },
  });
}

// Fetch language mismatches
export function useLanguageMismatches() {
  return useQuery({
    queryKey: ["language-mismatches"],
    queryFn: async (): Promise<LanguageMismatch[]> => {
      const { data: goneUrls } = await supabase
        .from("gone_urls")
        .select("id, url_path");

      if (!goneUrls || goneUrls.length === 0) return [];

      const parsed = goneUrls
        .map(u => {
          const match = u.url_path.match(/^\/([a-z]{2})\/(blog|qa)\/(.+)$/);
          if (!match) return null;
          return {
            id: u.id,
            url_path: u.url_path,
            url_lang: match[1],
            content_type: match[2],
            slug: match[3],
          };
        })
        .filter(Boolean) as Array<{
          id: string;
          url_path: string;
          url_lang: string;
          content_type: string;
          slug: string;
        }>;

      if (parsed.length === 0) return [];

      const blogSlugs = parsed.filter(p => p.content_type === "blog").map(p => p.slug);
      const qaSlugs = parsed.filter(p => p.content_type === "qa").map(p => p.slug);

      const results: LanguageMismatch[] = [];

      // Check blog articles
      if (blogSlugs.length > 0) {
        const { data: blogArticles } = await supabase
          .from("blog_articles")
          .select("slug, language")
          .in("slug", blogSlugs)
          .eq("status", "published");

        const blogMap = new Map(blogArticles?.map(a => [a.slug, a.language]) || []);
        
        for (const p of parsed.filter(p => p.content_type === "blog")) {
          const actualLang = blogMap.get(p.slug);
          if (actualLang && actualLang !== p.url_lang) {
            results.push({
              ...p,
              actual_language: actualLang,
              correct_url: `/${actualLang}/blog/${p.slug}`,
            });
          }
        }
      }

      // Check Q&A pages
      if (qaSlugs.length > 0) {
        const { data: qaPages } = await supabase
          .from("qa_pages")
          .select("slug, language")
          .in("slug", qaSlugs)
          .eq("status", "published");

        const qaMap = new Map(qaPages?.map(a => [a.slug, a.language]) || []);
        
        for (const p of parsed.filter(p => p.content_type === "qa")) {
          const actualLang = qaMap.get(p.slug);
          if (actualLang && actualLang !== p.url_lang) {
            results.push({
              ...p,
              actual_language: actualLang,
              correct_url: `/${actualLang}/qa/${p.slug}`,
            });
          }
        }
      }

      return results;
    },
  });
}

// Fetch confirmed gone URLs (truly missing)
export function useConfirmedGoneUrls() {
  return useQuery({
    queryKey: ["confirmed-gone-urls"],
    queryFn: async (): Promise<ConfirmedGoneUrl[]> => {
      const { data: goneUrls } = await supabase
        .from("gone_urls")
        .select("id, url_path, reason, created_at")
        .order("created_at", { ascending: false });

      if (!goneUrls) return [];

      const datePattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
      
      // Get language mismatch IDs to exclude
      const parsed = goneUrls
        .map(u => {
          const match = u.url_path.match(/^\/([a-z]{2})\/(blog|qa)\/(.+)$/);
          if (!match) return null;
          return {
            id: u.id,
            url_lang: match[1],
            content_type: match[2],
            slug: match[3],
          };
        })
        .filter(Boolean) as Array<{
          id: string;
          url_lang: string;
          content_type: string;
          slug: string;
        }>;

      const blogSlugs = parsed.filter(p => p.content_type === "blog").map(p => p.slug);
      const qaSlugs = parsed.filter(p => p.content_type === "qa").map(p => p.slug);

      const mismatchIds = new Set<string>();

      if (blogSlugs.length > 0) {
        const { data: blogArticles } = await supabase
          .from("blog_articles")
          .select("slug, language")
          .in("slug", blogSlugs)
          .eq("status", "published");

        const blogMap = new Map(blogArticles?.map(a => [a.slug, a.language]) || []);
        
        for (const p of parsed.filter(p => p.content_type === "blog")) {
          const actualLang = blogMap.get(p.slug);
          if (actualLang && actualLang !== p.url_lang) {
            mismatchIds.add(p.id);
          }
        }
      }

      if (qaSlugs.length > 0) {
        const { data: qaPages } = await supabase
          .from("qa_pages")
          .select("slug, language")
          .in("slug", qaSlugs)
          .eq("status", "published");

        const qaMap = new Map(qaPages?.map(a => [a.slug, a.language]) || []);
        
        for (const p of parsed.filter(p => p.content_type === "qa")) {
          const actualLang = qaMap.get(p.slug);
          if (actualLang && actualLang !== p.url_lang) {
            mismatchIds.add(p.id);
          }
        }
      }

      // Filter out malformed and mismatches
      return goneUrls.filter(u => 
        !datePattern.test(u.url_path) && !mismatchIds.has(u.id)
      );
    },
  });
}

// Delete malformed URLs mutation
export function useDeleteMalformedUrls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const batchSize = 100;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const { error } = await supabase
          .from("gone_urls")
          .delete()
          .in("id", batch);
        if (error) throw error;
      }
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["not-found-summary"] });
      queryClient.invalidateQueries({ queryKey: ["malformed-urls"] });
      queryClient.invalidateQueries({ queryKey: ["gone-urls"] });
      queryClient.invalidateQueries({ queryKey: ["gone-urls-count"] });
      toast.success(`Deleted ${ids.length} malformed URLs`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete URLs: ${error.message}`);
    },
  });
}

// Delete language mismatch URLs mutation
export function useDeleteMismatchUrls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const batchSize = 100;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const { error } = await supabase
          .from("gone_urls")
          .delete()
          .in("id", batch);
        if (error) throw error;
      }
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["not-found-summary"] });
      queryClient.invalidateQueries({ queryKey: ["language-mismatches"] });
      queryClient.invalidateQueries({ queryKey: ["gone-urls"] });
      queryClient.invalidateQueries({ queryKey: ["gone-urls-count"] });
      toast.success(`Fixed ${ids.length} language mismatch URLs - they will now redirect properly`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to fix URLs: ${error.message}`);
    },
  });
}

// Delete single URL mutation
export function useDeleteGoneUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gone_urls")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["not-found-summary"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-gone-urls"] });
      queryClient.invalidateQueries({ queryKey: ["gone-urls"] });
      queryClient.invalidateQueries({ queryKey: ["gone-urls-count"] });
      toast.success("URL removed from 410 list");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete URL: ${error.message}`);
    },
  });
}

// Export URLs to CSV
export function exportUrlsToCsv(urls: Array<{ url_path: string; [key: string]: any }>, filename: string) {
  if (urls.length === 0) {
    toast.error("No URLs to export");
    return;
  }

  const csv = [
    "url_path",
    ...urls.map(u => `"${u.url_path}"`),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${urls.length} URLs`);
}
