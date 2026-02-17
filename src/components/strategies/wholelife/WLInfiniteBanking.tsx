import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, RotateCcw, Crown, MessageCircle } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { useTranslation } from '@/i18n/useTranslation';

const concepts = [
  { icon: Landmark, color: 'hsl(43,74%,49%)', title: 'Be Your Own Bank', desc: 'Instead of borrowing from banks and paying them interest, borrow from your own policy. Your cash value continues earning dividends on the full balance—even while you use the money.', example: 'Borrow $50K for a car → pay yourself back → recapture all the interest you would have given to a bank.' },
  { icon: RotateCcw, color: 'hsl(160,48%,35%)', title: 'Recapture Interest', desc: 'Every dollar you finance through banks—cars, homes, education—you lose the interest AND the opportunity cost of that money. Infinite banking lets you recapture both.', example: 'Over a lifetime, the average American pays $500K+ in interest to banks. Infinite banking redirects that wealth back to your family.' },
  { icon: Crown, color: 'hsl(270,67%,47%)', title: 'Generational Wealth', desc: 'Whole life policies can be structured to fund future generations. The death benefit passes income-tax-free, and policies can be transferred or used as collateral for family wealth building.', example: 'A $1M whole life policy purchased at age 35 can provide $2M+ tax-free death benefit and $800K+ in accessible cash value by age 65.' },
];

export const WLInfiniteBanking: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.wholeLife?.infiniteBanking;

  return (
    <section className="py-24 md:py-32 overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(100,8%,95%) 0%, hsl(0,0%,100%) 100%)' }}>
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary text-center mb-5"
        >
          {s?.title || 'The Infinite Banking Concept'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-muted-foreground text-center max-w-4xl mx-auto mb-16"
        >
          {s?.subtitle || 'Use your whole life policy as your own private banking system—financing purchases, recapturing interest, and building multi-generational wealth.'}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {concepts.map((c, i) => {
            const translated = s?.cards?.[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                style={{ perspective: '1000px' }}
              >
                <GlassCard className="p-8 h-full transition-transform duration-500 hover:[transform:rotateY(2deg)_rotateX(2deg)]" glow>
                  <c.icon className="w-14 h-14 mb-5" style={{ color: c.color }} />
                  <h3 className="text-xl font-bold text-foreground mb-2">{translated?.title || c.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{translated?.desc || c.desc}</p>
                  <div className="rounded-xl bg-primary/5 p-3">
                    <p className="text-xs text-muted-foreground italic">{translated?.example || c.example}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <GlassCard className="p-10" glow>
            <MessageCircle className="w-10 h-10 text-primary mb-4" />
            <p className="text-xl font-semibold text-primary mb-3">{s?.testimonial?.label || 'Infinite Banking Success Story:'}</p>
            <p className="text-base text-muted-foreground leading-relaxed italic">
              {s?.testimonial?.text || '"We\'ve financed three cars, a rental property down payment, and our daughter\'s college through our whole life policy. Every dollar we \'borrowed\' continued earning dividends, and we paid ourselves back instead of a bank. In 12 years, our cash value has grown to $380,000 while we used it the entire time."'}
            </p>
            <p className="text-sm text-muted-foreground mt-3">{s?.testimonial?.author || '— David & Lisa R., Dallas'}</p>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};
