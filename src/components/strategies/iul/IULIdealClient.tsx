import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Briefcase, Building, Users, MapPin, Shield, Lock, Calendar, DollarSign, Heart, TrendingDown } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { useTranslation } from '@/i18n/useTranslation';

const perfectFor = [
  { icon: Briefcase, text: 'High-income earners maxing out 401k/Roth contributions' },
  { icon: Building, text: 'Business owners wanting tax-free retirement income' },
  { icon: Users, text: 'Parents wanting to leave tax-free legacy to children' },
  { icon: MapPin, text: 'Anyone in high-tax state (CA, NY, NJ) seeking tax shelter' },
  { icon: Shield, text: 'Individuals worried about market volatility near retirement' },
  { icon: Lock, text: 'Those wanting asset protection from lawsuits/creditors' },
];

const notIdealFor = [
  { icon: Calendar, text: 'Those needing cash access within 5-7 years' },
  { icon: DollarSign, text: 'Anyone unable to commit to premiums for 10-15 years' },
  { icon: Heart, text: 'Individuals with serious health conditions (may not qualify)' },
  { icon: TrendingDown, text: 'Those seeking pure term insurance coverage' },
];

export const IULIdealClient: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.iul?.idealClient;

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(160,48%,21%) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary text-center mb-16">
          {s?.title || 'Is IUL Right for You?'}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="p-8 md:p-10 border-l-4 !border-l-primary shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),_0_0_40px_-10px_hsla(160,48%,30%,0.1)]" glow tilt>
            <div className="flex items-center gap-3 mb-7">
              <CheckCircle className="w-10 h-10 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{s?.perfectTitle || 'Perfect For:'}</h3>
            </div>
            <div className="space-y-4">
              {perfectFor.map((item, i) => {
                const translatedText = s?.perfect?.[i];
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }} className="flex items-start gap-3">
                    <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: i * 0.08 + 0.1 }}>
                      <item.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">{translatedText || item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-8 md:p-10 border-l-4 !border-l-destructive shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1),_0_0_40px_-10px_hsla(0,65%,50%,0.08)]" glow tilt>
            <div className="flex items-center gap-3 mb-7">
              <XCircle className="w-10 h-10 text-destructive" />
              <h3 className="text-2xl font-bold text-foreground">{s?.notIdealTitle || 'Not Ideal For:'}</h3>
            </div>
            <div className="space-y-4">
              {notIdealFor.map((item, i) => {
                const translatedText = s?.notIdeal?.[i];
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }} className="flex items-start gap-3">
                    <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: i * 0.08 + 0.1 }}>
                      <item.icon className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">{translatedText || item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};
