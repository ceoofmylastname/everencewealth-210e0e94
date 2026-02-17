import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { TrustBadge } from '../shared/TrustBadge';
import { useTranslation } from '@/i18n/useTranslation';
import { Helmet } from 'react-helmet';

export const IULSpeakable: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.iul?.speakable;

  const speakableText = s?.text || 'Indexed Universal Life (IUL) insurance is a permanent life insurance policy that credits interest based on stock market index performance—typically the S&P 500—while guaranteeing you never lose money in down markets with a 0% floor. Unlike traditional investments, IUL offers tax-free withdrawals, living benefits for critical illness, and creditor protection, making it the cornerstone strategy for tax-efficient retirement planning.';

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "cssSelector": ".iul-speakable-content",
  };

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(speakableSchema)}</script>
      </Helmet>

      {/* Dot grid background */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, hsl(160,48%,21%) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <GlassCard className="p-10 md:p-16 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)]" glow tilt depth>
          <div className="iul-speakable-content" itemProp="speakable">
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
