import React from 'react';
import { motion } from 'framer-motion';
import { StrategyComparisonTable } from '../shared/StrategyComparisonTable';
import { useTranslation } from '@/i18n/useTranslation';

export const TFRComparison: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.taxFreeRetirement?.comparison;

  const leftColumn = {
    title: 'Traditional (Taxable)',
    color: 'red' as const,
    features: [
      { label: 'Income Tax', value: 'All withdrawals taxed as ordinary income', positive: false },
      { label: 'RMDs', value: 'Forced withdrawals starting at age 73', positive: false },
      { label: 'Social Security Impact', value: 'Can trigger up to 85% taxation of benefits', positive: false },
      { label: 'Medicare Premiums', value: 'IRMAA surcharges on higher income', positive: false },
      { label: 'Estate Transfer', value: 'Heirs pay income tax on inherited IRAs within 10 years', positive: false },
      { label: 'Tax Rate Risk', value: 'Subject to future tax rate increases', positive: false },
      { label: 'Income Predictability', value: 'After-tax income depends on future tax law', positive: false },
    ],
  };

  const rightColumn = {
    title: 'Tax-Free Stack',
    color: 'green' as const,
    features: [
      { label: 'Income Tax', value: '$0 in federal/state income taxes on withdrawals', positive: true },
      { label: 'RMDs', value: 'No required distributions—withdraw on your terms', positive: true },
      { label: 'Social Security Impact', value: 'Tax-free income doesn\'t trigger SS taxation', positive: true },
      { label: 'Medicare Premiums', value: 'Tax-free income avoids IRMAA surcharges', positive: true },
      { label: 'Estate Transfer', value: 'IUL death benefit passes income-tax-free', positive: true },
      { label: 'Tax Rate Risk', value: 'Immune to future tax rate increases', positive: true },
      { label: 'Income Predictability', value: 'Guaranteed, predictable after-tax cash flow', positive: true },
    ],
  };

  return (
    <section id="tfr-comparison" className="py-24 md:py-32 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#09301B] text-center mb-16"
        >
          {s?.title || 'Taxable vs. Tax-Free: Side-by-Side'}
        </motion.h2>

        <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-border overflow-hidden">
          <StrategyComparisonTable leftColumn={leftColumn} rightColumn={rightColumn} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-[#09301B] font-semibold">
            ✦ {s?.winner || 'Tax-Free Strategy Wins Over Time'}
          </span>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
            {s?.winnerDesc || 'The longer your retirement, the more you save. Over 30 years, tax-free income can mean hundreds of thousands of dollars kept in your pocket instead of sent to the IRS.'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
