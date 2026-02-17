import React from 'react';
import { motion } from 'framer-motion';
import { StrategyComparisonTable } from '../shared/StrategyComparisonTable';
import { useTranslation } from '@/i18n/useTranslation';

export const APComparison: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.assetProtection?.comparison;

  const leftColumn = {
    title: 'Unprotected',
    color: 'red' as const,
    features: [
      { label: 'Lawsuit Exposure', value: 'All personal assets exposed to judgments', positive: false },
      { label: 'Creditor Access', value: 'Business debts can reach personal wealth', positive: false },
      { label: 'Divorce Risk', value: 'Up to 50% of assets subject to division', positive: false },
      { label: 'Estate Taxes', value: '40% tax on estates over $13.6M', positive: false },
      { label: 'Nursing Home', value: 'Must spend down assets to qualify for Medicaid', positive: false },
      { label: 'Privacy', value: 'Assets in personal name are public record', positive: false },
      { label: 'Control', value: 'Court can freeze and seize assets', positive: false },
      { label: 'Legacy', value: 'Heirs inherit lawsuits and tax burdens', positive: false },
    ],
  };

  const rightColumn = {
    title: 'Protected',
    color: 'green' as const,
    features: [
      { label: 'Lawsuit Exposure', value: 'Assets inside trusts/LLCs beyond judgment reach', positive: true },
      { label: 'Creditor Access', value: 'Charging order protection blocks creditor seizure', positive: true },
      { label: 'Divorce Risk', value: 'Trust assets excluded from marital estate', positive: true },
      { label: 'Estate Taxes', value: 'ILIT removes insurance from taxable estate', positive: true },
      { label: 'Nursing Home', value: 'Irrevocable trusts protect assets from Medicaid spend-down', positive: true },
      { label: 'Privacy', value: 'Trust and LLC ownership shields identity', positive: true },
      { label: 'Control', value: 'Trustee manages assets per your instructions', positive: true },
      { label: 'Legacy', value: 'Heirs receive protected, tax-efficient inheritance', positive: true },
    ],
  };

  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary text-center mb-16"
        >
          {s?.title || 'Protected vs. Unprotected: Side-by-Side'}
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
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold">
            ✦ {s?.winner || 'Proper Structure Protects Your Legacy'}
          </span>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
            {s?.winnerDesc || 'The difference between protected and unprotected wealth isn\'t luck—it\'s planning. The right structures keep your assets safe while you\'re alive and pass them efficiently to your heirs.'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
