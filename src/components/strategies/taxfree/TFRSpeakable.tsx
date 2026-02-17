import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { TrustBadge } from '../shared/TrustBadge';
import { useTranslation } from '@/i18n/useTranslation';
import { Helmet } from 'react-helmet';

export const TFRSpeakable: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.taxFreeRetirement?.speakable;

  const speakableText = s?.text || 'Tax-Free Retirement is a comprehensive strategy that combines multiple tax-exempt vehicles—Roth IRAs, Indexed Universal Life (IUL) insurance, municipal bonds, and Health Savings Accounts (HSAs)—to create a retirement income stream that is 100% free from federal and state income taxes. Unlike traditional 401(k) and pension income that is fully taxable, this approach eliminates Required Minimum Distributions (RMDs), avoids Social Security taxation triggers, and provides predictable, tax-free cash flow for life.';

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "cssSelector": ".tfr-speakable-content",
  };

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(speakableSchema)}</script>
      </Helmet>

      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(160,48%,21%) 1px, transparent 1px), linear-gradient(90deg, hsl(160,48%,21%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <GlassCard className="p-10 md:p-16" glow>
          <div className="tfr-speakable-content" itemProp="speakable">
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
