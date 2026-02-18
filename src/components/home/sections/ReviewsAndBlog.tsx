import React from 'react';
import { Link } from 'react-router-dom';
import { Section } from '../ui/Section';
import { Button } from '../ui/Button';
import { Star, ArrowRight, Book, Scale, Home, Laptop } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { ElfsightGoogleReviews } from '@/components/reviews/ElfsightGoogleReviews';
import type { Locale } from 'date-fns';
import { motion } from 'framer-motion';
import { ScrollReveal, staggerContainer, staggerItem } from '@/components/homepage/ScrollReveal';

const dateLocales: Record<string, Locale> = {
  en: enUS, es
};

export const Reviews: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  
  return (
    <Section className="bg-slate-50 relative">
      <ScrollReveal className="text-center mb-16">
        <h2 className="text-4xl font-serif font-bold text-prime-900 mb-6">{t.reviews.headline}</h2>
        <div className="flex justify-center gap-1 mb-4">
          {[1,2,3,4,5].map(i => <Star key={i} size={28} className="fill-prime-gold text-prime-gold" />)}
        </div>
        <p className="text-slate-500 font-medium">{t.reviews.description}</p>
      </ScrollReveal>

      <ScrollReveal>
        <ElfsightGoogleReviews language={currentLanguage} className="max-w-4xl mx-auto mb-10" />
      </ScrollReveal>

      <ScrollReveal className="text-center">
        <a href="https://www.google.com/maps/place/Everence+Wealth" target="_blank" rel="noopener noreferrer">
          <Button variant="outline">{t.reviews.cta}</Button>
        </a>
      </ScrollReveal>
    </Section>
  );
};

export const BlogTeaser: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  
  const { data: articles, isLoading } = useQuery({
    queryKey: ['homepage-blog-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('id, slug, headline, meta_description, featured_image_url, date_published')
        .eq('status', 'published')
        .eq('language', 'en')
        .order('date_published', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy', {
        locale: dateLocales[currentLanguage] || enUS
      });
    } catch {
      return '';
    }
  };
  
  return (
    <Section background="white">
      <ScrollReveal>
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <span className="text-prime-gold font-bold uppercase tracking-widest text-xs mb-3 block">{t.blogTeaser.eyebrow}</span>
            <h2 className="text-4xl font-serif font-bold text-prime-900 mb-4">{t.blogTeaser.headline}</h2>
            <p className="text-slate-600 font-light text-lg max-w-2xl">{t.blogTeaser.description}</p>
          </div>
          <Link to={`/${currentLanguage}/blog`} className="hidden md:flex">
            <Button variant="ghost" className="text-prime-gold font-bold group">
              {t.blogTeaser.cta} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </ScrollReveal>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {isLoading ? (
          [1, 2, 3].map((idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
              <div className="h-56 bg-slate-200" />
              <div className="p-8">
                <div className="h-6 bg-slate-200 rounded mb-4" />
                <div className="h-4 bg-slate-100 rounded mb-2" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : articles && articles.length > 0 ? (
          articles.map((article) => (
            <motion.article key={article.id} variants={staggerItem} className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col h-full group">
              <div className="h-56 overflow-hidden relative">
                <img src={article.featured_image_url} alt={article.headline} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-prime-900 uppercase tracking-wider shadow-sm">
                  {formatDate(article.date_published)}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-prime-900 mb-4 group-hover:text-prime-gold transition-colors cursor-pointer leading-tight">{article.headline}</h3>
                <p className="text-slate-600 text-sm mb-6 flex-1 font-light leading-relaxed line-clamp-3" style={{ lineHeight: '1.75' }}>{article.meta_description}</p>
                <Link to={`/${currentLanguage}/blog/${article.slug}`} className="text-prime-900 font-bold text-sm hover:text-prime-gold transition-colors mt-auto flex items-center gap-2 group/link">
                  {t.blogTeaser.readArticle} <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.article>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-slate-500">No articles available yet.</div>
        )}
      </motion.div>
      
      <ScrollReveal className="mt-12 md:hidden text-center">
        <Link to={`/${currentLanguage}/blog`}>
          <Button variant="ghost" className="text-prime-gold font-bold">{t.blogTeaser.cta}</Button>
        </Link>
      </ScrollReveal>
    </Section>
  );
};

const FEATURED_TERMS = [
  { term: "IUL", icon: Scale, key: "nie" as const },
  { term: "Fiduciary", icon: Laptop, key: "digitalNomadVisa" as const },
  { term: "Annuity", icon: Home, key: "ibi" as const },
  { term: "RMD", icon: Book, key: "escritura" as const },
];

export const GlossaryTeaser: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  
  return (
    <Section background="light" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-prime-100/50 via-transparent to-transparent" />
      
      <div className="relative z-10">
        <ScrollReveal className="text-center mb-16">
          <span className="text-prime-gold font-bold uppercase tracking-widest text-xs mb-3 block">
            {t.glossaryTeaser?.eyebrow || "Essential Terms"}
          </span>
          <h2 className="text-4xl font-serif font-bold text-prime-900 mb-4">
            {t.glossaryTeaser?.headline || "Understand Financial Terminology"}
          </h2>
          <p className="text-slate-600 font-light text-lg max-w-2xl mx-auto">
            {t.glossaryTeaser?.description || "Navigate wealth planning with confidence. Our glossary explains key financial terms, tax strategies, and everything you need to know."}
          </p>
        </ScrollReveal>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {FEATURED_TERMS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.term} variants={staggerItem}>
                <Link 
                  to={`/${currentLanguage}/glossary#${item.term.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 block"
                >
                  <div className="w-12 h-12 rounded-xl bg-prime-50 flex items-center justify-center mb-4 group-hover:bg-prime-gold group-hover:text-white transition-colors duration-300">
                    <Icon size={24} className="text-prime-gold group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-prime-900 mb-2 group-hover:text-prime-gold transition-colors">{item.term}</h3>
                  <p className="text-slate-600 text-sm font-light leading-relaxed">{t.glossaryTeaser?.terms?.[item.key] || ""}</p>
                  <div className="mt-4 flex items-center gap-1 text-prime-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.glossaryTeaser?.learnMore || "Learn more"} <ArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <ScrollReveal className="text-center">
          <Link to={`/${currentLanguage}/glossary`}>
            <Button variant="primary" size="lg" className="group">
              {t.glossaryTeaser?.cta || "Explore Full Glossary"} 
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </Section>
  );
};
