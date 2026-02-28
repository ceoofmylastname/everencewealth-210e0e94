import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, TrendingUp } from 'lucide-react';
import { MorphingBlob } from '@/components/philosophy/MorphingBlob';
import { StatBadge } from '@/components/strategies/shared/StatBadge';
import { useTranslation } from '@/i18n';

export const CSHero: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).clientStories?.hero;

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 60%, hsl(160,48%,5%) 100%)' }}>
      <MorphingBlob className="absolute top-[-150px] right-[-100px] w-[600px] h-[600px] opacity-20" colors={['hsl(160,48%,30%)', 'hsl(43,74%,49%)']} morphSpeed={10000} />
      <MorphingBlob className="absolute bottom-[-200px] left-[-150px] w-[500px] h-[500px] opacity-10" colors={['hsl(160,48%,25%)', 'hsl(160,48%,35%)']} morphSpeed={12000} />

      <div className="container max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8 }} className="w-16 h-0.5 mx-auto mb-6" style={{ background: 'hsl(43,74%,49%)' }} />
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 border" style={{ borderColor: 'hsl(43,74%,49%,0.4)', color: 'hsl(43,74%,49%)' }}>
          {s?.badge || 'Client Success'}
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-5 tracking-tight">
          {s?.title || 'Real Stories. Real Results.'}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto">
          {s?.subtitle || 'See how families across America have transformed their financial futures with our independent guidance.'}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex flex-wrap justify-center gap-4">
          <StatBadge icon={Users} value="98%" label={s?.stats?.[0] || 'Satisfaction'} delay={0.9} />
          <StatBadge icon={Shield} value="$2.4B+" label={s?.stats?.[1] || 'Protected'} delay={1.0} />
          <StatBadge icon={TrendingUp} value="1,200+" label={s?.stats?.[2] || 'Families'} delay={1.1} />
        </motion.div>
      </div>
    </section>
  );
};
