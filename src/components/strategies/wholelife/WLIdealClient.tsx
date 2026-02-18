import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Shield, Briefcase, Building, Crown, Landmark, Heart, TrendingUp, DollarSign, Calendar, Zap } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { useTranslation } from '@/i18n/useTranslation';

const perfectFor = [
  { icon: Shield, text: 'Conservative investors who prioritize guarantees over market upside' },
  { icon: Briefcase, text: 'Business owners needing buy-sell agreement funding' },
  { icon: Building, text: 'Estate planners looking for guaranteed wealth transfer' },
  { icon: Landmark, text: 'Infinite banking enthusiasts who want to be their own bank' },
  { icon: Crown, text: 'High-net-worth families building multi-generational legacy' },
  { icon: Heart, text: 'Those who want predictable, guaranteed cash value growth' },
];

const notIdealFor = [
  { icon: TrendingUp, text: 'Those seeking maximum growth potential (IUL may be better)' },
  { icon: DollarSign, text: 'Budget-conscious individuals (whole life premiums are higher)' },
  { icon: Calendar, text: 'Young investors with 30+ year horizon who can tolerate volatility' },
  { icon: Zap, text: 'Those prioritizing premium flexibility over guarantees' },
];

export const WLIdealClient: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.wholeLife?.idealClient;

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#09301B] text-center mb-16"
        >
          {s?.title || 'Is Whole Life Right for You?'}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="p-8 md:p-10 border-l-4 !border-l-primary" glow>
            <div className="flex items-center gap-3 mb-7">
              <CheckCircle className="w-10 h-10 text-[#09301B]" />
              <h3 className="text-2xl font-bold text-foreground">{s?.perfectTitle || 'Perfect For:'}</h3>
            </div>
            <div className="space-y-4">
              {perfectFor.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <item.icon className="w-5 h-5 text-[#09301B] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{s?.perfect?.[i] || item.text}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-8 md:p-10 border-l-4 !border-l-destructive" glow>
            <div className="flex items-center gap-3 mb-7">
              <XCircle className="w-10 h-10 text-destructive" />
              <h3 className="text-2xl font-bold text-foreground">{s?.notIdealTitle || 'Not Ideal For:'}</h3>
            </div>
            <div className="space-y-4">
              {notIdealFor.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <item.icon className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{s?.notIdeal?.[i] || item.text}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};
