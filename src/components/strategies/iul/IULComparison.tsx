import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { StrategyComparisonTable } from '../shared/StrategyComparisonTable';
import { useTranslation } from '@/i18n/useTranslation';

export const IULComparison: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.iul?.comparison;

  const leftColumn = {
    title: s?.left?.title || '401k',
    color: 'red' as const,
    features: s?.left?.features || [
      { label: 'Growth Potential', value: 'Market-linked (uncapped)', positive: true },
      { label: 'Downside Protection', value: 'None (full market risk)', positive: false },
      { label: 'Tax Treatment', value: 'Tax-deferred (pay later)', positive: false },
      { label: 'Early Access', value: '10% penalty before 59½', positive: false },
      { label: 'RMDs', value: 'Required at age 73', positive: false },
      { label: 'Contribution Limits', value: '$23,000/year (2024)', positive: false },
      { label: 'Living Benefits', value: 'None', positive: false },
      { label: 'Creditor Protection', value: 'State-dependent', positive: false },
      { label: 'Death Benefit', value: 'Account balance only', positive: false },
    ],
  };

  const rightColumn = {
    title: s?.right?.title || 'Indexed Universal Life',
    color: 'green' as const,
    features: s?.right?.features || [
      { label: 'Growth Potential', value: 'Index-linked (capped 10-12%)', positive: true },
      { label: 'Downside Protection', value: '0% floor guarantee', positive: true },
      { label: 'Tax Treatment', value: 'Tax-free (never taxed)', positive: true },
      { label: 'Early Access', value: 'No penalties, any age', positive: true },
      { label: 'RMDs', value: 'Never required', positive: true },
      { label: 'Contribution Limits', value: 'Based on income ($50K-$100K+)', positive: true },
      { label: 'Living Benefits', value: 'Critical, chronic, terminal illness', positive: true },
      { label: 'Creditor Protection', value: 'Strong in most states', positive: true },
      { label: 'Death Benefit', value: 'Guaranteed payout (often 5-10x)', positive: true },
    ],
  };

  return (
    <section id="iul-comparison" className="py-24 md:py-32 bg-white">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary text-center mb-16"
        >
          {s?.title || 'IUL vs. 401k: Side-by-Side'}
        </motion.h2>

        <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
          <StrategyComparisonTable leftColumn={leftColumn} rightColumn={rightColumn} />
        </div>

        {/* Winner badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <GlassCard className="inline-block px-10 py-7" glow>
            <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: 'hsl(43,74%,49%)' }} />
            <p className="text-2xl font-bold text-primary">
              {s?.winner || 'Winner: IUL for Tax-Free Retirement'}
            </p>
            <p className="text-muted-foreground mt-1">
              {s?.winnerDesc || 'Combines growth, protection, and flexibility 401k can\'t match'}
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};
