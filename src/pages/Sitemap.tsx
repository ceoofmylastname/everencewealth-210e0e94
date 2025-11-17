import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Sitemap = () => {
  const { data: articles } = useQuery({
    queryKey: ["sitemap-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("slug, date_modified, date_published, language, translations")
        .eq("status", "published")
        .order("date_modified", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (articles) {
      const baseUrl = "https://delsolprimehomes.com";
      
      const langToHreflang: Record<string, string> = {
        en: 'en-GB', es: 'es-ES', de: 'de-DE', nl: 'nl-NL',
        fr: 'fr-FR', pl: 'pl-PL', sv: 'sv-SE', da: 'da-DK', hu: 'hu-HU',
      };
      
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en-GB" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/" />
  </url>
  
  <!-- Blog Index -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en-GB" href="${baseUrl}/blog" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/blog" />
  </url>
  
  <!-- Blog Articles -->
${articles.map(article => {
  const lastmod = article.date_modified || article.date_published || new Date().toISOString();
  const currentUrl = `${baseUrl}/blog/${article.slug}`;
  const currentLangCode = langToHreflang[article.language] || article.language;
  
  // Build hreflang links
  let hreflangLinks = `    <xhtml:link rel="alternate" hreflang="${currentLangCode}" href="${currentUrl}" />`;
  
  // Add translations
  if (article.translations && typeof article.translations === 'object') {
    const translationsObj = article.translations as Record<string, unknown>;
    Object.entries(translationsObj).forEach(([lang, slug]) => {
      if (slug && typeof slug === 'string' && lang !== article.language) {
        const langCode = langToHreflang[lang] || lang;
        hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="${langCode}" href="${baseUrl}/blog/${slug}" />`;
      }
    });
  }
  
  // Add x-default
  const translationsObj = article.translations as Record<string, unknown> | null;
  const xDefaultUrl = (translationsObj?.en && typeof translationsObj.en === 'string') 
    ? `${baseUrl}/blog/${translationsObj.en}` 
    : currentUrl;
  hreflangLinks += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`;
  
  return `  <url>
    <loc>${currentUrl}</loc>
    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${hreflangLinks}
  </url>`;
}).join('\n')}
  
</urlset>`;

      // Copy sitemap to clipboard
      navigator.clipboard.writeText(sitemap);
      
      // Trigger download
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [articles]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Sitemap Generated</h1>
      <p className="text-muted-foreground mb-4">
        The sitemap has been copied to your clipboard and downloaded as sitemap.xml
      </p>
      <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
        <pre className="text-xs">
          {articles && `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${articles.length} published articles included
</urlset>`}
        </pre>
      </div>
    </div>
  );
};

export default Sitemap;
