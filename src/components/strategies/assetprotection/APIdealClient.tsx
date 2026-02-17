import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Briefcase, Stethoscope, Building, Crown, Gavel, Landmark, Wallet, Clock, AlertTriangle, UserX } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { useTranslation } from '@/i18n/useTranslation';

const perfectFor = [
  { icon: Briefcase, text: 'Business owners with personal liability exposure' },
  { icon: Stethoscope, text: 'Medical professionals, surgeons, and dentists' },
  { icon: Building, text: 'Real estate investors with multiple properties' },
  { icon: Crown, text: 'High-net-worth families with $1M+ in assets' },
  { icon: Gavel, text: 'Those in litigious professions (law, construction, finance)' },
  { icon: Landmark, text: 'Estate planners seeking tax-efficient wealth transfer' },
];

const notIdealFor = [
  { icon: Wallet, text: 'Those with minimal assets (under $250K net worth)' },
  { icon: Clock, text: 'Early career professionals with low current net worth' },
  { icon: AlertTriangle, text: 'Those already in active litigation (planning must happen before threats)' },
  { icon: UserX, text: 'Those unwilling to restructure asset ownership' },
];

export const APIdealClient: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.assetProtection?.idealClient;

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary text-center mb-16"
        >
          {s?.title || 'Is Asset Protection Right for You?'}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="p-8 md:p-10 border-l-4 !border-l-primary" glow>
            <div className="flex items-center gap-3 mb-7">
              <CheckCircle className="w-10 h-10 text-primary" />
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
                  <item.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
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
