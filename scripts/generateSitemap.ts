import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Database } from '../src/integrations/supabase/types';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

const langToHreflang: Record<string, string> = {
  en: 'en-GB',
  de: 'de-DE',
  nl: 'nl-NL',
  fr: 'fr-FR',
  pl: 'pl-PL',
  sv: 'sv-SE',
  da: 'da-DK',
  hu: 'hu-HU',
  fi: 'fi-FI',
  no: 'nb-NO'
};

interface ArticleData {
  slug: string;
  language: string;
  date_modified?: string;
  date_published?: string;
  translations: Record<string, string>;
  featured_image_url?: string;
  featured_image_alt?: string;
  featured_image_caption?: string;
}

function generateSitemapXML(articles: ArticleData[]): string {
  const baseUrl = 'https://delsolprimehomes.com';
  
  const urlEntries = articles.map(article => {
    const articleUrl = `${baseUrl}/${article.language}/${article.slug}`;
    const lastmod = article.date_modified || article.date_published || new Date().toISOString();
    
    // Build hreflang alternates
    const alternates: string[] = [];
    
    // Self-reference
    const currentLangCode = langToHreflang[article.language] || article.language;
    alternates.push(
      `    <xhtml:link rel="alternate" hreflang="${currentLangCode}" href="${articleUrl}"/>`
    );
    
    // Translations
    if (article.translations && typeof article.translations === 'object') {
      Object.entries(article.translations).forEach(([lang, slug]) => {
        if (slug && typeof slug === 'string' && lang !== article.language) {
          const langCode = langToHreflang[lang] || lang;
          alternates.push(
            `    <xhtml:link rel="alternate" hreflang="${langCode}" href="${baseUrl}/${lang}/${slug}"/>`
          );
        }
      });
    }
    
    // x-default (point to English if exists, otherwise current page)
    const xDefaultLang = article.translations?.en ? 'en' : article.language;
    const xDefaultSlug = article.translations?.en || article.slug;
    alternates.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/${xDefaultLang}/${xDefaultSlug}"/>`
    );
    
    // Build image tags if available
    const imageTag = article.featured_image_url ? `
    <image:image>
      <image:loc>${article.featured_image_url}</image:loc>
      <image:title>${escapeXml(article.featured_image_alt || '')}</image:title>
      ${article.featured_image_caption ? `<image:caption>${escapeXml(article.featured_image_caption)}</image:caption>` : ''}
    </image:image>` : '';
    
    return `  <url>
    <loc>${articleUrl}</loc>
    <lastmod>${lastmod.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${alternates.join('\n')}${imageTag}
  </url>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateSitemap(outputPath: string) {
  console.log('🗺️  Starting sitemap generation...');
  
  try {
    // Fetch all published articles with translations
    const { data: articles, error } = await supabase
      .from('blog_articles')
      .select('slug, language, date_modified, date_published, translations, featured_image_url, featured_image_alt, featured_image_caption')
      .eq('status', 'published')
      .order('date_published', { ascending: false });

    if (error) {
      console.error('❌ Error fetching articles:', error);
      return;
    }

    if (!articles || articles.length === 0) {
      console.log('⚠️  No published articles found');
      return;
    }

    console.log(`📝 Found ${articles.length} published articles`);

    const sitemapXML = generateSitemapXML(articles as ArticleData[]);
    
    const filePath = resolve(outputPath, 'sitemap.xml');
    writeFileSync(filePath, sitemapXML, 'utf-8');
    
    console.log(`✅ Sitemap generated at ${filePath}`);
    console.log(`   Total URLs: ${articles.length}`);
    
    // Calculate hreflang coverage
    const withTranslations = articles.filter(a => 
      a.translations && Object.keys(a.translations).length > 0
    ).length;
    console.log(`   Articles with translations: ${withTranslations}/${articles.length}`);
    
  } catch (err) {
    console.error('❌ Sitemap generation failed:', err);
    throw err;
  }
}

// Allow direct execution
if (import.meta.main) {
  const outputPath = process.argv[2] || './public';
  await generateSitemap(outputPath);
}
