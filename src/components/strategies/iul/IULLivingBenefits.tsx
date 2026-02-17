import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Clock, MessageCircle } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { useTranslation } from '@/i18n/useTranslation';
import { FloatingParticles } from '../shared/FloatingParticles';

const benefits = [
  { icon: Heart, color: 'hsl(0,84%,60%)', title: 'Critical Illness', desc: 'Heart attack, stroke, cancer, organ transplant', benefit: 'Receive 25-100% of death benefit', example: '$500K policy → $250K cash for stroke recovery' },
  { icon: Activity, color: 'hsl(25,95%,53%)', title: 'Chronic Illness', desc: 'Unable to perform 2+ Activities of Daily Living', benefit: 'Monthly payments for long-term care', example: '$500K policy → $4K/month for nursing home' },
  { icon: Clock, color: 'hsl(270,67%,47%)', title: 'Terminal Illness', desc: 'Life expectancy 12-24 months or less', benefit: 'Receive up to 100% of death benefit early', example: '$500K policy → $500K to live with dignity' },
];

export const IULLivingBenefits: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.iul?.livingBenefits;

  return (
    <section className="py-24 md:py-32 overflow-hidden relative" style={{ background: 'linear-gradient(180deg, hsl(100,8%,95%) 0%, hsl(0,0%,100%) 100%)' }}>
      <FloatingParticles count={12} color="hsl(43,74%,49%)" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary text-center mb-5">
          {s?.title || 'Living Benefits: Insurance While You\'re Alive'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-lg md:text-xl text-muted-foreground text-center max-w-4xl mx-auto mb-16">
          {s?.subtitle || 'Unlike term life insurance that only pays when you die, IUL provides accelerated death benefit riders that pay out during your lifetime.'}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((b, i) => {
            const translatedBenefit = s?.cards?.[i];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <GlassCard className="p-8 h-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]" glow tilt>
                  <div className="w-full h-1 rounded-full mb-6" style={{ background: b.color, boxShadow: `0 0 20px ${b.color}40` }} />
                  <b.icon className="w-14 h-14 mb-5" style={{ color: b.color }} />
                  <h3 className="text-xl font-bold text-foreground mb-2">{translatedBenefit?.title || b.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{translatedBenefit?.desc || b.desc}</p>
                  <div className="rounded-xl bg-primary/5 p-3 mb-3">
                    <p className="text-sm font-semibold text-primary">{translatedBenefit?.benefit || b.benefit}</p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">{translatedBenefit?.example || b.example}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 max-w-4xl mx-auto">
          <GlassCard className="p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] border-[hsla(43,74%,49%,0.15)]" glow>
            <MessageCircle className="w-10 h-10 text-primary mb-4" />
            <p className="text-xl font-semibold text-primary mb-3">{s?.testimonial?.label || 'Real Client Story:'}</p>
            <p className="text-base text-muted-foreground leading-relaxed italic">
              {s?.testimonial?.text || '"When my husband had a stroke at 58, our IUL paid out $300,000 immediately. We used it for his rehabilitation, modified our home, and covered lost income. The death benefit is still intact. This saved our retirement."'}
            </p>
            <p className="text-sm text-muted-foreground mt-3">{s?.testimonial?.author || '— Maria T., San Francisco'}</p>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};
