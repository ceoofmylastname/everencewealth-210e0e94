import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useTranslation } from '@/i18n';

export const CSFeaturedStory: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).clientStories?.featured;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 100%)' }}>
            <div className="p-8 md:p-12">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 border" style={{ borderColor: 'hsl(43,74%,49%,0.4)', color: 'hsl(43,74%,49%)' }}>
                {s?.badge || 'Featured Story'}
              </span>
              <Quote className="w-10 h-10 text-[hsl(43,74%,49%)] mb-4 opacity-60" />
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 italic">
                {s?.quote || '"We were paying over $12,000 a year in hidden fees on our 401(k). Everence helped us restructure into an IUL strategy that eliminated those fees and gave us tax-free retirement income. In just 3 years, our projected retirement income increased by 40%."'}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[hsl(43,74%,49%)]/20 flex items-center justify-center text-[hsl(43,74%,49%)] font-bold text-lg">
                  {s?.initials || 'JM'}
                </div>
                <div>
                  <p className="text-white font-semibold">{s?.name || 'James & Maria T.'}</p>
                  <p className="text-white/60 text-sm">{s?.role || 'Business Owners, California'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/10">
                {(s?.results || [
                  { label: 'Fee Savings', value: '$12K/yr' },
                  { label: 'Income Increase', value: '+40%' },
                  { label: 'Tax Savings', value: '$180K' },
                ]).map((r: any, i: number) => (
                  <div key={i}>
                    <p className="text-2xl font-bold text-[hsl(43,74%,49%)]">{r.value}</p>
                    <p className="text-white/60 text-sm">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
