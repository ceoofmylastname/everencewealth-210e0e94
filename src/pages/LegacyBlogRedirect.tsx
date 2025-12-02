import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * LegacyBlogRedirect handles 301 redirects from old /blog/{slug} URLs
 * to new /{lang}/{slug} structure.
 */
const LegacyBlogRedirect = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["redirect-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("slug, language")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    // If article found, perform 301 redirect via window.location
    if (article && !isLoading) {
      const newUrl = `/${article.language}/${article.slug}`;
      window.location.replace(newUrl);
    }
  }, [article, isLoading]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  // Fallback Navigate in case window.location.replace doesn't work
  return <Navigate to={`/${article.language}/${article.slug}`} replace />;
};

export default LegacyBlogRedirect;
