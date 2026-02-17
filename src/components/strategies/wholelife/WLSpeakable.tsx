import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { TrustBadge } from '../shared/TrustBadge';
import { useTranslation } from '@/i18n/useTranslation';
import { Helmet } from 'react-helmet';

export const WLSpeakable: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.wholeLife?.speakable;

  const speakableText = s?.text || 'Whole Life Insurance is a permanent life insurance policy that guarantees a fixed death benefit and builds cash value at a guaranteed rate for your entire life. Unlike term insurance or variable products, whole life offers predictable, guaranteed growth, tax-free dividend crediting from mutual carriers, and the ability to borrow against your policy—forming the foundation of the Infinite Banking Concept used by financially sophisticated families for over a century.';

  const speakableSchema = { "@context": "https://schema.org", "@type": "SpeakableSpecification", "cssSelector": ".wl-speakable-content" };

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <Helmet><script type="application/ld+json">{JSON.stringify(speakableSchema)}</script></Helmet>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, hsl(160,48%,21%) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <GlassCard className="p-10 md:p-16 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)]" glow tilt depth>
          <div className="wl-speakable-content" itemProp="speakable">
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-xl md:text-2xl leading-relaxed text-muted-foreground font-light text-center">
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
