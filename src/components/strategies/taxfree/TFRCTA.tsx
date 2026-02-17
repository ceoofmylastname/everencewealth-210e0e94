import React from 'react';
import { StrategyFormCTA } from '../shared/StrategyFormCTA';
import { useTranslation } from '@/i18n/useTranslation';

export const TFRCTA: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.taxFreeRetirement?.cta;

  return (
    <div id="tfr-cta">
      <StrategyFormCTA
        headline={s?.headline || 'Get Your Personalized Tax-Free Retirement Blueprint'}
        subtitle={s?.subtitle || 'See exactly how combining Roth IRAs, IUL, municipal bonds, and HSAs can create tax-free income for life—customized for your situation.'}
        submitText={s?.submitText || 'Get My Tax-Free Blueprint'}
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
