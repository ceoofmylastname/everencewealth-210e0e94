import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Landmark } from 'lucide-react';
import { MorphingBlob } from '@/components/philosophy/MorphingBlob';
import { StatBadge } from '../shared/StatBadge';
import { useTranslation } from '@/i18n/useTranslation';

export const APHero: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.assetProtection?.hero;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 60%, hsl(160,48%,5%) 100%)' }}>
      <MorphingBlob className="absolute top-[-150px] right-[-100px] w-[600px] h-[600px] opacity-20" colors={['hsl(160,48%,30%)', 'hsl(43,74%,49%)']} morphSpeed={10000} />
      <MorphingBlob className="absolute bottom-[-200px] left-[-150px] w-[500px] h-[500px] opacity-10" colors={['hsl(160,48%,25%)', 'hsl(160,48%,35%)']} morphSpeed={12000} />

      <div className="container max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="w-16 h-0.5 mx-auto mb-6"
          style={{ background: 'hsl(43,74%,49%)' }}
        />

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 border"
          style={{ borderColor: 'hsl(43,74%,49%,0.4)', color: 'hsl(43,74%,49%)' }}
        >
          {s?.badge || 'Strategy'}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-5 tracking-tight"
        >
          {s?.title || 'Asset Protection'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl md:text-2xl text-white/80 mb-4 max-w-3xl mx-auto"
        >
          {s?.subtitle || 'Protect Everything You\'ve Built'}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="text-base md:text-lg text-white/60 mb-10 max-w-4xl mx-auto"
        >
          {s?.description || 'Shield your wealth from lawsuits, creditors, divorce, and estate taxes using trusts, LLCs, IUL, and annuities—before it\'s too late.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4 mb-10"
        >
          <StatBadge icon={Shield} value={s?.stats?.[0]?.value || 'Lawsuit-Proof'} label={s?.stats?.[0]?.label || 'Legal Shield'} delay={0.9} />
          <StatBadge icon={Lock} value={s?.stats?.[1]?.value || 'Creditor-Protected'} label={s?.stats?.[1]?.label || 'Asset Fortress'} delay={1.0} />
          <StatBadge icon={Landmark} value={s?.stats?.[2]?.value || 'Estate Tax-Free'} label={s?.stats?.[2]?.label || 'Legacy Intact'} delay={1.1} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <a
            href="#ap-cta"
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, hsl(43,74%,49%) 0%, hsl(43,74%,55%) 100%)', color: 'hsl(160,48%,12%)' }}
          >
            {s?.ctaPrimary || 'Get Your Protection Plan'}
          </a>
          <a
            href="#ap-threats"
            className="px-8 py-4 rounded-xl font-bold text-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
          >
            {s?.ctaSecondary || 'See How It Works'}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-1 rounded-full bg-white/60"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
