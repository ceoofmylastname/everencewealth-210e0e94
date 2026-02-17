import React from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { StrategyComparisonTable } from '../shared/StrategyComparisonTable';
import { useTranslation } from '@/i18n/useTranslation';

export const WLComparison: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.wholeLife?.comparison;

  const leftColumn = {
    title: s?.left?.title || 'Indexed Universal Life',
    color: 'green' as const,
    features: s?.left?.features || [
      { label: 'Growth Potential', value: 'Market-linked (capped 10-12%)', positive: true },
      { label: 'Downside Protection', value: '0% floor guarantee', positive: true },
      { label: 'Cash Value Growth', value: 'Variable, depends on index performance', positive: false },
      { label: 'Premium Flexibility', value: 'Flexible — adjust up or down', positive: true },
      { label: 'Dividends', value: 'None — index-credited interest only', positive: false },
      { label: 'Policy Loans', value: 'Available, variable loan rates', positive: true },
      { label: 'Death Benefit', value: 'Adjustable, can increase or decrease', positive: true },
      { label: 'Infinite Banking', value: 'Possible but less predictable', positive: false },
      { label: 'Best For', value: 'Growth-oriented, higher risk tolerance', positive: true },
    ],
  };

  const rightColumn = {
    title: s?.right?.title || 'Whole Life',
    color: 'green' as const,
    features: s?.right?.features || [
      { label: 'Growth Potential', value: 'Guaranteed rate + dividends (4-6%)', positive: true },
      { label: 'Downside Protection', value: 'Fully guaranteed — no market exposure', positive: true },
      { label: 'Cash Value Growth', value: 'Guaranteed minimum every year', positive: true },
      { label: 'Premium Flexibility', value: 'Fixed — same amount every year', positive: false },
      { label: 'Dividends', value: 'Annual dividends from mutual carriers', positive: true },
      { label: 'Policy Loans', value: 'Available, guaranteed fixed rates', positive: true },
      { label: 'Death Benefit', value: 'Guaranteed, never decreases', positive: true },
      { label: 'Infinite Banking', value: 'Ideal foundation — predictable & guaranteed', positive: true },
      { label: 'Best For', value: 'Conservative, stability-focused, legacy', positive: true },
    ],
  };

  return (
    <section id="wl-comparison" className="py-24 md:py-32 bg-white">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary text-center mb-16"
        >
          {s?.title || 'Whole Life vs. IUL: Side-by-Side'}
        </motion.h2>

        <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
          <StrategyComparisonTable leftColumn={leftColumn} rightColumn={rightColumn} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <GlassCard className="inline-block px-10 py-7" glow>
            <Scale className="w-12 h-12 mx-auto mb-3" style={{ color: 'hsl(43,74%,49%)' }} />
            <p className="text-2xl font-bold text-primary">
              {s?.winner || 'Choose Based on Your Goals'}
            </p>
            <p className="text-muted-foreground mt-1">
              {s?.winnerDesc || 'Both are powerful strategies—your ideal choice depends on your risk tolerance, timeline, and objectives'}
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};
