import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { TrustBadge } from '../shared/TrustBadge';
import { useTranslation } from '@/i18n/useTranslation';
import { Helmet } from 'react-helmet';

export const APSpeakable: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.assetProtection?.speakable;

  const speakableText = s?.text || 'Asset Protection is a proactive legal and financial strategy that shields your wealth from lawsuits, creditors, divorce settlements, estate taxes, and long-term care costs. By structuring assets inside Irrevocable Life Insurance Trusts (ILITs), Family Limited Partnerships (FLPs), IUL cash value accounts, and annuities, you create multiple layers of legal protection that keep your wealth safe—while still providing tax-advantaged growth and income in retirement.';

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "cssSelector": ".ap-speakable-content",
  };

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(speakableSchema)}</script>
      </Helmet>

      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(160,48%,21%) 1px, transparent 1px), linear-gradient(90deg, hsl(160,48%,21%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <GlassCard className="p-10 md:p-16" glow>
          <div className="ap-speakable-content" itemProp="speakable">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl leading-relaxed text-muted-foreground font-light text-center"
            >
              {speakableText}
            </motion.p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-8">
            <TrustBadge icon={Shield} text={s?.badges?.[0] || 'Licensed in 50 States'} delay={0} />
            <TrustBadge icon={Award} text={s?.badges?.[1] || '75+ Carrier Partners'} delay={0.1} />
            <TrustBadge icon={Users} text={s?.badges?.[2] || '1,200+ Families Served'} delay={0.2} />
          </div>
        </GlassCard>
      </div>
    </section>
  );
};
