import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal, staggerContainer, staggerItem } from './ScrollReveal';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/i18n/useTranslation';

export const BlogPreview: React.FC = () => {
  const { t } = useTranslation();
  const bp = t.homepage.blogPreview;

  const { data: articles, isLoading } = useQuery({
    queryKey: ['homepage-blog-preview-en'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('id, slug, headline, meta_description, featured_image_url, featured_image_alt, date_published, language, category')
        .eq('status', 'published')
        .eq('language', 'en')
        .order('date_published', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-white">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block text-xs tracking-[0.3em] uppercase font-semibold mb-4" style={{ color: '#C5A059' }}>
              {bp.badge}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
              {bp.headline}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
              {bp.subtitle}
            </p>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden bg-card">
                <Skeleton className="h-52 w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {articles.map((article) => (
              <motion.div key={article.id} variants={staggerItem}>
                <Link
                  to={`/${article.language || 'en'}/blog/${article.slug}`}
                  className="group block rounded-2xl border border-border overflow-hidden bg-card shadow-sm transition-all duration-500 hover:border-border hover:shadow-lg"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={article.featured_image_url}
                      alt={article.featured_image_alt || article.headline}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {article.date_published && (
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-md bg-black/30 border border-white/10">
                        {format(new Date(article.date_published), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-muted-foreground mb-2 block">
                      {article.category}
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-foreground leading-snug mb-3 transition-colors duration-300 group-hover:text-[#C5A059]">
                      {article.headline}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
                      {article.meta_description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase transition-colors duration-300" style={{ color: '#C5A059' }}>
                      {bp.readMore}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground text-sm">{bp.noArticles}</p>
        )}

        <ScrollReveal delay={0.3}>
          <div className="text-center mt-14">
            <Link
              to="/en/blog"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide uppercase border transition-all duration-300 hover:scale-105"
              style={{ color: '#C5A059', borderColor: 'rgba(197,160,89,0.4)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(197,160,89,0.1)';
                e.currentTarget.style.borderColor = 'rgba(197,160,89,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(197,160,89,0.4)';
              }}
            >
              {bp.viewAll}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
