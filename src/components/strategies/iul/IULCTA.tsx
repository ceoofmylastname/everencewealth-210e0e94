import React from 'react';
import { StrategyFormCTA } from '../shared/StrategyFormCTA';
import { useTranslation } from '@/i18n/useTranslation';

export const IULCTA: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.iul?.cta;

  return (
    <div id="iul-cta">
      <StrategyFormCTA
        headline={s?.headline || 'See Your Personalized IUL Illustration'}
        subtitle={s?.subtitle || 'Get a custom projection showing exactly how IUL would work for your age, income, and retirement goals—with zero obligation.'}
        submitText={s?.submitText || 'Get My Custom IUL Illustration'}
        disclaimer={s?.disclaimer || 'No spam. No high-pressure sales. Just real numbers for your situation.'}
        namePlaceholder={s?.namePlaceholder || 'Full Name'}
        emailPlaceholder={s?.emailPlaceholder || 'Email Address'}
        phonePlaceholder={s?.phonePlaceholder || 'Phone Number'}
        incomePlaceholder={s?.incomePlaceholder || 'Annual Income Range'}
        incomeRanges={s?.incomeRanges || ['$75K - $150K', '$150K - $250K', '$250K - $500K', '$500K+']}
        formSource="Index Strategy"
      />
    </div>
  );
};
