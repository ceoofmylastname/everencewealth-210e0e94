import React from 'react';
import { StrategyFormCTA } from '../shared/StrategyFormCTA';
import { useTranslation } from '@/i18n/useTranslation';

export const WLCTA: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.wholeLife?.cta;

  return (
    <div id="wl-cta">
      <StrategyFormCTA
        headline={s?.headline || 'Get Your Personalized Whole Life Illustration'}
        subtitle={s?.subtitle || 'See exactly how whole life insurance can build guaranteed wealth, fund infinite banking, and create a tax-free legacy—customized for your situation.'}
        submitText={s?.submitText || 'Get My Whole Life Illustration'}
        disclaimer={s?.disclaimer || 'No spam. No high-pressure sales. Just real numbers for your situation.'}
        namePlaceholder={s?.namePlaceholder || 'Full Name'}
        emailPlaceholder={s?.emailPlaceholder || 'Email Address'}
        phonePlaceholder={s?.phonePlaceholder || 'Phone Number'}
        incomePlaceholder={s?.incomePlaceholder || 'Annual Income Range'}
        incomeRanges={s?.incomeRanges || ['$75K - $150K', '$150K - $250K', '$250K - $500K', '$500K+']}
      />
    </div>
  );
};
