import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MorphingBlob } from '@/components/philosophy/MorphingBlob';
import { useTranslation } from '@/i18n';

export const CSCTA: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).clientStories?.cta;

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 60%, hsl(160,48%,5%) 100%)' }}>
      <MorphingBlob className="absolute top-[-100px] right-[-80px] w-[400px] h-[400px] opacity-10" colors={['hsl(43,74%,49%)', 'hsl(160,48%,30%)']} morphSpeed={10000} />
      <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">{s?.headline || 'Start Your Success Story'}</h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">{s?.subtitle || 'Join 1,200+ families who have already secured their financial future with Everence Wealth.'}</p>
          <Button size="lg" className="bg-[hsl(43,74%,49%)] hover:bg-[hsl(43,74%,49%)]/90 text-[hsl(160,48%,12%)] font-semibold px-8 rounded-xl" onClick={() => window.dispatchEvent(new CustomEvent('openEmmaChat'))}>
            {s?.button || 'Get Your Free Consultation'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
