import React from 'react';
import { StrategyFormCTA } from '../shared/StrategyFormCTA';
import { useTranslation } from '@/i18n/useTranslation';

export const APCTA: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.assetProtection?.cta;

  return (
    <div id="ap-cta">
      <StrategyFormCTA
        headline={s?.headline || 'Get Your Personalized Asset Protection Blueprint'}
        subtitle={s?.subtitle || 'See exactly how trusts, LLCs, IUL, and annuities can shield your wealth from lawsuits, creditors, and estate taxes—customized for your situation.'}
        submitText={s?.submitText || 'Get My Protection Blueprint'}
        disclaimer={s?.disclaimer || 'No spam. No high-pressure sales. Just real numbers for your situation.'}
        namePlaceholder={s?.namePlaceholder || 'Full Name'}
        emailPlaceholder={s?.emailPlaceholder || 'Email Address'}
        phonePlaceholder={s?.phonePlaceholder || 'Phone Number'}
        incomePlaceholder={s?.incomePlaceholder || 'Total Net Worth Range'}
        incomeRanges={s?.incomeRanges || ['$250K - $500K', '$500K - $1M', '$1M - $5M', '$5M+']}
      />
    </div>
  );
};
